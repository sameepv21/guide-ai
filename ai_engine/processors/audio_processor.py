import os
import whisper
from moviepy.editor import VideoFileClip
from pathlib import Path

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
        self.whisper_model = whisper.load_model(whisper_model)
    
    def extract_video_metadata(self, video_path):
        """
        Process a video file to extract audio and generate transcription.
        
        Args:
            video_path: Path to the video file
            
        Returns:
            dict: Contains paths to muted video, extracted audio, and transcription
        """
        video_path = Path(video_path)
        
        # Validate video exists
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")
        
        # Extract audio and create muted video
        audio_path = self._extract_audio(video_path)
        
        # Generate transcription
        transcription = self._transcribe_audio(audio_path)
        
        return {
            'video_path': str(video_path),
            'audio_path': str(audio_path),
            'transcription': transcription
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
