# Guide AI - Change Log

## Session: September 16, 2025

### Feature Addition - Audio Extraction and Transcription with Whisper

#### What Changed:
- **AI Engine App**: Created new `ai_engine` Django app at root level
- **Audio Processor**: Implemented `AudioProcessor` class for audio extraction and transcription
- **Dependencies**: Added moviepy and openai-whisper for audio processing
- **Integration**: Integrated audio processing into video upload workflow
- **Test Script**: Created test_audio.py for standalone testing

#### Why Changed:
- Need to extract audio from videos for transcription
- Whisper provides accurate speech-to-text capabilities
- Foundation for multi-modal video analysis (text, audio, video)
- Enables timestamp-based content retrieval

#### Result:
- Automatically extracts audio (.mp3) when new video is uploaded
- Generates transcription with timestamps using Whisper
- Audio saved in same directory as video
- Transcription includes full text and timestamped segments
- Ready for RAG system integration

---

### Bug Fix - YouTube Bot Detection Bypass

#### What Changed:
- **Backend (Video Utils)**: Enhanced `download_youtube_video` function with bot detection bypass mechanisms
- Added browser-like headers (User-Agent, Accept headers, etc.)
- Configured to use Chrome browser cookies if available
- Added multiple player client fallbacks (android, web)
- Enabled geographic bypass and age limit removal

#### Why Changed:
- YouTube was detecting yt-dlp as a bot and blocking downloads
- Need to mimic real browser behavior to avoid detection
- Chrome cookies provide authenticated session if user is logged in

#### Result:
- Downloads work more reliably by mimicking browser behavior
- Automatically uses Chrome cookies if user is logged into YouTube
- Falls back to Android player client if web client fails
- Bypasses geographic and age restrictions

---

### Feature Addition - YouTube Video Download to Local Storage

#### What Changed:
- **Backend (Requirements)**: Added yt-dlp package for YouTube video downloading
- **Backend (Settings)**: Added MEDIA_ROOT and MEDIA_URL configuration for file storage
- **Backend (Video Utils)**: Created new `utils.py` with `download_youtube_video` function
- **Backend (Process Video View)**: Modified to download videos to user-specific directories
- **Data Storage**: Videos now stored locally instead of just saving URLs

#### Why Changed:
- Need to store actual video files for proper video processing capabilities
- Each user should have isolated storage for their videos
- Random naming prevents filename conflicts and improves security
- Local storage enables future frame extraction and analysis features

#### Result:
- YouTube videos are downloaded automatically when URL is provided
- Each user has a unique directory under `media/videos/<user_id>/`
- Videos are saved with random UUID filenames (e.g., `a3f4b2c1d5e6f7g8.mp4`)
- Database stores local file path instead of YouTube URL
- Downloaded videos are excluded from version control via .gitignore
- System maintains video deduplication based on local paths

---

## Session: September 15, 2025

### Feature Addition - User Profile Management with Email-Based Password Change

#### What Changed:
- **Backend (Views)**: Added profile management endpoints (GET/PUT for profile, password change with email verification)
- **Backend (URLs)**: Added routes for `/profile/`, `/request-password-change/`, `/change-password/`
- **Backend (Settings)**: Added email configuration (console backend for dev) and cache configuration (locmem)
- **Frontend (Profile Component)**: Created comprehensive profile management interface with edit mode and password change flow
- **Frontend (API Service)**: Added profileAPI methods for all profile operations
- **Frontend (Navigation)**: Added Profile route and navigation link in chat sidebar
- **Email Verification**: Implemented 6-digit code verification system using Django cache (5-minute TTL)

#### Why Changed:
- Users need ability to view and update their personal information
- Password change requires secure email verification to prevent unauthorized access
- Temporary code storage via cache avoids unnecessary database modifications
- Profile management is essential for user account control

