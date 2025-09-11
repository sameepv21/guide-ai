from django.contrib import admin
from .models import Video, VideoChat, Experiment, Evaluation


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'uploaded_by', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['title', 'video_path']
    readonly_fields = ['uploaded_at']


@admin.register(VideoChat)
class VideoChatAdmin(admin.ModelAdmin):
    list_display = ['video', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_by', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['experiment', 'created_at']
    list_filter = ['created_at']
    readonly_fields = ['created_at']