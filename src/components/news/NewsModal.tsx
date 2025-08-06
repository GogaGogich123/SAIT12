import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from '../LazyImage';
import { News } from '../../lib/supabase';
import { IMAGE_SIZES } from '../../utils/constants';
import { optimizeImageUrl } from '../../utils/performance';

interface NewsModalProps {
  news: News | null;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({ news, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!news) return null;

  const nextImage = () => {
    if (currentImageIndex < news.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="glass-effect rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {news.is_main && (
                <div className="flex items-center space-x-2">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ГЛАВНАЯ НОВОСТЬ
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-400 text-3xl font-bold transition-colors"
            >
              ×
            </button>
          </div>

          <h2 className="text-5xl font-display font-black text-white mb-8 text-shadow">{news.title}</h2>

          <div className="flex items-center space-x-8 text-blue-200 mb-12">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-lg font-semibold">{news.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span className="text-lg font-semibold">{new Date(news.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-blue-100 text-xl leading-relaxed text-shadow">{news.content}</p>
          </div>

          {/* Image Carousel */}
          {news.images && news.images.length > 0 && (
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <LazyImage
                  src={optimizeImageUrl(
                    news.images[currentImageIndex],
                    IMAGE_SIZES.HERO_IMAGE.width,
                    IMAGE_SIZES.HERO_IMAGE.height
                  )}
                  alt={`${news.title} ${currentImageIndex + 1}`}
                  className="w-full h-[500px] object-cover"
                />
                {news.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      onClick={nextImage}
                      disabled={currentImageIndex === news.images.length - 1}
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
              </div>
              {news.images && news.images.length > 1 && (
                <div className="flex justify-center space-x-3 mt-6">
                  {news.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-4 h-4 rounded-full transition-colors shadow-lg ${
                        index === currentImageIndex ? 'bg-yellow-400' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NewsModal;