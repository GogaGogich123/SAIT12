import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Plus, 
  Edit, 
  Trash2, 
  Award, 
  Settings,
  BarChart3,
  FileText,
  CheckSquare,
  Star,
  Target,
  Calendar,
  TrendingUp,
  UserPlus,
  Gift,
  Medal,
  Crown,
  Zap,
  Shield,
  Heart,
  BookOpen,
  Flame,
  Sparkles,
  Save,
  X,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getCadets,
  getAchievements,
  getAutoAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  awardAchievement,
  addScoreHistory,
  updateCadetScores,
  getAnalytics,
  addNews,
  updateNews,
  deleteNews,
  getNews,
  getTasks,
  updateTask,
  type Cadet,
  type Achievement,
  type AutoAchievement,
  type News,
  type Task
} from '../lib/supabase';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

interface AchievementForm {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface ScoreForm {
  cadetId: string;
  category: 'study' | 'discipline' | 'events';
  points: number;
  description: string;
}

interface NewsForm {
  title: string;
  content: string;
  author: string;
  is_main: boolean;
  background_image_url: string;
  images: string[];
}

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success, error: showError } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'cadets' | 'achievements' | 'scores' | 'news' | 'tasks'>('overview');
  const [loading, setLoading] = useState(true);
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [autoAchievements, setAutoAchievements] = useState<AutoAchievement[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Modal states
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  
  // Form states
  const [achievementForm, setAchievementForm] = useState<AchievementForm>({
    title: '',
    description: '',
    category: 'general',
    icon: 'Star',
    color: 'from-blue-500 to-blue-700'
  });
  
  const [scoreForm, setScoreForm] = useState<ScoreForm>({
    cadetId: '',
    category: 'study',
    points: 0,
    description: ''
  });
  
  const [newsForm, setNewsForm] = useState<NewsForm>({
    title: '',
    content: '',
    author: '',
    is_main: false,
    background_image_url: '',
    images: []
  });
  
  const [selectedCadetForAward, setSelectedCadetForAward] = useState<string>('');
  const [selectedAchievementForAward, setSelectedAchievementForAward] = useState<string>('');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatoon, setFilterPlatoon] = useState('all');

  const iconOptions = [
    { value: 'Star', label: 'Звезда', icon: Star },
    { value: 'Trophy', label: 'Трофей', icon: Trophy },
    { value: 'Medal', label: 'Медаль', icon: Medal },
    { value: 'Crown', label: 'Корона', icon: Crown },
    { value: 'Award', label: 'Награда', icon: Award },
    { value: 'Target', label: 'Цель', icon: Target },
    { value: 'Zap', label: 'Молния', icon: Zap },
    { value: 'Shield', label: 'Щит', icon: Shield },
    { value: 'Heart', label: 'Сердце', icon: Heart },
    { value: 'BookOpen', label: 'Книга', icon: BookOpen },
    { value: 'Users', label: 'Команда', icon: Users },
    { value: 'Flame', label: 'Огонь', icon: Flame },
    { value: 'Sparkles', label: 'Искры', icon: Sparkles }
  ];

  const colorOptions = [
    { value: 'from-blue-500 to-blue-700', label: 'Синий' },
    { value: 'from-green-500 to-green-700', label: 'Зелёный' },
    { value: 'from-red-500 to-red-700', label: 'Красный' },
    { value: 'from-yellow-500 to-yellow-700', label: 'Жёлтый' },
    { value: 'from-purple-500 to-purple-700', label: 'Фиолетовый' },
    { value: 'from-pink-500 to-pink-700', label: 'Розовый' },
    { value: 'from-indigo-500 to-indigo-700', label: 'Индиго' },
    { value: 'from-orange-500 to-orange-700', label: 'Оранжевый' }
  ];

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cadetsData, achievementsData, autoAchievementsData, newsData, tasksData, analyticsData] = await Promise.all([
          getCadets(),
          getAchievements(),
          getAutoAchievements(),
          getNews(),
          getTasks(),
          getAnalytics()
        ]);
        
        setCadets(cadetsData);
        setAchievements(achievementsData);
        setAutoAchievements(autoAchievementsData);
        setNews(newsData);
        setTasks(tasksData);
        setAnalytics(analyticsData);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        showError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, showError]);

  const handleCreateAchievement = async () => {
    try {
      if (!achievementForm.title || !achievementForm.description) {
        showError('Заполните все обязательные поля');
        return;
      }
      
      const newAchievement = await addAchievement(achievementForm);
      setAchievements([...achievements, newAchievement]);
      setShowAchievementModal(false);
      setAchievementForm({
        title: '',
        description: '',
        category: 'general',
        icon: 'Star',
        color: 'from-blue-500 to-blue-700'
      });
      success('Достижение создано');
    } catch (err) {
      showError('Ошибка создания достижения');
    }
  };

  const handleUpdateAchievement = async () => {
    if (!editingAchievement) return;
    
    try {
      await updateAchievement(editingAchievement.id, achievementForm);
      setAchievements(achievements.map(a => 
        a.id === editingAchievement.id ? { ...a, ...achievementForm } : a
      ));
      setShowAchievementModal(false);
      setEditingAchievement(null);
      success('Достижение обновлено');
    } catch (err) {
      showError('Ошибка обновления достижения');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Удалить достижение?')) return;
    
    try {
      await deleteAchievement(id);
      setAchievements(achievements.filter(a => a.id !== id));
      success('Достижение удалено');
    } catch (err) {
      showError('Ошибка удаления достижения');
    }
  };

  const handleAwardAchievement = async () => {
    if (!selectedCadetForAward || !selectedAchievementForAward || !user) return;
    
    try {
      await awardAchievement(selectedCadetForAward, selectedAchievementForAward, user.id);
      setShowAwardModal(false);
      setSelectedCadetForAward('');
      setSelectedAchievementForAward('');
      success('Достижение присуждено');
    } catch (err) {
      showError('Ошибка присуждения достижения');
    }
  };

  const handleAddScore = async () => {
    if (!user) return;
    
    try {
      if (!scoreForm.cadetId || !scoreForm.description || scoreForm.points === 0) {
        showError('Заполните все поля');
        return;
      }
      
      await addScoreHistory({
        cadet_id: scoreForm.cadetId,
        category: scoreForm.category,
        points: scoreForm.points,
        description: scoreForm.description,
        awarded_by: user.id
      });
      
      await updateCadetScores(scoreForm.cadetId, scoreForm.category, scoreForm.points);
      
      setShowScoreModal(false);
      setScoreForm({
        cadetId: '',
        category: 'study',
        points: 0,
        description: ''
      });
      success('Баллы начислены');
    } catch (err) {
      showError('Ошибка начисления баллов');
    }
  };

  const handleCreateNews = async () => {
    try {
      if (!newsForm.title || !newsForm.content || !newsForm.author) {
        showError('Заполните все обязательные поля');
        return;
      }
      
      const newNews = await addNews(newsForm);
      setNews([newNews, ...news]);
      setShowNewsModal(false);
      setNewsForm({
        title: '',
        content: '',
        author: '',
        is_main: false,
        background_image_url: '',
        images: []
      });
      success('Новость создана');
    } catch (err) {
      showError('Ошибка создания новости');
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    
    try {
      await updateNews(editingNews.id, newsForm);
      setNews(news.map(n => 
        n.id === editingNews.id ? { ...n, ...newsForm } : n
      ));
      setShowNewsModal(false);
      setEditingNews(null);
      success('Новость обновлена');
    } catch (err) {
      showError('Ошибка обновления новости');
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Удалить новость?')) return;
    
    try {
      await deleteNews(id);
      setNews(news.filter(n => n.id !== id));
      success('Новость удалена');
    } catch (err) {
      showError('Ошибка удаления новости');
    }
  };

  const openEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon,
      color: achievement.color
    });
    setShowAchievementModal(true);
  };

  const openEditNews = (newsItem: News) => {
    setEditingNews(newsItem);
    setNewsForm({
      title: newsItem.title,
      content: newsItem.content,
      author: newsItem.author,
      is_main: newsItem.is_main,
      background_image_url: newsItem.background_image_url || '',
      images: newsItem.images || []
    });
    setShowNewsModal(true);
  };

  const filteredCadets = cadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatoon = filterPlatoon === 'all' || cadet.platoon === filterPlatoon;
    return matchesSearch && matchesPlatoon;
  });

  const tabs = [
    { key: 'overview', name: 'Обзор', icon: BarChart3 },
    { key: 'cadets', name: 'Кадеты', icon: Users },
    { key: 'achievements', name: 'Достижения', icon: Trophy },
    { key: 'scores', name: 'Баллы', icon: Target },
    { key: 'news', name: 'Новости', icon: FileText },
    { key: 'tasks', name: 'Задания', icon: CheckSquare }
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещён</h2>
          <p className="text-blue-200">У вас нет прав администратора</p>
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
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="text-6xl md:text-7xl font-display font-black mb-6 text-gradient text-glow">
              Админ-панель
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto text-shadow">
              Управление системой рейтинга кадетов
            </p>
          </motion.div>

          {loading && <LoadingSpinner message="Загрузка данных..." />}

          {!loading && (
            <>
              {/* Tabs */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap justify-center gap-4 mb-12"
              >
                {tabs.map(({ key, name, icon: Icon }) => (
                  <motion.button
                    key={key}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                      activeTab === key
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{name}</span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Overview Tab */}
              {activeTab === 'overview' && analytics && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div variants={staggerItem} className="card-gradient from-blue-600 to-blue-800 p-6 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Users className="h-8 w-8 text-white" />
                        <div>
                          <div className="text-3xl font-black text-white">{analytics.totalCadets}</div>
                          <div className="text-blue-200">Кадетов</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="card-gradient from-green-600 to-green-800 p-6 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-8 w-8 text-white" />
                        <div>
                          <div className="text-3xl font-black text-white">{analytics.totalAchievements}</div>
                          <div className="text-green-200">Достижений</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="card-gradient from-purple-600 to-purple-800 p-6 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <CheckSquare className="h-8 w-8 text-white" />
                        <div>
                          <div className="text-3xl font-black text-white">{analytics.totalTasks}</div>
                          <div className="text-purple-200">Заданий</div>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div variants={staggerItem} className="card-gradient from-yellow-600 to-yellow-800 p-6 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-8 w-8 text-white" />
                        <div>
                          <div className="text-3xl font-black text-white">
                            {Math.round(analytics.avgScores.reduce((sum: number, score: any) => 
                              sum + (score.study_score + score.discipline_score + score.events_score), 0
                            ) / analytics.avgScores.length) || 0}
                          </div>
                          <div className="text-yellow-200">Средний балл</div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Quick Actions */}
                  <motion.div variants={staggerItem} className="card-hover p-8">
                    <h2 className="text-3xl font-bold text-white mb-6">Быстрые действия</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => setShowAchievementModal(true)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Создать достижение</span>
                      </button>
                      
                      <button
                        onClick={() => setShowAwardModal(true)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2"
                      >
                        <Gift className="h-5 w-5" />
                        <span>Присудить награду</span>
                      </button>
                      
                      <button
                        onClick={() => setShowScoreModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2"
                      >
                        <Target className="h-5 w-5" />
                        <span>Начислить баллы</span>
                      </button>
                      
                      <button
                        onClick={() => setShowNewsModal(true)}
                        className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center space-x-2"
                      >
                        <FileText className="h-5 w-5" />
                        <span>Создать новость</span>
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Cadets Tab */}
              {activeTab === 'cadets' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {/* Filters */}
                  <motion.div variants={staggerItem} className="card-hover p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Поиск кадета..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="input pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
                        <select
                          value={filterPlatoon}
                          onChange={(e) => setFilterPlatoon(e.target.value)}
                          className="input pl-10"
                        >
                          <option value="all">Все взводы</option>
                          {Array.from(new Set(cadets.map(c => c.platoon))).map(platoon => (
                            <option key={platoon} value={platoon}>{platoon} взвод</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>

                  {/* Cadets List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCadets.map((cadet, index) => (
                      <motion.div
                        key={cadet.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="card-hover p-6"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <img
                            src={cadet.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=200'}
                            alt={cadet.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-400"
                          />
                          <div>
                            <h3 className="text-xl font-bold text-white">{cadet.name}</h3>
                            <p className="text-blue-300">{cadet.platoon} взвод, {cadet.squad} отделение</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-blue-200">Рейтинг:</span>
                          <span className="text-2xl font-bold text-yellow-400">#{cadet.rank}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-blue-200">Баллы:</span>
                          <span className="text-2xl font-bold text-white">{cadet.total_score}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <motion.div variants={staggerItem} className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">Управление достижениями</h2>
                    <button
                      onClick={() => setShowAchievementModal(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Создать достижение</span>
                    </button>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement, index) => {
                      const IconComponent = iconOptions.find(opt => opt.value === achievement.icon)?.icon || Star;
                      
                      return (
                        <motion.div
                          key={achievement.id}
                          variants={staggerItem}
                          whileHover={{ scale: 1.02, y: -5 }}
                          className={`card-gradient ${achievement.color} p-6 rounded-2xl relative group`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <IconComponent className="h-8 w-8 text-white" />
                            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditAchievement(achievement)}
                                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                              >
                                <Edit className="h-4 w-4 text-white" />
                              </button>
                              <button
                                onClick={() => handleDeleteAchievement(achievement.id)}
                                className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-white mb-2">{achievement.title}</h3>
                          <p className="text-white/90 mb-4">{achievement.description}</p>
                          <span className="text-white/70 text-sm">{achievement.category}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* News Tab */}
              {activeTab === 'news' && (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <motion.div variants={staggerItem} className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white">Управление новостями</h2>
                    <button
                      onClick={() => setShowNewsModal(true)}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Создать новость</span>
                    </button>
                  </motion.div>

                  <div className="space-y-6">
                    {news.map((newsItem, index) => (
                      <motion.div
                        key={newsItem.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="card-hover p-6 group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-2xl font-bold text-white">{newsItem.title}</h3>
                              {newsItem.is_main && (
                                <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                                  ГЛАВНАЯ
                                </span>
                              )}
                            </div>
                            <p className="text-blue-200 mb-4 line-clamp-2">{newsItem.content}</p>
                            <div className="flex items-center space-x-4 text-blue-300 text-sm">
                              <span>Автор: {newsItem.author}</span>
                              <span>{new Date(newsItem.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditNews(newsItem)}
                              className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                              <Edit className="h-4 w-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(newsItem.id)}
                              className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Achievement Modal */}
          {showAchievementModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowAchievementModal(false);
                setEditingAchievement(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-effect rounded-3xl max-w-2xl w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  {editingAchievement ? 'Редактировать достижение' : 'Создать достижение'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Название</label>
                    <input
                      type="text"
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                      className="input"
                      placeholder="Название достижения"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Описание</label>
                    <textarea
                      value={achievementForm.description}
                      onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                      className="input resize-none"
                      rows={3}
                      placeholder="Описание достижения"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Категория</label>
                      <input
                        type="text"
                        value={achievementForm.category}
                        onChange={(e) => setAchievementForm({...achievementForm, category: e.target.value})}
                        className="input"
                        placeholder="Категория"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Иконка</label>
                      <select
                        value={achievementForm.icon}
                        onChange={(e) => setAchievementForm({...achievementForm, icon: e.target.value})}
                        className="input"
                      >
                        {iconOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Цвет</label>
                      <select
                        value={achievementForm.color}
                        onChange={(e) => setAchievementForm({...achievementForm, color: e.target.value})}
                        className="input"
                      >
                        {colorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingAchievement ? handleUpdateAchievement : handleCreateAchievement}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingAchievement ? 'Обновить' : 'Создать'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAchievementModal(false);
                      setEditingAchievement(null);
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors flex items-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Отмена</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Award Achievement Modal */}
          {showAwardModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowAwardModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-effect rounded-3xl max-w-2xl w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold text-white mb-6">Присудить достижение</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Кадет</label>
                    <select
                      value={selectedCadetForAward}
                      onChange={(e) => setSelectedCadetForAward(e.target.value)}
                      className="input"
                    >
                      <option value="">Выберите кадета</option>
                      {cadets.map(cadet => (
                        <option key={cadet.id} value={cadet.id}>
                          {cadet.name} ({cadet.platoon} взвод)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Достижение</label>
                    <select
                      value={selectedAchievementForAward}
                      onChange={(e) => setSelectedAchievementForAward(e.target.value)}
                      className="input"
                    >
                      <option value="">Выберите достижение</option>
                      {achievements.map(achievement => (
                        <option key={achievement.id} value={achievement.id}>
                          {achievement.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleAwardAchievement}
                    disabled={!selectedCadetForAward || !selectedAchievementForAward}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Gift className="h-5 w-5" />
                    <span>Присудить</span>
                  </button>
                  <button
                    onClick={() => setShowAwardModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Score Modal */}
          {showScoreModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowScoreModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-effect rounded-3xl max-w-2xl w-full p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold text-white mb-6">Начислить баллы</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Кадет</label>
                    <select
                      value={scoreForm.cadetId}
                      onChange={(e) => setScoreForm({...scoreForm, cadetId: e.target.value})}
                      className="input"
                    >
                      <option value="">Выберите кадета</option>
                      {cadets.map(cadet => (
                        <option key={cadet.id} value={cadet.id}>
                          {cadet.name} ({cadet.platoon} взвод)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Категория</label>
                      <select
                        value={scoreForm.category}
                        onChange={(e) => setScoreForm({...scoreForm, category: e.target.value as any})}
                        className="input"
                      >
                        <option value="study">Учёба</option>
                        <option value="discipline">Дисциплина</option>
                        <option value="events">Мероприятия</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Баллы</label>
                      <input
                        type="number"
                        value={scoreForm.points}
                        onChange={(e) => setScoreForm({...scoreForm, points: parseInt(e.target.value) || 0})}
                        className="input"
                        placeholder="Количество баллов"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Описание</label>
                    <textarea
                      value={scoreForm.description}
                      onChange={(e) => setScoreForm({...scoreForm, description: e.target.value})}
                      className="input resize-none"
                      rows={3}
                      placeholder="За что начисляются баллы"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleAddScore}
                    disabled={!scoreForm.cadetId || !scoreForm.description}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Target className="h-5 w-5" />
                    <span>Начислить</span>
                  </button>
                  <button
                    onClick={() => setShowScoreModal(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* News Modal */}
          {showNewsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowNewsModal(false);
                setEditingNews(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-effect rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold text-white mb-6">
                  {editingNews ? 'Редактировать новость' : 'Создать новость'}
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Заголовок</label>
                    <input
                      type="text"
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({...newsForm, title: e.target.value})}
                      className="input"
                      placeholder="Заголовок новости"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Содержание</label>
                    <textarea
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({...newsForm, content: e.target.value})}
                      className="input resize-none"
                      rows={6}
                      placeholder="Текст новости"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Автор</label>
                      <input
                        type="text"
                        value={newsForm.author}
                        onChange={(e) => setNewsForm({...newsForm, author: e.target.value})}
                        className="input"
                        placeholder="Имя автора"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-8">
                      <input
                        type="checkbox"
                        id="is_main"
                        checked={newsForm.is_main}
                        onChange={(e) => setNewsForm({...newsForm, is_main: e.target.checked})}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <label htmlFor="is_main" className="text-white font-bold">
                        Главная новость
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Фоновое изображение (URL)</label>
                    <input
                      type="url"
                      value={newsForm.background_image_url}
                      onChange={(e) => setNewsForm({...newsForm, background_image_url: e.target.value})}
                      className="input"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Дополнительные изображения (по одному URL на строку)</label>
                    <textarea
                      value={newsForm.images.join('\n')}
                      onChange={(e) => setNewsForm({...newsForm, images: e.target.value.split('\n').filter(url => url.trim())})}
                      className="input resize-none"
                      rows={4}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingNews ? handleUpdateNews : handleCreateNews}
                    disabled={!newsForm.title || !newsForm.content || !newsForm.author}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingNews ? 'Обновить' : 'Создать'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewsModal(false);
                      setEditingNews(null);
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors flex items-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Отмена</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;