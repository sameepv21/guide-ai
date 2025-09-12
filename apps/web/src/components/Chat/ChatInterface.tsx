import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Video, LogOut, Sparkles, History, Plus } from 'lucide-react';
import MessageList from './MessageList';
import VideoInput from './VideoInput';
import ResponseTabs from './ResponseTabs';
import { videoAPI } from '../../services/api';


interface ChatInterfaceProps {
  setIsAuthenticated: (value: boolean) => void;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  videoInfo?: {
    type: 'upload' | 'url';
    name?: string;
    url?: string;
  };
  reasoning?: string;
  frames?: Array<{
    timestamp: string;
    frame: string;
    description: string;
  }>;
  timestamps?: Array<{
    start: string;
    end: string;
    content: string;
  }>;
}

interface ChatHistoryItem {
  id: number;
  videoUrl: string;
  videoTitle: string;
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
  chat_history: Array<{
    query: string;
    response: {
      response: string;
      reasoning: string;
      keyFrames: Array<{
        timestamp: string;
        frame: string;
        description: string;
      }>;
      timestamps: Array<{ time: string; description: string }>;
    };
  }>;
}

export default function ChatInterface({ setIsAuthenticated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [error, setError] = useState('');
  const [currentChatId, setCurrentChatId] = useState<number | undefined>(undefined);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [hasHistory, setHasHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    videoAPI.getChatHistory()
      .then(response => {
        const chats = response.data.chats || [];
        setChatHistory(chats);
        setHasHistory(chats.length > 0);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || (!videoFile && !videoUrl)) return;

    // Basic client-side URL validation for immediate feedback
    if (inputType === 'url' && videoUrl) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(videoUrl)) {
        setError('Invalid URL format. Please enter a valid URL starting with http:// or https://');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
      videoInfo: inputType === 'upload' 
        ? { type: 'upload', name: videoFile?.name }
        : { type: 'url', url: videoUrl }
    };

    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setIsProcessing(true);
    setError('');

    const videoUrlToProcess = inputType === 'url' ? videoUrl : (videoFile ? URL.createObjectURL(videoFile) : '');
    
    // Check if this is the same video or a new one
    const isSameVideo = videoUrlToProcess === currentVideoUrl;
    const chatId = isSameVideo ? currentChatId : undefined;
    
    if (!isSameVideo) {
      setCurrentVideoUrl(videoUrlToProcess);
      setCurrentChatId(undefined);
    }
    
    videoAPI.processVideo(videoUrlToProcess, query, chatId)
      .then(response => {
        if (response.data.chatId) {
          setCurrentChatId(response.data.chatId);
        }
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          reasoning: response.data.reasoning,
          frames: response.data.keyFrames,
          timestamps: response.data.timestamps.map((ts: { time: string; description: string }) => ({
            start: ts.time.split(' - ')[0],
            end: ts.time.split(' - ')[1],
            content: ts.description
          }))
        };
        setMessages(prev => [...prev, aiMessage]);
        setSelectedMessage(aiMessage);
        setIsProcessing(false);
        setHasHistory(true);
        // Refresh chat history
        videoAPI.getChatHistory()
          .then(response => {
            const chats = response.data.chats || [];
            setChatHistory(chats);
          })
          .catch(() => {});
      })
      .catch(err => {
        setIsProcessing(false);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again');
          setTimeout(() => setIsAuthenticated(false), 2000);
        } else if (err.response?.status === 400 && err.response?.data?.error) {
          setError(err.response.data.error);
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later');
        } else {
          setError('Failed to process video. Please check your connection and try again');
        }
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(undefined);
    setCurrentVideoUrl('');
    setSelectedMessage(null);
    setVideoFile(null);
    setVideoUrl('');
    setQuery('');
    setError('');
    setShowHistory(false);
    // Refresh chat history when starting new chat
    videoAPI.getChatHistory()
      .then(response => {
        const chats = response.data.chats || [];
        setChatHistory(chats);
        setHasHistory(chats.length > 0);
      })
      .catch(() => {});
  };

  const loadPreviousChat = (chat: ChatHistoryItem) => {
    setCurrentChatId(chat.id);
    setCurrentVideoUrl(chat.videoUrl);
    setVideoUrl(chat.videoUrl);
    setShowHistory(false);
    // Load chat messages from history
    const loadedMessages: Message[] = [];
    chat.chat_history?.forEach((item, index) => {
      if (item.query) {
        loadedMessages.push({
          id: `${chat.id}-q-${index}`,
          role: 'user',
          content: item.query,
          timestamp: new Date(chat.updatedAt),
          videoInfo: { type: 'url', url: chat.videoUrl }
        });
      }
      if (item.response) {
        loadedMessages.push({
          id: `${chat.id}-r-${index}`,
          role: 'assistant',
          content: item.response.response || '',
          timestamp: new Date(chat.updatedAt),
          reasoning: item.response.reasoning,
          frames: item.response.keyFrames,
          timestamps: item.response.timestamps?.map((ts) => ({
            start: ts.time?.split(' - ')[0] || '',
            end: ts.time?.split(' - ')[1] || '',
            content: ts.description || ''
          }))
        });
      }
    });
    setMessages(loadedMessages);
    if (loadedMessages.length > 0) {
      const lastAssistant = loadedMessages.filter(m => m.role === 'assistant').pop();
      setSelectedMessage(lastAssistant || null);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Guide AI
          </h1>
          <p className="text-sm text-gray-400 mt-1">Video-Guided Q&A System</p>
          {hasHistory && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            >
              <History className="w-3 h-3" />
              <span>View previous chats ({chatHistory.length})</span>
            </button>
          )}
        </div>

        <div className="p-4 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {showHistory ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Previous Chats</h3>
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => loadPreviousChat(chat)}
                  className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="text-sm text-gray-300 truncate">
                    {chat.lastMessage || chat.videoTitle || 'Untitled Chat'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(chat.updatedAt).toLocaleDateString()} • {chat.messageCount} message{chat.messageCount !== 1 ? 's' : ''}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <MessageList 
              messages={messages} 
              onSelectMessage={setSelectedMessage}
              selectedMessage={selectedMessage}
            />
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-900/30 backdrop-blur-sm border-b border-gray-800 p-6"
        >
          <div className="flex items-center gap-3">
            <Video className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-200">Video Analysis Chat</h2>
          </div>
        </motion.div>

        {/* Response Display Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <ResponseTabs message={selectedMessage} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center max-w-md"
                >
                  <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">
                    Upload a video and ask questions
                  </h3>
                  <p className="text-gray-500">
                    I'll analyze the video content and provide detailed answers with specific timestamps and visual references
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gray-900/50 backdrop-blur-xl border-t border-gray-800 p-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          
          <VideoInput
            inputType={inputType}
            setInputType={setInputType}
            videoFile={videoFile}
            setVideoFile={setVideoFile}
            videoUrl={videoUrl}
            setVideoUrl={setVideoUrl}
          />

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about the video..."
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-200 placeholder-gray-500"
                disabled={isProcessing}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isProcessing || !query.trim() || (!videoFile && !videoUrl)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isProcessing ? 'Processing...' : 'Send'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
