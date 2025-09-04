# guide-ai

A multimodal RAG system that actually understands video – not just transcripts, not just frames, but the temporal narrative that connects them.

> PS: This is an AI-generated README and may not be fully representative of what I am building. I have a plan to update it when there is a proper structure to the project.

## What This Is

guide-ai bridges the semantic gap between visual and linguistic understanding in video content. By combining Whisper-extracted transcripts with CLIP-encoded frames in a unified vector space, it enables natural language queries against video content with millisecond-level retri∆eval latency.

The system doesn't just find relevant moments – it explains its reasoning through Visual Chain of Thought, providing frame-level attributions that trace exactly how it arrived at each answer.

## Technical Architecture

### Core Pipeline
- **Audio Intelligence**: Whisper-based transcript extraction with temporal alignment
- **Visual Understanding**: CLIP encodings for semantic frame representation  
- **Retrieval Engine**: Vector database optimized for hybrid text-visual similarity search
- **Answer Generation**: Fine-tuned Vicuna-7B with LoRA adaptation for coherent response synthesis

### Key Innovations

**Visual Chain of Thought**: Each generated answer includes frame-level attributions, creating an interpretable reasoning path from query to response. You see not just what the model thinks, but why.

**Temporal Coherence**: A lightweight transformer adapter maintains instruction sequencing accuracy across temporal boundaries – crucial for understanding procedural content where order matters.

**Production-Ready Infrastructure**: Built on Django with Celery/Redis task orchestration, containerized via Docker-Compose, with Sentry integration for real-world monitoring.

## Performance Characteristics

- Sub-100ms retrieval latency for most queries
- Maintains coherence across 10+ minute videos
- Handles multimodal queries naturally (e.g., "Show me when they discuss the chart on screen")

## Architecture Decisions

We chose Vicuna-7B as our base model for its strong instruction-following capabilities while remaining computationally tractable. LoRA fine-tuning preserves the model's general knowledge while adapting it to video-grounded QA tasks with minimal parameter overhead.

The dual-encoder approach (Whisper + CLIP) was deliberate – rather than forcing everything through a single multimodal model, we leverage specialized encoders at what they do best, then fuse representations at the retrieval layer.

## Getting Started

```bash
docker-compose up -d
```

The system expects video inputs and returns structured responses with temporal grounding. See `/examples` for typical usage patterns.

## License

MIT
