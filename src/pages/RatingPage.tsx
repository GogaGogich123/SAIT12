import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Trophy, Medal, Target, Users, TrendingUp, TrendingDown } from 'lucide-react';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import VirtualizedCadetList from '../components/VirtualizedCadetList';
import { getCadets, getCadetScores, type Cadet, type Score } from '../lib/supabase';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSEO } from '../hooks/useSEO';
import { useWebWorker } from '../utils/webWorkers';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

interface CadetWithScores extends Cadet {
  scores: {
    study: number;
    discipline: number;
    events: number;
    total: number;
  };
}

const RatingPage: React.FC = () => {
  useSEO({
    title: 'Рейтинг кадетов',
    description: 'Рейтинг успехов и достижений кадетов Новороссийского казачьего кадетского корпуса',
    keywords: ['рейтинг кадетов', 'успехи', 'достижения', 'баллы', 'учеба', 'дисциплина'],
    ogType: 'website'
  });
  
  const [selectedCategory, setSelectedCategory] = useState<'total' | 'study' | 'discipline' | 'events'>('total');
  const [selectedPlatoon, setSelectedPlatoon] = useLocalStorage('rating_platoon_filter', 'all');
  const [selectedSquad, setSelectedSquad] = useLocalStorage('rating_squad_filter', 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cadets, setCadets] = useState<CadetWithScores[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { postMessage, cleanup } = useWebWorker();
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const platoons = ['7-1', '7-2', '8-1', '8-2', '9-1', '9-2', '10-1', '10-2', '11-1', '11-2'];
  const squads = [1, 2, 3];

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    const fetchCadets = async () => {
      try {
        setLoading(true);
        const cadetsData = await getCadets();
        
        // Получаем баллы для каждого кадета
        const cadetsWithScores = await Promise.all(
          cadetsData.map(async (cadet) => {
            try {
              const scores = await getCadetScores(cadet.id);
              return {
                ...cadet,
                scores: {
                  study: scores?.study_score || 0,
                  discipline: scores?.discipline_score || 0,
                  events: scores?.events_score || 0,
                  total: cadet.total_score
                }
              };
            } catch (error) {
              console.error(`Error fetching scores for cadet ${cadet.id}:`, error);
              return {
                ...cadet,
                scores: {
                  study: 0,
                  discipline: 0,
                  events: 0,
                  total: cadet.total_score
                }
              };
            }
          })
        );
        
        setCadets(cadetsWithScores);
      } catch (err) {
        console.error('Error fetching cadets:', err);
        setError('Ошибка загрузки данных кадетов');
      } finally {
        setLoading(false);
      }
    };

    fetchCadets();
  }, []);

  useEffect(() => {
    const filterAndSortCadets = async () => {
      if (cadets.length === 0) return;
      
      setIsProcessing(true);
      
      try {
        // Используем Web Worker для фильтрации
        const filteredCadets = await postMessage('FILTER_CADETS', {
          cadets,
          searchTerm: debouncedSearchTerm,
          platoon: selectedPlatoon,
          squad: selectedSquad
        }) as CadetWithScores[];
        
        // Сортируем по выбранной категории
        const sortedCadets = await postMessage('SORT_CADETS', {
          cadets: filteredCadets,
          sortBy: selectedCategory === 'total' ? 'score' : selectedCategory
        }) as CadetWithScores[];
        
        setFilteredCadets(sortedCadets);
      } catch (error) {
        console.error('Error processing cadets:', error);
        // Fallback к синхронной обработке
        const filtered = cadets.filter(cadet => {
          const matchesSearch = cadet.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
          const matchesPlatoon = selectedPlatoon === 'all' || cadet.platoon === selectedPlatoon;
          const matchesSquad = selectedSquad === 'all' || cadet.squad.toString() === selectedSquad;
          return matchesSearch && matchesPlatoon && matchesSquad;
        });
        setFilteredCadets(filtered);
      } finally {
        setIsProcessing(false);
      }
    };
    
    filterAndSortCadets();
  }, [cadets, debouncedSearchTerm, selectedPlatoon, selectedSquad, selectedCategory, postMessage]);

  const categories = [
    { key: 'total', name: 'Общий рейтинг', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
    { key: 'study', name: 'Учёба', icon: Medal, color: 'from-blue-500 to-cyan-500' },
    { key: 'discipline', name: 'Дисциплина', icon: Target, color: 'from-red-500 to-pink-500' },
    { key: 'events', name: 'Мероприятия', icon: Users, color: 'from-green-500 to-emerald-500' },
  ];

  const [filteredCadets, setFilteredCadets] = useState<CadetWithScores[]>([]);

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
            Рейтинг кадетов
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-2xl text-white/90 max-w-3xl mx-auto text-shadow text-balance">
            Следите за успехами и достижениями лучших кадетов корпуса
          </p>
        </motion.div>

        {/* Loading State */}
        {(loading || isProcessing) && (
          <div>
            <LoadingSpinner message={loading ? "Загрузка данных кадетов..." : "Обработка данных..."} />
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

        {/* Categories */}
        {!loading && !error && (
          <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
        >
          {categories.map(({ key, name, icon: Icon, color }) => (
            <motion.button
              key={key}
              variants={staggerItem}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(key as any)}
              className={`relative overflow-hidden p-6 rounded-2xl transition-all duration-500 shadow-2xl ${
                selectedCategory === key
                  ? 'scale-105 shadow-blue-500/25'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} ${
                selectedCategory === key ? 'opacity-100' : 'opacity-60'
              }`}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex flex-col items-center text-white">
                <Icon className="h-10 w-10 mb-3" />
                <span className="font-bold text-base">{name}</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
        )}

        {/* Filters */}
        {!loading && !error && (
          <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="glass-effect rounded-2xl p-8 mb-12 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
              <input
                type="text"
                placeholder="Поиск кадета..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Platoon Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
              <select
                value={selectedPlatoon}
                onChange={(e) => setSelectedPlatoon(e.target.value)}
                className="input pl-10"
              >
                <option value="all">Все взводы</option>
                {platoons.map(platoon => (
                  <option key={platoon} value={platoon}>{platoon} взвод</option>
                ))}
              </select>
            </div>

            {/* Squad Filter */}
            <div>
              <select
                value={selectedSquad}
                onChange={(e) => setSelectedSquad(e.target.value)}
                className="input"
              >
                <option value="all">Все отделения</option>
                {squads.map(squad => (
                  <option key={squad} value={squad.toString()}>{squad} отделение</option>
                ))}
              </select>
            </div>

            <div className="text-white font-bold text-lg flex items-center justify-center">
              Найдено: {filteredCadets.length}
            </div>
          </div>
        </motion.div>
        )}

        {/* Rating List */}
        {!loading && !error && (
          <VirtualizedCadetList
            cadets={filteredCadets}
            containerHeight={800}
            onScroll={() => {}}
          />
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default RatingPage;