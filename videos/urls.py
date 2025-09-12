from django.urls import path
from videos.views import process_video, get_chat_history

urlpatterns = [
    path('process/', process_video, name='process_video'),
    path('history/', get_chat_history, name='get_chat_history'),
]
