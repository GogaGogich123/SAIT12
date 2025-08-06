import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  Star,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  AlertCircle,
  Newspaper,
  BarChart3,
  TrendingUp,
  Medal,
  Gift,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';
import ModernBackground from '../components/ModernBackground';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  supabase,
  getCadets,
  getTasks,
  getNews,
  getAchievements,
  getAnalytics,
  updateCadet,
  updateTask,
  updateNews,
  addNews,
  deleteNews,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  awardAchievement,
  addScoreHistory,
  updateCadetScores,
  type Cadet,
  type Task,
  type News,
  type Achievement
} from '../lib/supabase';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

interface CadetFormData {
  name: string;
  email: string;
  platoon: string;
  squad: number;
}

interface TaskFormData {
  title: string;
  description: string;
  category: 'study' | 'discipline' | 'events';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string;
}

interface NewsFormData {
  title: string;
  content: string;
  author: string;
  is_main: boolean;
  background_image_url: string;
  images: string[];
}

interface AchievementFormData {
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface ScoreFormData {
  cadetId: string;
  category: 'study' | 'discipline' | 'events';
  points: number;
  description: string;
}

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'cadets' | 'tasks' | 'news' | 'achievements' | 'analytics' | 'scores'>('cadets');
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showAddCadet, setShowAddCadet] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddNews, setShowAddNews] = useState(false);
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [showAddScore, setShowAddScore] = useState(false);
  const [editingCadet, setEditingCadet] = useState<Cadet | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Form data
  const [cadetForm, setCadetForm] = useState<CadetFormData>({
    name: '',
    email: '',
    platoon: '10-1',
    squad: 1
  });

  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'study',
    points: 10,
    difficulty: 'easy',
    deadline: ''
  });

  const [newsForm, setNewsForm] = useState<NewsFormData>({
    title: '',
    content: '',
    author: '',
    is_main: false,
    background_image_url: '',
    images: []
  });

  const [achievementForm, setAchievementForm] = useState<AchievementFormData>({
    title: '',
    description: '',
    category: 'general',
    icon: 'star',
    color: 'from-blue-500 to-cyan-500'
  });

  const [scoreForm, setScoreForm] = useState<ScoreFormData>({
    cadetId: '',
    category: 'study',
    points: 0,
    description: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'cadets') {
        const cadetsData = await getCadets();
        setCadets(cadetsData || []);
      } else if (activeTab === 'tasks') {
        const tasksData = await getTasks();
        setTasks(tasksData || []);
      } else if (activeTab === 'news') {
        const newsData = await getNews();
        setNews(newsData || []);
      } else if (activeTab === 'achievements') {
        const achievementsData = await getAchievements();
        setAchievements(achievementsData || []);
      } else if (activeTab === 'analytics') {
        const analyticsData = await getAnalytics();
        setAnalytics(analyticsData);
      } else if (activeTab === 'scores') {
        const cadetsData = await getCadets();
        setCadets(cadetsData || []);
      }
      
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Cadet functions
  const handleAddCadet = async () => {
    try {
      const { data, error } = await supabase
        .from('cadets')
        .insert([{
          name: cadetForm.name,
          email: cadetForm.email,
          platoon: cadetForm.platoon,
          squad: cadetForm.squad,
          total_score: 0,
          rank: cadets.length + 1
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCadets([...cadets, data]);
      setShowAddCadet(false);
      resetCadetForm();
    } catch (err: any) {
      console.error('Error adding cadet:', err);
      alert('Ошибка при добавлении кадета: ' + err.message);
    }
  };

  const handleUpdateCadet = async () => {
    if (!editingCadet) return;
    
    try {
      await updateCadet(editingCadet.id, cadetForm);
      setCadets(cadets.map(c => c.id === editingCadet.id ? { ...c, ...cadetForm } : c));
      setEditingCadet(null);
      resetCadetForm();
    } catch (err: any) {
      console.error('Error updating cadet:', err);
      alert('Ошибка при обновлении кадета: ' + err.message);
    }
  };

  const handleDeleteCadet = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого кадета?')) return;
    
    try {
      const { error } = await supabase
        .from('cadets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCadets(cadets.filter(c => c.id !== id));
    } catch (err: any) {
      console.error('Error deleting cadet:', err);
      alert('Ошибка при удалении кадета: ' + err.message);
    }
  };

  // Task functions
  const handleAddTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: taskForm.title,
          description: taskForm.description,
          category: taskForm.category,
          points: taskForm.points,
          difficulty: taskForm.difficulty,
          deadline: taskForm.deadline,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTasks([data, ...tasks]);
      setShowAddTask(false);
      resetTaskForm();
    } catch (err: any) {
      console.error('Error adding task:', err);
      alert('Ошибка при добавлении задания: ' + err.message);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskForm);
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskForm } : t));
      setEditingTask(null);
      resetTaskForm();
    } catch (err: any) {
      console.error('Error updating task:', err);
      alert('Ошибка при обновлении задания: ' + err.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err: any) {
      console.error('Error deleting task:', err);
      alert('Ошибка при удалении задания: ' + err.message);
    }
  };

  // News functions
  const handleAddNews = async () => {
    try {
      const newsData = await addNews({
        ...newsForm,
        created_by: user?.id
      });
      
      setNews([newsData, ...news]);
      setShowAddNews(false);
      resetNewsForm();
    } catch (err: any) {
      console.error('Error adding news:', err);
      alert('Ошибка при добавлении новости: ' + err.message);
    }
  };

  const handleUpdateNews = async () => {
    if (!editingNews) return;
    
    try {
      await updateNews(editingNews.id, newsForm);
      setNews(news.map(n => n.id === editingNews.id ? { ...n, ...newsForm } : n));
      setEditingNews(null);
      resetNewsForm();
    } catch (err: any) {
      console.error('Error updating news:', err);
      alert('Ошибка при обновлении новости: ' + err.message);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту новость?')) return;
    
    try {
      await deleteNews(id);
      setNews(news.filter(n => n.id !== id));
    } catch (err: any) {
      console.error('Error deleting news:', err);
      alert('Ошибка при удалении новости: ' + err.message);
    }
  };

  // Achievement functions
  const handleAddAchievement = async () => {
    try {
      const achievementData = await addAchievement(achievementForm);
      setAchievements([achievementData, ...achievements]);
      setShowAddAchievement(false);
      resetAchievementForm();
    } catch (err: any) {
      console.error('Error adding achievement:', err);
      alert('Ошибка при добавлении достижения: ' + err.message);
    }
  };

  const handleUpdateAchievement = async () => {
    if (!editingAchievement) return;
    
    try {
      await updateAchievement(editingAchievement.id, achievementForm);
      setAchievements(achievements.map(a => a.id === editingAchievement.id ? { ...a, ...achievementForm } : a));
      setEditingAchievement(null);
      resetAchievementForm();
    } catch (err: any) {
      console.error('Error updating achievement:', err);
      alert('Ошибка при обновлении достижения: ' + err.message);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это достижение?')) return;
    
    try {
      await deleteAchievement(id);
      setAchievements(achievements.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Error deleting achievement:', err);
      alert('Ошибка при удалении достижения: ' + err.message);
    }
  };

  // Score functions
  const handleAddScore = async () => {
    try {
      await addScoreHistory({
        cadet_id: scoreForm.cadetId,
        category: scoreForm.category,
        points: scoreForm.points,
        description: scoreForm.description,
        awarded_by: user?.id
      });

      await updateCadetScores(scoreForm.cadetId, scoreForm.category, scoreForm.points);
      
      setShowAddScore(false);
      resetScoreForm();
      
      // Обновляем список кадетов
      const updatedCadets = await getCadets();
      setCadets(updatedCadets);
    } catch (err: any) {
      console.error('Error adding score:', err);
      alert('Ошибка при добавлении баллов: ' + err.message);
    }
  };

  // Reset forms
  const resetCadetForm = () => {
    setCadetForm({ name: '', email: '', platoon: '10-1', squad: 1 });
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      category: 'study',
      points: 10,
      difficulty: 'easy',
      deadline: ''
    });
  };

  const resetNewsForm = () => {
    setNewsForm({
      title: '',
      content: '',
      author: '',
      is_main: false,
      background_image_url: '',
      images: []
    });
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      title: '',
      description: '',
      category: 'general',
      icon: 'star',
      color: 'from-blue-500 to-cyan-500'
    });
  };

  const resetScoreForm = () => {
    setScoreForm({
      cadetId: '',
      category: 'study',
      points: 0,
      description: ''
    });
  };

  // Edit handlers
  const handleEditCadet = (cadet: Cadet) => {
    setEditingCadet(cadet);
    setCadetForm({
      name: cadet.name,
      email: cadet.email,
      platoon: cadet.platoon,
      squad: cadet.squad
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      category: task.category,
      points: task.points,
      difficulty: task.difficulty,
      deadline: task.deadline
    });
  };

  const handleEditNews = (newsItem: News) => {
    setEditingNews(newsItem);
    setNewsForm({
      title: newsItem.title,
      content: newsItem.content,
      author: newsItem.author,
      is_main: newsItem.is_main,
      background_image_url: newsItem.background_image_url || '',
      images: newsItem.images || []
    });
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      icon: achievement.icon,
      color: achievement.color
    });
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
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
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl font-display font-black mb-6 text-gradient text-glow">
              Панель администратора
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
            <p className="text-2xl text-white/90 max-w-3xl mx-auto text-shadow text-balance">
              Полное управление системой кадетского корпуса
            </p>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div>
              <LoadingSpinner message="Загрузка данных администратора..." />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button 
                onClick={fetchData}
                className="btn-primary"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {/* Tabs */}
          {!loading && !error && (
            <>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex justify-center mb-12"
              >
                <div className="glass-effect rounded-2xl p-2 shadow-2xl">
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      { key: 'cadets', name: 'Кадеты', icon: Users },
                      { key: 'tasks', name: 'Задания', icon: BookOpen },
                      { key: 'news', name: 'Новости', icon: Newspaper },
                      { key: 'achievements', name: 'Достижения', icon: Award },
                      { key: 'analytics', name: 'Аналитика', icon: BarChart3 },
                      { key: 'scores', name: 'Баллы', icon: DollarSign }
                    ].map(({ key, name, icon: Icon }) => (
                      <motion.button
                        key={key}
                        variants={staggerItem}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(key as any)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-base transition-all duration-500 ${
                          activeTab === key
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'text-blue-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cadets Tab */}
              {activeTab === 'cadets' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-display font-bold text-white">Управление кадетами</h2>
                    <button
                      onClick={() => setShowAddCadet(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Добавить кадета
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {cadets.map((cadet) => (
                      <div key={cadet.id} className="card-hover p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                              #{cadet.rank}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{cadet.name}</h3>
                              <p className="text-blue-300">{cadet.platoon} взвод, {cadet.squad} отделение</p>
                              <p className="text-blue-400">{cadet.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400">{cadet.total_score}</div>
                              <div className="text-sm text-blue-300">баллов</div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCadet(cadet)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCadet(cadet.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-display font-bold text-white">Управление заданиями</h2>
                    <button
                      onClick={() => setShowAddTask(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Добавить задание
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {tasks.map((task) => (
                      <div key={task.id} className="card-hover p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                task.category === 'study' ? 'bg-blue-500/20 text-blue-300' :
                                task.category === 'discipline' ? 'bg-red-500/20 text-red-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {task.category === 'study' ? 'Учёба' : 
                                 task.category === 'discipline' ? 'Дисциплина' : 'Мероприятия'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                task.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                                task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {task.difficulty === 'easy' ? 'Легко' : 
                                 task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                task.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                              }`}>
                                {task.status === 'active' ? 'Активно' : 'Неактивно'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{task.title}</h3>
                            <p className="text-blue-200 mb-3">{task.description}</p>
                            <div className="flex items-center space-x-4 text-blue-300">
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>{task.points} баллов</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>До {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* News Tab */}
              {activeTab === 'news' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-display font-bold text-white">Управление новостями</h2>
                    <button
                      onClick={() => setShowAddNews(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Добавить новость
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {news.map((newsItem) => (
                      <div key={newsItem.id} className="card-hover p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-3 mb-3">
                              {newsItem.is_main && (
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-yellow-500/20 text-yellow-300">
                                  Главная новость
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{newsItem.title}</h3>
                            <p className="text-blue-200 mb-3 line-clamp-2">{newsItem.content}</p>
                            <div className="flex items-center space-x-4 text-blue-300">
                              <span>Автор: {newsItem.author}</span>
                              <span>{new Date(newsItem.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleEditNews(newsItem)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNews(newsItem.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-display font-bold text-white">Управление достижениями</h2>
                    <button
                      onClick={() => setShowAddAchievement(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Добавить достижение
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className={`card-hover p-6 bg-gradient-to-r ${achievement.color}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white">{achievement.title}</h3>
                              <p className="text-white/80 text-sm">{achievement.category}</p>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditAchievement(achievement)}
                              className="p-1 bg-white/20 hover:bg-white/30 text-white rounded transition-colors"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteAchievement(achievement.id)}
                              className="p-1 bg-red-500/50 hover:bg-red-500/70 text-white rounded transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-white/90 text-sm">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && analytics && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-display font-bold text-white">Аналитика и статистика</h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-hover p-6 text-center">
                      <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-white mb-2">{analytics.totalCadets}</div>
                      <div className="text-blue-300">Всего кадетов</div>
                    </div>
                    <div className="card-hover p-6 text-center">
                      <BookOpen className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-white mb-2">{analytics.totalTasks}</div>
                      <div className="text-blue-300">Активных заданий</div>
                    </div>
                    <div className="card-hover p-6 text-center">
                      <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-white mb-2">{analytics.totalAchievements}</div>
                      <div className="text-blue-300">Достижений</div>
                    </div>
                  </div>

                  {/* Top Cadets */}
                  <div className="card-hover p-8">
                    <h3 className="text-2xl font-bold text-white mb-6">Топ кадеты</h3>
                    <div className="space-y-4">
                      {analytics.topCadets.slice(0, 5).map((cadet: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{cadet.name}</div>
                              <div className="text-blue-300 text-sm">{cadet.platoon} взвод</div>
                            </div>
                          </div>
                          <div className="text-yellow-400 font-bold">{cadet.total_score} баллов</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Scores Tab */}
              {activeTab === 'scores' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-display font-bold text-white">Управление баллами</h2>
                    <button
                      onClick={() => setShowAddScore(true)}
                      className="btn-primary"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Добавить баллы
                    </button>
                  </div>

                  <div className="grid gap-6">
                    {cadets.map((cadet) => (
                      <div key={cadet.id} className="card-hover p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                              #{cadet.rank}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{cadet.name}</h3>
                              <p className="text-blue-300">{cadet.platoon} взвод, {cadet.squad} отделение</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-yellow-400">{cadet.total_score}</div>
                              <div className="text-sm text-blue-300">баллов</div>
                            </div>
                            <button
                              onClick={() => {
                                setScoreForm({ ...scoreForm, cadetId: cadet.id });
                                setShowAddScore(true);
                              }}
                              className="btn-primary"
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Добавить баллы
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Modals */}
          
          {/* Add/Edit Cadet Modal */}
          {(showAddCadet || editingCadet) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-2xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">
                    {editingCadet ? 'Редактировать кадета' : 'Добавить кадета'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddCadet(false);
                      setEditingCadet(null);
                      resetCadetForm();
                    }}
                    className="text-white hover:text-red-400 text-2xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Имя</label>
                    <input
                      type="text"
                      value={cadetForm.name}
                      onChange={(e) => setCadetForm({...cadetForm, name: e.target.value})}
                      className="input"
                      placeholder="Фамилия Имя Отчество"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Email</label>
                    <input
                      type="email"
                      value={cadetForm.email}
                      onChange={(e) => setCadetForm({...cadetForm, email: e.target.value})}
                      className="input"
                      placeholder="email@nkkk.ru"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Взвод</label>
                      <select
                        value={cadetForm.platoon}
                        onChange={(e) => setCadetForm({...cadetForm, platoon: e.target.value})}
                        className="input"
                      >
                        {['7-1', '7-2', '8-1', '8-2', '9-1', '9-2', '10-1', '10-2', '11-1', '11-2'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Отделение</label>
                      <select
                        value={cadetForm.squad}
                        onChange={(e) => setCadetForm({...cadetForm, squad: parseInt(e.target.value)})}
                        className="input"
                      >
                        {[1, 2, 3].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingCadet ? handleUpdateCadet : handleAddCadet}
                    disabled={!cadetForm.name || !cadetForm.email}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingCadet ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCadet(false);
                      setEditingCadet(null);
                      resetCadetForm();
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Task Modal */}
          {(showAddTask || editingTask) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-3xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">
                    {editingTask ? 'Редактировать задание' : 'Добавить задание'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setEditingTask(null);
                      resetTaskForm();
                    }}
                    className="text-white hover:text-red-400 text-2xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-white font-bold mb-2">Название</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                      className="input"
                      placeholder="Название задания"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Описание</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                      className="input resize-none"
                      rows={4}
                      placeholder="Подробное описание задания"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white font-bold mb-2">Категория</label>
                      <select
                        value={taskForm.category}
                        onChange={(e) => setTaskForm({...taskForm, category: e.target.value as any})}
                        className="input"
                      >
                        <option value="study">Учёба</option>
                        <option value="discipline">Дисциплина</option>
                        <option value="events">Мероприятия</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Сложность</label>
                      <select
                        value={taskForm.difficulty}
                        onChange={(e) => setTaskForm({...taskForm, difficulty: e.target.value as any})}
                        className="input"
                      >
                        <option value="easy">Легко</option>
                        <option value="medium">Средне</option>
                        <option value="hard">Сложно</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white font-bold mb-2">Баллы</label>
                      <input
                        type="number"
                        value={taskForm.points}
                        onChange={(e) => setTaskForm({...taskForm, points: parseInt(e.target.value) || 0})}
                        className="input"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Дедлайн</label>
                    <input
                      type="date"
                      value={taskForm.deadline}
                      onChange={(e) => setTaskForm({...taskForm, deadline: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingTask ? handleUpdateTask : handleAddTask}
                    disabled={!taskForm.title || !taskForm.description || !taskForm.deadline}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingTask ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setEditingTask(null);
                      resetTaskForm();
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit News Modal */}
          {(showAddNews || editingNews) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">
                    {editingNews ? 'Редактировать новость' : 'Добавить новость'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddNews(false);
                      setEditingNews(null);
                      resetNewsForm();
                    }}
                    className="text-white hover:text-red-400 text-2xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                    
                    <div className="flex items-center space-x-3 pt-8">
                      <input
                        type="checkbox"
                        id="is_main"
                        checked={newsForm.is_main}
                        onChange={(e) => setNewsForm({...newsForm, is_main: e.target.checked})}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="is_main" className="text-white font-bold">
                        Главная новость
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">URL фонового изображения</label>
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
                      rows={3}
                      placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingNews ? handleUpdateNews : handleAddNews}
                    disabled={!newsForm.title || !newsForm.content || !newsForm.author}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingNews ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddNews(false);
                      setEditingNews(null);
                      resetNewsForm();
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Achievement Modal */}
          {(showAddAchievement || editingAchievement) && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-2xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">
                    {editingAchievement ? 'Редактировать достижение' : 'Добавить достижение'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddAchievement(false);
                      setEditingAchievement(null);
                      resetAchievementForm();
                    }}
                    className="text-white hover:text-red-400 text-2xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
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
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        <option value="star">Звезда</option>
                        <option value="trophy">Трофей</option>
                        <option value="medal">Медаль</option>
                        <option value="award">Награда</option>
                        <option value="crown">Корона</option>
                        <option value="shield">Щит</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-white font-bold mb-2">Цветовая схема</label>
                    <select
                      value={achievementForm.color}
                      onChange={(e) => setAchievementForm({...achievementForm, color: e.target.value})}
                      className="input"
                    >
                      <option value="from-blue-500 to-cyan-500">Синий</option>
                      <option value="from-green-500 to-emerald-500">Зеленый</option>
                      <option value="from-yellow-500 to-orange-500">Желтый</option>
                      <option value="from-red-500 to-pink-500">Красный</option>
                      <option value="from-purple-500 to-indigo-500">Фиолетовый</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={editingAchievement ? handleUpdateAchievement : handleAddAchievement}
                    disabled={!achievementForm.title || !achievementForm.description}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {editingAchievement ? 'Сохранить' : 'Добавить'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddAchievement(false);
                      setEditingAchievement(null);
                      resetAchievementForm();
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Score Modal */}
          {showAddScore && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-2xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">Добавить баллы</h3>
                  <button
                    onClick={() => {
                      setShowAddScore(false);
                      resetScoreForm();
                    }}
                    className="text-white hover:text-red-400 text-2xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
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
                          {cadet.name} ({cadet.platoon} взвод, {cadet.squad} отделение)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        placeholder="Количество баллов (может быть отрицательным)"
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
                      placeholder="За что начисляются/списываются баллы"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleAddScore}
                    disabled={!scoreForm.cadetId || !scoreForm.description || scoreForm.points === 0}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Добавить баллы
                  </button>
                  <button
                    onClick={() => {
                      setShowAddScore(false);
                      resetScoreForm();
                    }}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;