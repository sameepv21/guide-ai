from django.contrib import admin
from .models import Video, ChatHistory, VideoChunk


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['video_id', 'title', 'user', 'uploaded_at', 'chunked']
    list_filter = ['uploaded_at', 'chunked']
    search_fields = ['title', 'video_path']
    readonly_fields = ['uploaded_at']


@admin.register(ChatHistory)
class ChatHistoryAdmin(admin.ModelAdmin):
    list_display = ['chat_id', 'video', 'user', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VideoChunk)
class VideoChunkAdmin(admin.ModelAdmin):
    list_display = ['chunk_id', 'video']
    list_filter = ['video']
    search_fields = ['video__title']