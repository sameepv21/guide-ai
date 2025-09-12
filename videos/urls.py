from django.urls import path
from videos.views import process_video

urlpatterns = [
    path('process/', process_video, name='process_video'),
]
