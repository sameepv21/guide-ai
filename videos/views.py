from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from videos.models import Video, ChatHistory
from videos.utils import download_youtube_video, chunk_video_if_needed
from ai_engine.processors.audio_processor import AudioProcessor
from pathlib import Path
from django.conf import settings
import re
import os
import time
from moviepy.editor import AudioFileClip, concatenate_audioclips
from ai_engine.models import VideoMetadata


@api_view(["POST"])
def process_video(request):
    video_url = request.data.get("videoUrl", "")
    query = request.data.get("query", "")
    chat_id = request.data.get("chatId")

    # Validate URL format
    url_pattern = re.compile(
        r"^https?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})"  # ...or ip
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )

    if video_url and not url_pattern.match(video_url):
        return Response(
            {"error": "Invalid URL format. Please provide a valid video URL."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if we're continuing an existing chat or starting a new one
    if chat_id:
        chat = ChatHistory.objects.filter(chat_id=chat_id, user=request.user).first()
        if chat:
            # Append to existing chat history
            chat.payload.append({"query": query, "response": None})
            video = chat.video
        else:
            chat_id = None

    if not chat_id:
        # Create a new Video object to get an ID
        video = Video.objects.create(
            title=query[
                :255
            ],  # TODO: Dynamically update the title based on the question
            user=request.user,
            video_path="",  # Placeholder, will be updated after download
        )

        # Download video and save to user/video-specific directory
        local_video_path = download_youtube_video(
            video_url, request.user.user_id, video.video_id
        )

        # Update video path
        video.video_path = local_video_path
        video.save()

        was_chunked = chunk_video_if_needed(video)
        processor = AudioProcessor(whisper_model="base")

        if was_chunked:
            video_dir = (
                Path(settings.MEDIA_ROOT)
                / str(video.user.user_id)
                / str(video.video_id)
            )
            chunks_dir = video_dir / "chunks"

            audio_paths_to_cleanup = []
            payload_list = []
            total_processing_duration = 0
            for i, chunk in enumerate(video.chunks.all().order_by("chunk_id")):
                start_time = time.time()
                chunk_path = chunks_dir / f"chunk_{i:04d}.mp4"

                audio_path = processor.extract_audio(chunk_path)
                audio_paths_to_cleanup.append(audio_path)

                transcription_result = processor.transcribe_audio(Path(audio_path))
                total_processing_duration += time.time() - start_time

                payload_list.append(
                    {
                        "audio_path": os.path.relpath(audio_path, settings.MEDIA_ROOT),
                        "transcription_text": transcription_result["text"],
                        "transcription_segments": transcription_result["segments"],
                        "chunk_id": chunk.chunk_id,
                    }
                )

            VideoMetadata.objects.create(
                video=video,
                payload=payload_list,
                transcription_model=processor.model.name,
                processing_duration=total_processing_duration,
            )

            for path in audio_paths_to_cleanup:
                os.remove(path)
        else:
            # Process the whole video
            start_time = time.time()
            full_video_path = settings.MEDIA_ROOT / local_video_path

            audio_path = processor.extract_audio(full_video_path)
            transcription_result = processor.transcribe_audio(Path(audio_path))
            processing_duration = time.time() - start_time

            VideoMetadata.objects.create(
                video=video,
                payload=[
                    {
                        "audio_path": os.path.relpath(audio_path, settings.MEDIA_ROOT),
                        "transcription_text": transcription_result["text"],
                        "transcription_segments": transcription_result["segments"],
                    }
                ],
                transcription_model=processor.model.name,
                processing_duration=processing_duration,
            )
            os.remove(audio_path)

        # Create new chat for this video
        chat = ChatHistory.objects.create(
            video=video, user=request.user, payload=[{"query": query, "response": None}]
        )

    # Template response
    response_data = {
        "chatId": chat.chat_id,
        "response": f"Based on the video analysis, here's what I found regarding your query: '{query}'. The video shows relevant content that addresses your question. Key insights include understanding of the main topic, visual elements, and contextual information.",
        "reasoning": "I analyzed the video frame by frame, extracting visual features and understanding the context. The analysis involved scene detection, object recognition, and temporal understanding to provide a comprehensive answer to your query.",
        "keyFrames": [
            {
                "timestamp": "00:15",
                "frame": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMTwvdGV4dD48L3N2Zz4=",
                "description": "Opening scene showing the main subject",
            },
            {
                "timestamp": "00:45",
                "frame": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ0NCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMjwvdGV4dD48L3N2Zz4=",
                "description": "Key moment demonstrating the concept",
            },
            {
                "timestamp": "01:20",
                "frame": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzU1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMzwvdGV4dD48L3N2Zz4=",
                "description": "Conclusion and summary",
            },
        ],
        "timestamps": [
            {
                "time": "00:00 - 00:30",
                "description": "Introduction and context setting",
            },
            {"time": "00:30 - 01:00", "description": "Main content and explanation"},
            {"time": "01:00 - 01:30", "description": "Examples and demonstrations"},
            {"time": "01:30 - 02:00", "description": "Summary and key takeaways"},
        ],
    }

    # Update chat history with response
    chat.payload[-1]["response"] = response_data
    chat.save()

    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["GET"])
def get_chat_history(request):
    chats = ChatHistory.objects.filter(user=request.user).select_related("video")

    history = []
    for chat in chats:
        history.append(
            {
                "id": chat.chat_id,
                "videoUrl": chat.video.video_path,
                "videoTitle": chat.video.title,
                "lastMessage": chat.payload[-1]["query"] if chat.payload else "",
                "updatedAt": chat.updated_at.isoformat(),
                "messageCount": len(chat.payload),
                "chat_history": chat.payload,  # Include full chat history for loading
            }
        )

    return Response({"chats": history}, status=status.HTTP_200_OK)
