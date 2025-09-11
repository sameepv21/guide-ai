import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Brain, Frame, Clock, Play } from 'lucide-react';
import type { Message } from './ChatInterface';

interface ResponseTabsProps {
  message: Message;
}

type TabType = 'response' | 'reasoning' | 'frames' | 'timestamps';

export default function ResponseTabs({ message }: ResponseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('response');

  const tabs = [
    { id: 'response' as TabType, label: 'Response', icon: MessageSquare },
    { id: 'reasoning' as TabType, label: 'Reasoning', icon: Brain },
    { id: 'frames' as TabType, label: 'Key Frames', icon: Frame },
    { id: 'timestamps' as TabType, label: 'Timestamps', icon: Clock },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-gray-900/30 border-b border-gray-800">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'text-gray-400 hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'response' && (
            <motion.div
              key="response"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-purple-400">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reasoning' && (
            <motion.div
              key="reasoning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-gray-900/30 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Analysis Process
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {message.reasoning || 'No reasoning data available for this response.'}
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'frames' && (
            <motion.div
              key="frames"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {message.frames?.map((frame, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/30 rounded-xl border border-gray-800 overflow-hidden group hover:border-blue-500/50 transition-all"
                  >
                    <div className="aspect-video bg-gray-800/50 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Frame className="w-12 h-12 text-gray-700" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 rounded text-xs text-gray-300">
                        {frame.timestamp}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-300">{frame.description}</p>
                    </div>
                  </motion.div>
                )) || (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No frame data available
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'timestamps' && (
            <motion.div
              key="timestamps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="space-y-3">
                {message.timestamps?.map((timestamp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/30 rounded-xl border border-gray-800 p-4 hover:border-blue-500/50 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors group-hover:scale-110">
                        <Play className="w-4 h-4 text-blue-400" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>{timestamp.start} - {timestamp.end}</span>
                        </div>
                        <p className="text-gray-300">{timestamp.content}</p>
                      </div>
                    </div>
                  </motion.div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No timestamp data available
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
