from django.db import models
from django.conf import settings


class VideoMetadata(models.Model):
    """Stores extracted metadata from videos including audio and transcription"""
    video = models.OneToOneField(
        'videos.Video', 
        on_delete=models.CASCADE, 
        related_name='metadata'
    )
    audio_path = models.CharField(max_length=500, help_text="Path to extracted audio file")
    transcription_text = models.TextField(help_text="Full transcription text")
    transcription_segments = models.JSONField(
        default=list, 
        help_text="Timestamped transcription segments"
    )
    whisper_model = models.CharField(
        max_length=20, 
        default='base',
        help_text="Whisper model used for transcription"
    )
    processing_duration = models.FloatField(
        null=True, 
        blank=True,
        help_text="Time taken to process in seconds"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Video Metadata"
        verbose_name_plural = "Video Metadata"
    
    def __str__(self):
        return f"Metadata for {self.video.title}"