#### Result:
- Users can view all their profile information (email, name, phone, join date)
- Users can edit personal info (except email) with inline editing
- Password change flow: Request code → Email sent → Enter code + new password → Change successful
- Verification codes expire after 5 minutes for security
- Clean UI with edit/save states and proper error handling
- Email notifications printed to console in development

---

### Feature Addition - US Phone Number Support in User Registration

#### What Changed:
- **Backend (User Model)**: Added `phone_number` field with US format validation (10 digits)
- **Backend (Signup View)**: Updated to accept and save phone number during registration
- **Frontend (Signup Component)**: Added phone number input field with real-time validation
- **Frontend (API Service)**: Updated signup method to include phone number parameter
- **Admin Interface**: Added phone number to list display, search fields, and forms

#### Why Changed:
- User requested phone number collection during signup for enhanced user profile information
- Needed US-specific phone number validation to ensure data quality
- Required for potential future features like SMS notifications or two-factor authentication

#### Result:
- Users can now provide their US phone number during registration
- Phone numbers are validated for 10-digit US format (supports various input formats)
- Phone numbers are displayed in admin interface for user management
- Backend stores phone numbers in standardized 10-digit format
- Field is optional to maintain backward compatibility

---

## Session: September 14, 2025

### Documentation Update - Data Flow Architecture

#### What Changed:
- **Documentation (`.cursor/rules/guideai.mdc`)**: Complete rewrite with comprehensive data flow documentation

#### Why Changed:
- Previous documentation lacked clear explanation of how data flows through the system
- No comprehensive overview of the execution flow and system architecture
- Developers needed better understanding of component interactions and state management

#### Result:
- Added detailed data flow diagrams for all major system processes
- Documented authentication flow, video processing flow, and chat continuation flow
- Added state management architecture explanation
- Included component hierarchy and interaction patterns
- Provided clear API communication layer documentation
- Added development workflow instructions
- Documented all current features, limitations, and planned improvements

---

## Session: September 12, 2025

### Overview
Fixed 4 major issues related to video duplication, chat session management, session persistence, and chat history accessibility. Additionally, implemented URL validation and TypeScript type safety improvements.

---

## Changes Made

### 1. Video Deduplication & Smart Session Management

#### What Changed:
- **Backend (`videos/views.py`)**: Modified `process_video` to check if video with same URL already exists for user
- **Backend (`videos/models.py`)**: Added `user` field to `VideoChat` model to track chat ownership
- **Frontend (`ChatInterface.tsx`)**: Added chat session tracking with `currentChatId` and `currentVideoUrl` states

#### Why Changed:
- Previously, uploading the same video or pasting the same URL created duplicate database entries
- No way to continue conversations without creating new video entries
- Database would grow unnecessarily with redundant data

#### Result:
- Videos are now reused when same URL is processed by same user
- Continuing a conversation appends to existing chat history instead of creating new entries
- Database remains efficient with no duplicate videos

---

### 2. Session Persistence

#### What Changed:
- **Frontend (`App.tsx`)**: Added localStorage to persist authentication state
- **Frontend (`ChatInterface.tsx`)**: Added localStorage cleanup on logout

#### Why Changed:
- Users were required to login again every time they opened the website
- Session state was only kept in memory, lost on page refresh

#### Result:
- Users remain logged in across page refreshes and browser sessions
- Logout properly clears stored session data
- Better user experience with persistent authentication

---

### 3. Chat History Accessibility

#### What Changed:
- **Backend (`videos/views.py`)**: Created new `get_chat_history` endpoint returning user's chat history
- **Backend (`videos/urls.py`)**: Added route for `/api/videos/history/`
- **Frontend (`ChatInterface.tsx`)**: 
  - Added "View previous chats" clickable button showing chat count
  - Implemented chat history viewer with list of previous conversations
  - Added `loadPreviousChat` function to restore full conversations
- **Frontend (`api.ts`)**: Added `getChatHistory` API method

