import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Heart, MessageCircle, Share2 } from 'lucide-react';
import LazyImage from '../LazyImage';
import { News } from '../../lib/supabase';
import { IMAGE_SIZES } from '../../utils/constants';
import { optimizeImageUrl } from '../../utils/performance';

interface NewsCardProps {
  news: News;
  onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      className="card-hover overflow-hidden shadow-2xl cursor-pointer group"
      onClick={onClick}
    >
      {news.images[0] && (
        <div className="relative overflow-hidden">
          <LazyImage
            src={optimizeImageUrl(
              news.images[0],
              IMAGE_SIZES.CARD_IMAGE.width,
              IMAGE_SIZES.CARD_IMAGE.height
            )}
            alt={news.title}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}
      <div className="p-8">
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors line-clamp-2 text-shadow">
          {news.title}
        </h3>
        <p className="text-blue-200 mb-6 line-clamp-3 text-base">{news.content}</p>
        <div className="flex items-center justify-between text-blue-300 mb-6">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span className="font-semibold">{news.author}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">{new Date(news.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
        <div className="flex items-center space-x-6 pt-6 border-t border-white/20">
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-blue-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            <Heart className="h-5 w-5" />
            <span>12</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-2 text-blue-300 hover:text-yellow-400 transition-colors font-semibold"
          >
            <MessageCircle className="h-5 w-5" />
            <span>5</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="text-blue-300 hover:text-yellow-400 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsCard;