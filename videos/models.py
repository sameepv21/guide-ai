from django.db import models
from django.conf import settings


class Video(models.Model):
    video_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='videos', db_column='user_id')
    title = models.CharField(max_length=255, blank=True)
    video_path = models.CharField(max_length=500)  # Keep for backward compatibility
    uploaded_at = models.DateTimeField(auto_now_add=True)
    chunked = models.BooleanField(default=False)

    class Meta:
        db_table = 'videos'
        ordering = ['-uploaded_at']


class VideoChunk(models.Model):
    chunk_id = models.AutoField(primary_key=True)
    video = models.ForeignKey(Video, on_delete=models.PROTECT, related_name='chunks', db_column='video_id')

    class Meta:
        db_table = 'video_chunks'


class ChatHistory(models.Model):
    chat_id = models.AutoField(primary_key=True)
    video = models.ForeignKey(Video, on_delete=models.PROTECT, related_name='chat_histories', db_column='video_id')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='chat_histories', db_column='user_id')
    payload = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_history'
        ordering = ['-updated_at']
