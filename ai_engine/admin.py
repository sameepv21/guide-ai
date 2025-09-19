from django.contrib import admin
from .models import VideoMetadata


@admin.register(VideoMetadata)
class VideoMetadataAdmin(admin.ModelAdmin):
    list_display = [
        "meta_id",
        "video",
        "transcription_model",
        "processing_duration",
        "created_at",
    ]
    list_filter = ["transcription_model", "created_at"]
    search_fields = ["video__title"]
    readonly_fields = ["created_at", "updated_at", "processing_duration"]

    fieldsets = (
        ("Video Information", {"fields": ("video",)}),
        ("Payload Data", {"fields": ("payload",)}),
        (
            "Processing Information",
            {"fields": ("transcription_model", "processing_duration")},
        ),
        ("Timestamps", {"fields": ("created_at", "updated_at")}),
    )
