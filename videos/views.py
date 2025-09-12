from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from videos.models import Video, VideoChat
import re


@api_view(['POST'])
def process_video(request):
    video_url = request.data.get('videoUrl', '')
    query = request.data.get('query', '')
    chat_id = request.data.get('chatId')
    
    # Validate URL format
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if video_url and not url_pattern.match(video_url):
        return Response({'error': 'Invalid URL format. Please provide a valid video URL.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if we're continuing an existing chat or starting a new one
    if chat_id:
        chat = VideoChat.objects.filter(id=chat_id, user=request.user).first()
        if chat:
            # Append to existing chat history
            chat.chat_history.append({'query': query, 'response': None})
            video = chat.video
        else:
            chat_id = None
    
    if not chat_id:
        # Check if video already exists for this user
        video = Video.objects.filter(
            video_path=video_url,
            uploaded_by=request.user
        ).first()
        
        if not video:
            # Create new video only if it doesn't exist
            video = Video.objects.create(
                video_path=video_url,
                title=query[:255],
                uploaded_by=request.user
            )
        
        # Create new chat for this video
        chat = VideoChat.objects.create(
            video=video,
            user=request.user,
            chat_history=[{'query': query, 'response': None}]
        )
    
    # Template response
    response_data = {
        'chatId': chat.id,
        'response': f"Based on the video analysis, here's what I found regarding your query: '{query}'. The video shows relevant content that addresses your question. Key insights include understanding of the main topic, visual elements, and contextual information.",
        'reasoning': "I analyzed the video frame by frame, extracting visual features and understanding the context. The analysis involved scene detection, object recognition, and temporal understanding to provide a comprehensive answer to your query.",
        'keyFrames': [
            {
                'timestamp': '00:15',
                'frame': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMTwvdGV4dD48L3N2Zz4=',
                'description': 'Opening scene showing the main subject'
            },
            {
                'timestamp': '00:45',
                'frame': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzQ0NCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMjwvdGV4dD48L3N2Zz4=',
                'description': 'Key moment demonstrating the concept'
            },
            {
                'timestamp': '01:20',
                'frame': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzU1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiI+RnJhbWUgMzwvdGV4dD48L3N2Zz4=',
                'description': 'Conclusion and summary'
            }
        ],
        'timestamps': [
            {'time': '00:00 - 00:30', 'description': 'Introduction and context setting'},
            {'time': '00:30 - 01:00', 'description': 'Main content and explanation'},
            {'time': '01:00 - 01:30', 'description': 'Examples and demonstrations'},
            {'time': '01:30 - 02:00', 'description': 'Summary and key takeaways'}
        ]
    }
    
    # Update chat history with response
    chat.chat_history[-1]['response'] = response_data
    chat.save()
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_chat_history(request):
    chats = VideoChat.objects.filter(user=request.user).select_related('video')
    
    history = []
    for chat in chats:
        history.append({
            'id': chat.id,
            'videoUrl': chat.video.video_path,
            'videoTitle': chat.video.title,
            'lastMessage': chat.chat_history[-1]['query'] if chat.chat_history else '',
            'updatedAt': chat.updated_at.isoformat(),
            'messageCount': len(chat.chat_history),
            'chat_history': chat.chat_history  # Include full chat history for loading
        })
    
    return Response({'chats': history}, status=status.HTTP_200_OK)