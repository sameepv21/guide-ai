import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Video, LogOut, Sparkles } from 'lucide-react';
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

export default function ChatInterface({ setIsAuthenticated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || (!videoFile && !videoUrl)) return;

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
    
    videoAPI.processVideo(videoUrlToProcess, query)
      .then(response => {
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
      })
      .catch(err => {
        setIsProcessing(false);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again');
          setTimeout(() => setIsAuthenticated(false), 2000);
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later');
        } else {
          setError('Failed to process video. Please check your connection and try again');
        }
      });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <MessageList 
            messages={messages} 
            onSelectMessage={setSelectedMessage}
            selectedMessage={selectedMessage}
          />
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all"
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
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
