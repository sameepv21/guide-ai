import { motion } from 'framer-motion';
import { Upload, Link2, X, Video } from 'lucide-react';

interface VideoInputProps {
  inputType: 'upload' | 'url';
  setInputType: (type: 'upload' | 'url') => void;
  videoFile: File | null;
  setVideoFile: (file: File | null) => void;
  videoUrl: string;
  setVideoUrl: (url: string) => void;
}

export default function VideoInput({
  inputType,
  setInputType,
  videoFile,
  setVideoFile,
  videoUrl,
  setVideoUrl
}: VideoInputProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputType('upload')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
            inputType === 'upload'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'bg-gray-800/30 text-gray-400 border border-gray-700 hover:bg-gray-800/50'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Video
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputType('url')}
          className={`flex-1 py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
            inputType === 'url'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
              : 'bg-gray-800/30 text-gray-400 border border-gray-700 hover:bg-gray-800/50'
          }`}
        >
          <Link2 className="w-4 h-4" />
          Video URL
        </motion.button>
      </div>

      {inputType === 'upload' ? (
        <div>
          {videoFile ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-300">{videoFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoFile(null)}
                className="p-1 hover:bg-gray-700/50 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          ) : (
            <label className="block">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="p-8 border-2 border-dashed border-gray-700 rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer bg-gray-800/20"
              >
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <p className="text-center text-sm text-gray-400">
                  Click to upload video or drag and drop
                </p>
                <p className="text-center text-xs text-gray-500 mt-1">
                  MP4, WebM, AVI up to 500MB
                </p>
              </motion.div>
            </label>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Enter video URL (YouTube, Vimeo, etc.)"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-200 placeholder-gray-500"
          />
        </motion.div>
      )}
    </div>
  );
}