#### Why Changed:
- "You have previous chats" was just plain text, not actionable
- No way to access or view previous conversations
- Users couldn't continue old chats or reference past discussions

#### Result:
- Clickable button shows number of previous chats
- Full chat history viewer displays all past conversations with metadata
- Users can click any previous chat to load and continue it
- Seamless switching between different chat sessions

---

### 4. New Chat Functionality

#### What Changed:
- **Frontend (`ChatInterface.tsx`)**: Added "New Chat" button with `handleNewChat` function
- Clears all conversation state and resets to fresh session

#### Why Changed:
- No way to start a fresh conversation without reloading the page
- Users needed ability to start new topics without losing history

#### Result:
- Prominent "New Chat" button in sidebar
- Cleanly starts new conversation while preserving all history
- Refreshes chat history list after creating new chat

---

### 5. UI/UX Improvements

#### What Changed:
- **Frontend (`ChatInterface.tsx`)**: Added `cursor-pointer` class to all clickable elements
- Fixed cursor display on buttons and interactive elements

#### Why Changed:
- Clickable elements didn't show hand cursor on hover
- Poor visual feedback for interactive elements

#### Result:
- All buttons and clickable items show proper hand cursor
- Better user experience with clear visual affordances

---

### 6. TypeScript Type Safety

#### What Changed:
- **Frontend (`ChatInterface.tsx`)**: 
  - Created `ChatHistoryItem` interface with proper typing
  - Changed `currentChatId` from `number | null` to `number | undefined`
  - Removed all `any` type usage

#### Why Changed:
- TypeScript errors with type mismatches
- Using `any` defeats purpose of TypeScript
- API expected `undefined` not `null` for optional parameters

#### Result:
- Full type safety throughout the component
- No TypeScript errors or warnings
- Better IDE support and error prevention

---

### 7. URL Validation

#### What Changed:
- **Backend (`videos/views.py`)**: Added regex pattern validation for URLs
- **Frontend (`ChatInterface.tsx`)**: 
  - Added client-side URL format validation
  - Enhanced error handling for 400 status codes

#### Why Changed:
- No validation for URL format could cause errors downstream
- Users could submit invalid URLs that would fail processing
- Poor error messages didn't help users understand the problem

#### Result:
- Two-layer validation (client and server) for reliability
- Clear error messages guide users to correct format
- URLs must start with http:// or https://
- Prevents invalid data from entering the system

---

### 8. Database Migration

#### What Changed:
- **Backend (`videos/models.py`)**: Made `user` field nullable to handle existing data
- Created migration file `0002_videochat_user.py`

#### Why Changed:
- Adding required field to existing model needed migration
- Existing VideoChat records (if any) needed default handling

#### Result:
- Clean migration path for database schema update
- Existing data preserved with null user values
- New chats always have user association

---

## Technical Summary

### Files Modified:
- **Backend**: `videos/models.py`, `videos/views.py`, `videos/urls.py`, `videos/migrations/0002_videochat_user.py`
- **Frontend**: `App.tsx`, `ChatInterface.tsx`, `api.ts`
- **Documentation**: `.cursor/rules/guideai.mdc`

### Key Improvements:
1. **Data Efficiency**: Eliminated duplicate video entries
2. **User Experience**: Persistent sessions and accessible chat history
3. **Code Quality**: Full TypeScript type safety
4. **Data Integrity**: Comprehensive URL validation
5. **Functionality**: New chat button and session management

### API Changes:
- `POST /api/videos/process/` - Now accepts optional `chatId` parameter
- `GET /api/videos/history/` - New endpoint for retrieving user's chat history

### Database Changes:
- `VideoChat` model now includes `user` foreign key field
- Videos are deduplicated per user based on URL

---

## Notes:
- All changes optimized for minimal code modifications
- No exception handling added per project requirements
- Clean, focused implementation without unnecessary features
- Full backward compatibility maintained
