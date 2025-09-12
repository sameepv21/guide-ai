from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from videos.models import Video, VideoChat


@api_view(['POST'])
def process_video(request):
    video_url = request.data.get('videoUrl', '')
    query = request.data.get('query', '')
    
    # Create video record
    video = Video.objects.create(
        video_path=video_url,
        title=query[:255],
        uploaded_by=request.user
    )
    
    # Create chat record with query
    chat = VideoChat.objects.create(
        video=video,
        chat_history=[{'query': query, 'response': None}]
    )
    
    # Template response
    response_data = {
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
    chat.chat_history[0]['response'] = response_data
    chat.save()
    
    return Response(response_data, status=status.HTTP_200_OK)
