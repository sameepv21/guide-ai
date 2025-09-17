from django.contrib import admin
from .models import VideoMetadata


@admin.register(VideoMetadata)
class VideoMetadataAdmin(admin.ModelAdmin):
    list_display = ['video', 'whisper_model', 'processing_duration', 'created_at']
    list_filter = ['whisper_model', 'created_at']
    search_fields = ['video__title', 'transcription_text']
    readonly_fields = ['created_at', 'updated_at', 'processing_duration']
    
    fieldsets = (
        ('Video Information', {
            'fields': ('video', 'audio_path')
        }),
        ('Transcription', {
            'fields': ('transcription_text', 'transcription_segments', 'whisper_model')
        }),
        ('Metadata', {
            'fields': ('processing_duration', 'created_at', 'updated_at')
        })
    )