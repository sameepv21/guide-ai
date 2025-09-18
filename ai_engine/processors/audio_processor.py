import os
import time
from pathlib import Path

import whisper
from moviepy.editor import VideoFileClip
from django.conf import settings

from ai_engine.models import VideoMetadata
from videos.models import VideoChunk

# TODO: Use context manager to handle the video and audio files.
class AudioProcessor:
    """Handles audio extraction and transcription from videos"""
    
    def __init__(self, whisper_model="base"):
        """
        Initialize the audio processor with Whisper model.
        
        Args:
            whisper_model: Size of the Whisper model to use
                          Options: 'tiny', 'base', 'small', 'medium', 'large'
        """
        self.model_name = whisper_model
        self.whisper_model = whisper.load_model(whisper_model)
    
    def extract_video_metadata(self, video_path, save_to_db=False, video_obj=None):
        """
        Process a video file to extract audio and generate transcription.
        
        Args:
            video_path: Path to the video file
            save_to_db: Whether to save results to database
            video_obj: Video model instance (required if save_to_db=True)
            
        Returns:
            dict: Contains paths to muted video, extracted audio, and transcription
        """
        start_time = time.time()
        video_path = Path(video_path)
        
        # Validate video exists
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Extract audio and create muted video
        audio_path = self._extract_audio(video_path)
        
        # Generate transcription
        transcription = self._transcribe_audio(audio_path)
        
        processing_duration = time.time() - start_time
        
        # Save to database if requested
        if save_to_db and video_obj:
            # Convert absolute paths to relative for database storage
            relative_audio_path = str(audio_path).replace(str(settings.MEDIA_ROOT) + '/', '')
            
            # Get or create video chunk (one per non-chunked video, multiple for chunked)
            video_chunk, created = VideoChunk.objects.get_or_create(video=video_obj)
            
            # Create the chunk metadata payload
            chunk_data = {
                'audio_path': relative_audio_path,
                'transcription_text': transcription['text'],
                'transcription_segments': transcription['segments'],
                'chunk_id': video_chunk.chunk_id,
            }
            
            # Save metadata - either append to existing or create new
            if video_obj.chunked:
                # For chunked videos, append to existing metadata
                metadata, created = VideoMetadata.objects.get_or_create(
                    video=video_obj,
                    defaults={
                        'payload': [],
                        'transcription_model': self.model_name,
                        'processing_duration': 0
                    }
                )
                metadata.payload.append(chunk_data)
                metadata.processing_duration += processing_duration
                metadata.save()
            else:
                # For non-chunked videos, create new metadata with single entry
                VideoMetadata.objects.create(
                    video=video_obj,
                    payload=[chunk_data],
                    transcription_model=self.model_name,
                    processing_duration=processing_duration
                )
        
        return {
            'video_path': str(video_path),
            'audio_path': str(audio_path),
            'transcription': transcription,
            'processing_duration': processing_duration
        }
    
    def _extract_audio(self, video_path):
        """
        Extract audio from video and save it as a separate file.
        
        Args:
            video_path: Path to the video file
            
        Returns:
            Path: Path to the extracted audio file
        """
        # Load video
        video = VideoFileClip(str(video_path))
        
        # Extract audio
        audio = video.audio
        
        # Generate audio file path (same directory, .mp3 extension)
        audio_path = video_path.with_suffix('.mp3')
        
        # Save audio
        audio.write_audiofile(str(audio_path), logger=None)
        
        # Clean up
        video.close()
        audio.close()
        
        return audio_path
    
    def _transcribe_audio(self, audio_path):
        """
        Generate transcription from audio using Whisper.
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            dict: Transcription results including text and timestamps
        """
        # Transcribe with Whisper
        result = self.whisper_model.transcribe(str(audio_path))
        
        # Format the transcription with timestamps
        transcription = {
            'text': result['text'],
            'segments': []
        }
        
        # Extract segments with timestamps
        for segment in result.get('segments', []):
            transcription['segments'].append({
                'start': segment['start'],
                'end': segment['end'],
                'text': segment['text'].strip()
            })
        
        return transcription
    
    def get_muted_video(self, video_path, output_path=None):
        """
        Create a muted version of the video.
        
        Args:
            video_path: Path to the original video
            output_path: Optional path for the muted video
                        If not provided, will use _muted suffix
            
        Returns:
            Path: Path to the muted video file
        """
        video_path = Path(video_path)
        
        if output_path is None:
            # Generate output path with _muted suffix
            output_path = video_path.parent / f"{video_path.stem}_muted{video_path.suffix}"
        
        # Load video and remove audio
        video = VideoFileClip(str(video_path))
        video_without_audio = video.without_audio()
        
        # Save muted video
        video_without_audio.write_videofile(str(output_path), logger=None)
        
        # Clean up
        video.close()
        video_without_audio.close()
        
        return output_path
