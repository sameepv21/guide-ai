from django.db import models
from django.conf import settings


class VideoMetadata(models.Model):
    """Stores extracted metadata from videos including audio and transcription"""

    meta_id = models.AutoField(primary_key=True)
    video = models.ForeignKey(
        "videos.Video",
        on_delete=models.PROTECT,
        related_name="metadata",
        db_column="video_id",
    )
    payload = models.JSONField(
        default=list,
        help_text="List containing audio_path, transcription_text, transcription_segments, chunk_id, video_id",
    )
    transcription_model = models.CharField(
        max_length=20,
        default="base",
        help_text="Transcription model used (e.g., Whisper-Base)",
    )
    processing_duration = models.FloatField(
        null=True, blank=True, help_text="Time taken to process in seconds"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "video_metadata"
        verbose_name = "Video Metadata"
        verbose_name_plural = "Video Metadata"

    def __str__(self):
        return f"Metadata for {self.video.title}"
