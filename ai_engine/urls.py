from django.urls import path
from . import views

app_name = "ai_engine"

urlpatterns = [
    path(
        "extract-video-metadata/",
        views.extract_video_audio,
        name="extract_video_metadata",
    ),  # Get video, audio and transcription
]
