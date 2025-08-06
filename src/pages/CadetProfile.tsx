import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { TrendingUp, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import CadetHeader from '../components/cadet/CadetHeader';
import CadetScores from '../components/cadet/CadetScores';
import CadetAchievements from '../components/cadet/CadetAchievements';
import { 
  getCadetById, 
  getCadetScores, 
  getCadetAchievements, 
  getAutoAchievements,
  getScoreHistory,
  type Cadet, 
  type Score, 
  type CadetAchievement, 
  type AutoAchievement,
  type ScoreHistory
} from '../lib/supabase';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const CadetProfile: React.FC = () => {
  const { id } = useParams();
  const [cadet, setCadet] = useState<Cadet | null>(null);
  const [scores, setScores] = useState<Score | null>(null);
  const [achievements, setAchievements] = useState<CadetAchievement[]>([]);
  const [autoAchievements, setAutoAchievements] = useState<AutoAchievement[]>([]);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCadetData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Получаем данные кадета
        const cadetData = await getCadetById(id);
        setCadet(cadetData);
        
        // Получаем баллы кадета
        const scoresData = await getCadetScores(id);
        setScores(scoresData);
        
        // Получаем достижения кадета
        const achievementsData = await getCadetAchievements(id);
        setAchievements(achievementsData);
        
        // Получаем все автоматические достижения
        const autoAchievementsData = await getAutoAchievements();
        setAutoAchievements(autoAchievementsData);
        
        // Получаем историю баллов
        const historyData = await getScoreHistory(id);
        setScoreHistory(historyData);
        
      } catch (err) {
        console.error('Error fetching cadet data:', err);
        setError('Ошибка загрузки данных кадета');
      } finally {
        setLoading(false);
      }
    };

    fetchCadetData();
  }, [id]);

  const scoreHistoryMock = [
    { month: 'Сен', study: 85, discipline: 80, events: 78, total: 243 },
    { month: 'Окт', study: 87, discipline: 82, events: 81, total: 250 },
    { month: 'Ноя', study: 90, discipline: 84, events: 85, total: 259 },
    { month: 'Дек', study: 92, discipline: 86, events: 88, total: 266 },
    { month: 'Янв', study: 94, discipline: 87, events: 90, total: 271 },
    { month: 'Мар', study: 95, discipline: 88, events: 92, total: 275 },
  ];

  // Получаем достижения от администратора
  const adminAchievements = achievements.filter(a => a.achievement);
  
  // Получаем автоматические достижения кадета
  const cadetAutoAchievements = achievements.filter(a => a.auto_achievement);
  const cadetAutoAchievementIds = cadetAutoAchievements.map(a => a.auto_achievement_id);

  // Функция для вычисления прогресса автоматических достижений
  const calculateProgress = (achievement: AutoAchievement) => {
    if (!scores || !cadet) return 0;
    
    let currentValue = 0;
    if (achievement.requirement_type === 'total_score') {
      currentValue = cadet.total_score;
    } else if (achievement.requirement_type === 'category_score') {
      if (achievement.requirement_category === 'study') {
        currentValue = scores.study_score;
      } else if (achievement.requirement_category === 'discipline') {
        currentValue = scores.discipline_score;
      } else if (achievement.requirement_category === 'events') {
        currentValue = scores.events_score;
      }
    }
    
    return Math.min(Math.round((currentValue / achievement.requirement_value) * 100), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Загрузка профиля кадета..." size="lg" />
      </div>
    );
  }

  if (error || !cadet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Ошибка загрузки</h2>
          <p className="text-blue-200">{error || 'Кадет не найден'}</p>
        </div>
      </div>
    );
  }

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
        <CadetHeader cadet={cadet} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Chart */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="card-hover p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <h2 className="text-3xl font-display font-bold text-white text-shadow">Динамика баллов</h2>
              </div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistoryMock}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={4} dot={{ fill: '#F59E0B', strokeWidth: 3, r: 8 }} />
                    <Line type="monotone" dataKey="study" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', r: 6 }} />
                    <Line type="monotone" dataKey="discipline" stroke="#EF4444" strokeWidth={3} dot={{ fill: '#EF4444', r: 6 }} />
                    <Line type="monotone" dataKey="events" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Auto Achievements (Ачивки) */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="card-hover p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <h2 className="text-3xl font-display font-bold text-white text-shadow">Ачивки</h2>
                <span className="text-lg text-blue-300 font-semibold">({autoAchievements.filter(a => cadetAutoAchievementIds.includes(a.id)).length}/{autoAchievements.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {autoAchievements.map((achievement, index) => {
                  const unlocked = cadetAutoAchievementIds.includes(achievement.id);
                  const progress = unlocked ? 100 : calculateProgress(achievement);
                  const IconComponent = Sparkles; // Simplified for now
                  
                  return (
                  <motion.div
                    key={achievement.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-500 shadow-lg ${
                      unlocked 
                        ? `bg-gradient-to-r ${achievement.color} border-transparent shadow-lg` 
                        : 'bg-gray-800/50 border-gray-600 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-8 w-8 flex-shrink-0 mt-0.5 ${
                        unlocked ? 'text-white' : 'text-gray-400'
                      }`} />
                      <div className="flex-grow">
                        <h3 className={`font-bold text-lg mb-2 ${
                          unlocked ? 'text-white' : 'text-gray-400'
                        }`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-base mb-3 ${
                          unlocked ? 'text-white/90' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        {!unlocked && (
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                            <span className="text-sm text-gray-400 mt-2 block font-semibold">
                              {progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            </motion.div>
            {/* Recent Score History */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="card-hover p-8 shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="h-8 w-8 text-blue-400" />
                <h2 className="text-3xl font-display font-bold text-white text-shadow">История начислений</h2>
              </div>
              <div className="space-y-6">
                {scoreHistory.map((score, index) => (
                  <motion.div
                    key={score.id}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02, x: 10 }}
                    className="flex items-center justify-between p-6 glass-effect rounded-xl border border-white/10 shadow-lg hover-lift"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-2 rounded-full text-sm font-bold ${
                          score.category === 'study' ? 'bg-blue-500/20 text-blue-300' :
                          score.category === 'discipline' ? 'bg-red-500/20 text-red-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {score.category === 'study' ? 'Учёба' : 
                           score.category === 'discipline' ? 'Дисциплина' : 'Мероприятия'}
                        </span>
                        <span className="text-base text-blue-200 font-semibold">
                          {new Date(score.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="text-white mt-2 text-lg">{score.description}</p>
                    </div>
                    <div className={`text-2xl font-black ${score.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {score.points > 0 ? '+' : ''}{score.points}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Current Scores */}
            <CadetScores scores={scores} />

            {/* Admin Achievements */}
            <CadetAchievements achievements={achievements} />
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CadetProfile;