from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .processors.audio_processor import AudioProcessor
from pathlib import Path
from django.conf import settings
import json


@api_view(['POST'])
def extract_video_audio(request):
    """
    Process a video to extract audio and generate transcription.
    
    Expected request body:
    {
        "video_path": "path/to/video.mp4"
    }
    
    Returns:
    {
        "video_path": "path/to/original/video.mp4",
        "audio_path": "path/to/extracted/audio.mp3",
        "transcription": {
            "text": "Full transcript text",
            "segments": [
                {
                    "start": 0.0,
                    "end": 2.5,
                    "text": "Segment text"
                }
            ]
        }
    }
    """
    video_path = request.data.get('video_path')
    
    if not video_path:
        return Response({'error': 'video_path is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Convert relative path to absolute if needed
    if not Path(video_path).is_absolute():
        video_path = settings.MEDIA_ROOT / video_path
    
    # Initialize processor
    processor = AudioProcessor(whisper_model="base")
    
    # Process the video
    result = processor.extract_video_metadata(video_path)
    
    return Response(result, status=status.HTTP_200_OK)