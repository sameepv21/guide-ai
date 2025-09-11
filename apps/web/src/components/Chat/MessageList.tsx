import { motion } from 'framer-motion';
import { Video, Link2, MessageSquare } from 'lucide-react';
import { Message } from './ChatInterface';

interface MessageListProps {
  messages: Message[];
  onSelectMessage: (message: Message) => void;
  selectedMessage: Message | null;
}

export default function MessageList({ messages, onSelectMessage, selectedMessage }: MessageListProps) {
  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p className="text-sm">No conversations yet</p>
        </div>
      ) : (
        messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => message.role === 'assistant' && onSelectMessage(message)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              selectedMessage?.id === message.id
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-gray-800/30 hover:bg-gray-800/50 border border-transparent'
            } ${message.role === 'user' ? 'opacity-75' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 ${message.role === 'user' ? 'text-blue-400' : 'text-purple-400'}`}>
                {message.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium">U</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium">AI</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 line-clamp-2">{message.content}</p>
                {message.videoInfo && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    {message.videoInfo.type === 'upload' ? (
                      <>
                        <Video className="w-3 h-3" />
                        <span className="truncate">{message.videoInfo.name}</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-3 h-3" />
                        <span className="truncate">Video URL</span>
                      </>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-600 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
