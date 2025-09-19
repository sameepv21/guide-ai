#!/usr/bin/env python3
"""
Test script for audio extraction and transcription.
Run this script to test the AudioProcessor functionality.

Usage:
    python3 ai_engine/test_audio.py <video_path>
"""
# TODO: Could be pytest file
import sys
import os
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from ai_engine.processors.audio_processor import AudioProcessor
from pathlib import Path
import json


def test_audio_processor(video_path):
    """Test the audio processor with a video file."""
    print(f"Testing AudioProcessor with video: {video_path}")
    print("-" * 50)

    # Initialize processor
    print("Initializing Whisper model (base)...")
    processor = AudioProcessor(whisper_model="base")

    # Process video
    print("Processing video...")
    result = processor.extract_video_metadata(video_path)

    # Display results
    print("\n" + "=" * 50)
    print("RESULTS:")
    print("=" * 50)

    print(f"\n1. Video Path: {result['video_path']}")
    print(f"2. Audio Path: {result['audio_path']}")

    print(f"\n3. Full Transcription:")
    print("-" * 30)
    print(result["transcription"]["text"])

    print(f"\n4. Transcription Segments (first 5):")
    print("-" * 30)
    segments = result["transcription"]["segments"][:5]
    for i, segment in enumerate(segments):
        print(
            f"   [{segment['start']:.1f}s - {segment['end']:.1f}s]: {segment['text']}"
        )

    if len(result["transcription"]["segments"]) > 5:
        print(
            f"   ... and {len(result['transcription']['segments']) - 5} more segments"
        )

    # Save transcription to file
    transcript_path = Path(video_path).with_suffix(".json")
    with open(transcript_path, "w") as f:
        json.dump(result["transcription"], f, indent=2)
    print(f"\n5. Full transcription saved to: {transcript_path}")

    print("\n" + "=" * 50)
    print("Test completed successfully!")

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ai_engine/test_audio.py <video_path>")
        print("Example: python3 ai_engine/test_audio.py media/videos/1/sample.mp4")
        sys.exit(1)

    video_path = sys.argv[1]

    if not Path(video_path).exists():
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)

    test_audio_processor(video_path)
