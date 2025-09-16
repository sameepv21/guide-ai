import os
import uuid
import yt_dlp
from django.conf import settings


def download_youtube_video(url, user_id):
    """Download YouTube video and save to user-specific directory with random name."""
    # Create user-specific directory
    user_dir = os.path.join(settings.MEDIA_ROOT, 'videos', str(user_id))
    os.makedirs(user_dir, exist_ok=True)
    
    # Generate random filename
    random_filename = f"{uuid.uuid4().hex}.mp4"
    output_path = os.path.join(user_dir, random_filename)
    
    # Configure yt-dlp options with bot detection bypass
    ydl_opts = {
        'outtmpl': output_path,
        'format': 'best[ext=mp4]/best',
        'quiet': True,
        'no_warnings': True,
        # Add headers to mimic browser
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Accept-Encoding': 'gzip,deflate',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
            'Keep-Alive': '115',
            'Connection': 'keep-alive',
        },
        # Additional options to bypass detection
        # 'cookiesfrombrowser': ('chrome',),  # Commented out - causes macOS permission prompts
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'web'],  # Try different player clients
                'skip': ['hls', 'dash'],  # Skip adaptive formats
            }
        },
        'age_limit': None,  # No age restriction
        'geo_bypass': True,  # Bypass geographic restrictions
    }
    
    # Download video
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    
    # Return relative path from MEDIA_ROOT
    relative_path = os.path.relpath(output_path, settings.MEDIA_ROOT)
    return relative_path
