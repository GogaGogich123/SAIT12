import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Star } from 'lucide-react';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import LazyImage from '../components/LazyImage';
import NewsCard from '../components/news/NewsCard';
import NewsModal from '../components/news/NewsModal';
import { getNews, type News } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import { IMAGE_SIZES } from '../utils/constants';
import { optimizeImageUrl } from '../utils/performance';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const NewsPage: React.FC = () => {
  useSEO({
    title: 'Новости корпуса',
    description: 'Актуальные события и достижения кадетов Новороссийского казачьего кадетского корпуса',
    keywords: ['новости', 'события', 'достижения кадетов', 'корпус', 'мероприятия'],
    ogType: 'website'
  });
  
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await getNews();
        setNews(newsData);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Ошибка загрузки новостей');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const mainNews = news.find(item => item.is_main);
  const regularNews = news.filter(item => !item.is_main);

  const openNewsModal = (newsItem: News) => setSelectedNews(newsItem);
  const closeNewsModal = () => setSelectedNews(null);


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative overflow-hidden"
    >
      <div className="absolute inset-0">
        <AnimatedSVGBackground />
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-slate-800/95 z-10"></div>
      
      <div className="relative z-20 section-padding">
        <div className="container-custom">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl font-display font-black mb-6 text-gradient text-glow">
            Новости корпуса
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-2xl text-white/90 max-w-3xl mx-auto text-shadow text-balance">
            Актуальные события и достижения кадетов
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div>
            <LoadingSpinner message="Загрузка новостей..." />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Main News */}
        {!loading && !error && mainNews && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            <div 
              className="relative overflow-hidden rounded-3xl shadow-2xl cursor-pointer group hover-lift"
              onClick={() => openNewsModal(mainNews)}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div>
              {mainNews.background_image_url && (
                <LazyImage
                  src={optimizeImageUrl(
                    mainNews.background_image_url,
                    IMAGE_SIZES.HERO_IMAGE.width,
                    IMAGE_SIZES.HERO_IMAGE.height
                  )}
                  alt={mainNews.title}
                  className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    ГЛАВНАЯ НОВОСТЬ
                  </span>
                </div>
                <h2 className="text-5xl font-display font-black text-white mb-6 group-hover:text-yellow-400 transition-colors text-shadow">
                  {mainNews.title}
                </h2>
                <p className="text-blue-100 mb-6 line-clamp-3 text-lg text-shadow">{mainNews.content}</p>
                <div className="flex items-center space-x-6 text-blue-200">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="text-base font-semibold">{mainNews.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-base font-semibold">{new Date(mainNews.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular News */}
        {!loading && !error && (
          <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {regularNews.map((news, index) => (
            <NewsCard
              key={news.id}
              news={news}
              onClick={() => openNewsModal(news)}
            />
          ))}
        </motion.div>
        )}

        {/* News Modal */}
        <NewsModal news={selectedNews} onClose={closeNewsModal} />
        </div>
      </div>
    </motion.div>
  );
};

export default NewsPage;