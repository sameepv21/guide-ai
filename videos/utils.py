import os
import uuid
import yt_dlp
from django.conf import settings
from moviepy.editor import VideoFileClip
from pathlib import Path


def download_youtube_video(url, user_id, video_id):
    """Download YouTube video and save to user-specific directory with random name."""
    # Create user-specific directory
    video_dir = os.path.join(settings.MEDIA_ROOT, str(user_id), str(video_id))
    os.makedirs(video_dir, exist_ok=True)

    # Generate random filename
    random_filename = f"{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(video_dir, random_filename)

    # Configure yt-dlp options with bot detection bypass
    ydl_opts = {
        "outtmpl": output_path,
        "format": "best[ext=mp4]/best",
        "quiet": True,
        "no_warnings": True,
        # Add headers to mimic browser
        "headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-us,en;q=0.5",
            "Accept-Encoding": "gzip,deflate",
            "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
            "Keep-Alive": "115",
            "Connection": "keep-alive",
        },
        # Additional options to bypass detection
        # 'cookiesfrombrowser': ('chrome',),  # Commented out - causes macOS permission prompts
        "extractor_args": {
            "youtube": {
                "player_client": ["android", "web"],  # Try different player clients
                "skip": ["hls", "dash"],  # Skip adaptive formats
            }
        },
        "age_limit": None,  # No age restriction
        "geo_bypass": True,  # Bypass geographic restrictions
    }

    # Download video
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # Return relative path from MEDIA_ROOT
    relative_path = os.path.relpath(output_path, settings.MEDIA_ROOT)
    return relative_path


def chunk_video_if_needed(video_obj):
    """Check video duration and chunk if longer than 5 minutes."""
    from videos.models import VideoChunk

    # Get full video path
    video_path = Path(settings.MEDIA_ROOT) / video_obj.video_path

    # Load video and get duration
    video = VideoFileClip(str(video_path))
    duration = video.duration  # in seconds
    video.close()

    # If video is 5 minutes or less, do nothing
    if duration <= 300:  # 300 seconds = 5 minutes
        VideoChunk.objects.create(video=video_obj)
        return False  # Not chunked

    # Video needs chunking - split into 5-minute segments
    chunk_duration = 300  # 5 minutes in seconds
    num_chunks = int(duration / chunk_duration) + (
        1 if duration % chunk_duration > 0 else 0
    )

    # Create directory for chunks
    video_dir = video_path.parent
    chunks_dir = video_dir / "chunks"
    chunks_dir.mkdir(exist_ok=True)

    # Load video again for chunking
    video = VideoFileClip(str(video_path))

    # Create chunks
    for i in range(num_chunks):
        start_time = i * chunk_duration
        end_time = min((i + 1) * chunk_duration, duration)

        # Extract chunk
        chunk = video.subclip(start_time, end_time)

        # Save chunk with index-based filename (use index for ordering)
        chunk_filename = f"chunk_{i:04d}.mp4"  # 4-digit zero-padded for proper sorting
        chunk_path = chunks_dir / chunk_filename
        chunk.write_videofile(
            str(chunk_path), logger=None, codec="libx264", audio_codec="aac"
        )
        chunk.close()

        # Create VideoChunk entry to track this chunk
        VideoChunk.objects.create(video=video_obj)

    video.close()

    # Mark video as chunked
    video_obj.chunked = True
    video_obj.save()

    return True  # Chunked
