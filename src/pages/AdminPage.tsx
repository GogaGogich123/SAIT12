import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Award, 
  Newspaper, 
  CheckSquare,
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Eye,
  UserCheck,
  Medal,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  BookOpen,
  Heart,
  Zap,
  Crown,
  Shield,
  Flame,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ParticleBackground from '../components/ParticleBackground';
import ModernBackground from '../components/ModernBackground';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getCadets, 
  getNews, 
  getTasks,
  getCadetScores,
  getAutoAchievements,
  supabase,
  type Cadet, 
  type News, 
  type Task,
  type AutoAchievement
} from '../lib/supabase';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

interface CadetWithScores extends Cadet {
  scores?: {
    study_score: number;
    discipline_score: number;
    events_score: number;
  };
}

interface TaskSubmissionStats {
  task_id: string;
  task_title: string;
  total_submissions: number;
  pending_review: number;
  completed: number;
  rejected: number;
}

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { success, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatoon, setSelectedPlatoon] = useState('all');
  const [selectedSquad, setSelectedSquad] = useState('all');
  
  // Data states
  const [cadets, setCadets] = useState<CadetWithScores[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [autoAchievements, setAutoAchievements] = useState<AutoAchievement[]>([]);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmissionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [newCadet, setNewCadet] = useState({
    name: '',
    email: '',
    phone: '',
    platoon: '',
    squad: 1
  });
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    author: '',
    is_main: false,
    background_image_url: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'study' as 'study' | 'discipline' | 'events',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    points: 10,
    deadline: ''
  });
  const [scoreForm, setScoreForm] = useState({
    cadet_id: '',
    category: 'study' as 'study' | 'discipline' | 'events',
    points: 0,
    description: ''
  });
  const [achievementForm, setAchievementForm] = useState({
    cadet_id: '',
    title: '',
    description: '',
    category: 'study',
    icon: 'Star',
    color: 'from-blue-500 to-blue-700'
  });

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Доступ запрещен</h2>
          <p className="text-blue-200">У вас нет прав для доступа к административной панели</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'dashboard', name: 'Дашборд', icon: BarChart3 },
    { key: 'cadets', name: 'Кадеты', icon: Users },
    { key: 'scores', name: 'Баллы', icon: Award },
    { key: 'news', name: 'Новости', icon: Newspaper },
    { key: 'tasks', name: 'Задания', icon: CheckSquare },
    { key: 'achievements', name: 'Достижения', icon: Medal },
    { key: 'analytics', name: 'Аналитика', icon: TrendingUp },
  ];

  const platoons = ['7-1', '7-2', '8-1', '8-2', '9-1', '9-2', '10-1', '10-2', '11-1', '11-2'];
  const squads = [1, 2, 3];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [cadetsData, newsData, tasksData, autoAchievementsData] = await Promise.all([
        getCadets(),
        getNews(),
        getTasks(),
        getAutoAchievements()
      ]);

      // Получаем баллы для каждого кадета
      const cadetsWithScores = await Promise.all(
        cadetsData.map(async (cadet) => {
          try {
            const scores = await getCadetScores(cadet.id);
            return { ...cadet, scores };
          } catch (error) {
            return { ...cadet, scores: null };
          }
        })
      );

      setCadets(cadetsWithScores);
      setNews(newsData);
      setTasks(tasksData);
      setAutoAchievements(autoAchievementsData);

      // Получаем статистику по заданиям
      await fetchTaskSubmissionStats();
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskSubmissionStats = async () => {
    try {
      const { data, error } = await supabase
        .from('task_submissions')
        .select(`
          task_id,
          status,
          tasks!inner(title)
        `);

      if (error) throw error;

      const stats: { [key: string]: TaskSubmissionStats } = {};
      
      data?.forEach((submission: any) => {
        const taskId = submission.task_id;
        if (!stats[taskId]) {
          stats[taskId] = {
            task_id: taskId,
            task_title: submission.tasks.title,
            total_submissions: 0,
            pending_review: 0,
            completed: 0,
            rejected: 0
          };
        }
        
        stats[taskId].total_submissions++;
        if (submission.status === 'submitted') stats[taskId].pending_review++;
        if (submission.status === 'completed') stats[taskId].completed++;
        if (submission.status === 'rejected') stats[taskId].rejected++;
      });

      setTaskSubmissions(Object.values(stats));
    } catch (error) {
      console.error('Error fetching task submission stats:', error);
    }
  };

  const handleAddCadet = async () => {
    try {
      const { data, error } = await supabase
        .from('cadets')
        .insert([newCadet])
        .select()
        .single();

      if (error) throw error;

      setCadets([...cadets, data]);
      setNewCadet({ name: '', email: '', phone: '', platoon: '', squad: 1 });
      success('Кадет успешно добавлен');
    } catch (error) {
      console.error('Error adding cadet:', error);
      showError('Ошибка при добавлении кадета');
    }
  };

  const handleAddNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .insert([{ ...newNews, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      setNews([data, ...news]);
      setNewNews({ title: '', content: '', author: '', is_main: false, background_image_url: '' });
      success('Новость успешно добавлена');
    } catch (error) {
      console.error('Error adding news:', error);
      showError('Ошибка при добавлении новости');
    }
  };

  const handleAddTask = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      setTasks([...tasks, data]);
      setNewTask({ title: '', description: '', category: 'study', difficulty: 'medium', points: 10, deadline: '' });
      success('Задание успешно добавлено');
    } catch (error) {
      console.error('Error adding task:', error);
      showError('Ошибка при добавлении задания');
    }
  };

  const handleAddScore = async () => {
    try {
      // Добавляем запись в историю баллов
      const { error: historyError } = await supabase
        .from('score_history')
        .insert([{
          cadet_id: scoreForm.cadet_id,
          category: scoreForm.category,
          points: scoreForm.points,
          description: scoreForm.description,
          awarded_by: user.id
        }]);

      if (historyError) throw historyError;

      // Обновляем общие баллы кадета
      const { error: updateError } = await supabase.rpc('update_cadet_scores', {
        p_cadet_id: scoreForm.cadet_id,
        p_category: scoreForm.category,
        p_points: scoreForm.points
      });

      if (updateError) throw updateError;

      setScoreForm({ cadet_id: '', category: 'study', points: 0, description: '' });
      success('Баллы успешно начислены');
      fetchAllData(); // Обновляем данные
    } catch (error) {
      console.error('Error adding score:', error);
      showError('Ошибка при начислении баллов');
    }
  };

  const handleAwardAchievement = async () => {
    try {
      // Создаем достижение
      const { data: achievementData, error: achievementError } = await supabase
        .from('achievements')
        .insert([{
          title: achievementForm.title,
          description: achievementForm.description,
          category: achievementForm.category,
          icon: achievementForm.icon,
          color: achievementForm.color
        }])
        .select()
        .single();

      if (achievementError) throw achievementError;

      // Присваиваем достижение кадету
      const { error: awardError } = await supabase
        .from('cadet_achievements')
        .insert([{
          cadet_id: achievementForm.cadet_id,
          achievement_id: achievementData.id,
          awarded_by: user.id
        }]);

      if (awardError) throw awardError;

      setAchievementForm({ cadet_id: '', title: '', description: '', category: 'study', icon: 'Star', color: 'from-blue-500 to-blue-700' });
      success('Достижение успешно выдано');
    } catch (error) {
      console.error('Error awarding achievement:', error);
      showError('Ошибка при выдаче достижения');
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNews(news.filter(item => item.id !== id));
      success('Новость удалена');
    } catch (error) {
      console.error('Error deleting news:', error);
      showError('Ошибка при удалении новости');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(tasks.filter(item => item.id !== id));
      success('Задание удалено');
    } catch (error) {
      console.error('Error deleting task:', error);
      showError('Ошибка при удалении задания');
    }
  };

  const filteredCadets = cadets.filter(cadet => {
    const matchesSearch = cadet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cadet.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatoon = selectedPlatoon === 'all' || cadet.platoon === selectedPlatoon;
    const matchesSquad = selectedSquad === 'all' || cadet.squad.toString() === selectedSquad;
    return matchesSearch && matchesPlatoon && matchesSquad;
  });

  const renderDashboard = () => (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold text-white mb-8">Обзор системы</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-12 w-12 text-blue-200" />
            <span className="text-3xl font-black text-white">{cadets.length}</span>
          </div>
          <h4 className="text-lg font-semibold text-white">Всего кадетов</h4>
          <p className="text-blue-200 text-sm">Активных пользователей</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckSquare className="h-12 w-12 text-green-200" />
            <span className="text-3xl font-black text-white">{tasks.length}</span>
          </div>
          <h4 className="text-lg font-semibold text-white">Активных заданий</h4>
          <p className="text-green-200 text-sm">Доступно для выполнения</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Newspaper className="h-12 w-12 text-purple-200" />
            <span className="text-3xl font-black text-white">{news.length}</span>
          </div>
          <h4 className="text-lg font-semibold text-white">Новостей</h4>
          <p className="text-purple-200 text-sm">Опубликовано</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Medal className="h-12 w-12 text-yellow-200" />
            <span className="text-3xl font-black text-white">{taskSubmissions.reduce((acc, task) => acc + task.pending_review, 0)}</span>
          </div>
          <h4 className="text-lg font-semibold text-white">На проверке</h4>
          <p className="text-yellow-200 text-sm">Заданий ожидают</p>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-blue-400" />
            Последние новости
          </h4>
          <div className="space-y-4">
            {news.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h5 className="text-white font-semibold line-clamp-1">{item.title}</h5>
                  <p className="text-blue-300 text-sm">{new Date(item.created_at).toLocaleDateString('ru-RU')}</p>
                </div>
                {item.is_main && <Star className="h-5 w-5 text-yellow-400" />}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <AlertCircle className="h-6 w-6 mr-3 text-orange-400" />
            Задания на проверке
          </h4>
          <div className="space-y-4">
            {taskSubmissions.filter(task => task.pending_review > 0).slice(0, 5).map((task) => (
              <div key={task.task_id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <h5 className="text-white font-semibold line-clamp-1">{task.task_title}</h5>
                  <p className="text-blue-300 text-sm">{task.pending_review} на проверке</p>
                </div>
                <div className="bg-orange-400/20 text-orange-400 px-3 py-1 rounded-full text-sm font-bold">
                  {task.pending_review}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderCadetsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white">Управление кадетами</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Добавить кадета</span>
        </motion.button>
      </div>

      {/* Add Cadet Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h4 className="text-xl font-bold text-white mb-6">Добавить нового кадета</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="ФИО"
                value={newCadet.name}
                onChange={(e) => setNewCadet({...newCadet, name: e.target.value})}
                className="input"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCadet.email}
                onChange={(e) => setNewCadet({...newCadet, email: e.target.value})}
                className="input"
              />
              <input
                type="tel"
                placeholder="Телефон"
                value={newCadet.phone}
                onChange={(e) => setNewCadet({...newCadet, phone: e.target.value})}
                className="input"
              />
              <select
                value={newCadet.platoon}
                onChange={(e) => setNewCadet({...newCadet, platoon: e.target.value})}
                className="input"
              >
                <option value="">Выберите взвод</option>
                {platoons.map(platoon => (
                  <option key={platoon} value={platoon}>{platoon} взвод</option>
                ))}
              </select>
              <select
                value={newCadet.squad}
                onChange={(e) => setNewCadet({...newCadet, squad: parseInt(e.target.value)})}
                className="input"
              >
                {squads.map(squad => (
                  <option key={squad} value={squad}>{squad} отделение</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddCadet}
                  disabled={!newCadet.name || !newCadet.email || !newCadet.platoon}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Добавить
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filters */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
            <select
              value={selectedPlatoon}
              onChange={(e) => setSelectedPlatoon(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">Все взводы</option>
              {platoons.map(platoon => (
                <option key={platoon} value={platoon}>{platoon} взвод</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedSquad}
              onChange={(e) => setSelectedSquad(e.target.value)}
              className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="all">Все отделения</option>
              {squads.map(squad => (
                <option key={squad} value={squad.toString()}>{squad} отделение</option>
              ))}
            </select>
          </div>
          <div className="text-white font-semibold flex items-center justify-center">
            Найдено: {filteredCadets.length}
          </div>
        </div>
      </motion.div>

      {/* Cadets Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Кадет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Взвод/Отделение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Баллы
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Рейтинг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCadets.map((cadet) => (
                <motion.tr 
                  key={cadet.id} 
                  className="hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={cadet.avatar_url || 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?w=100'}
                        alt={cadet.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-white font-semibold">{cadet.name}</div>
                        <div className="text-blue-300 text-sm">#{cadet.rank}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                    {cadet.platoon}-{cadet.squad}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-blue-200">
                    <div className="text-sm">
                      <div>{cadet.email}</div>
                      <div className="text-xs text-blue-300">{cadet.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-yellow-400 font-bold text-lg">{cadet.total_score}</div>
                    {cadet.scores && (
                      <div className="text-xs text-blue-300">
                        У:{cadet.scores.study_score} Д:{cadet.scores.discipline_score} М:{cadet.scores.events_score}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        cadet.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-blue-700'
                      }`}>
                        {cadet.rank}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-green-400 hover:text-green-300"
                        onClick={() => window.open(`/cadet/${cadet.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderScoresTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white">Управление баллами</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Score Form */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Award className="h-6 w-6 mr-3 text-yellow-400" />
            Начислить баллы
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Кадет</label>
              <select 
                value={scoreForm.cadet_id}
                onChange={(e) => setScoreForm({...scoreForm, cadet_id: e.target.value})}
                className="input"
              >
                <option value="">Выберите кадета</option>
                {cadets.map(cadet => (
                  <option key={cadet.id} value={cadet.id}>{cadet.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Категория</label>
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
              <label className="block text-white font-semibold mb-2">Баллы</label>
              <input
                type="number"
                value={scoreForm.points}
                onChange={(e) => setScoreForm({...scoreForm, points: parseInt(e.target.value) || 0})}
                className="input"
                placeholder="Количество баллов"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Описание</label>
              <textarea
                value={scoreForm.description}
                onChange={(e) => setScoreForm({...scoreForm, description: e.target.value})}
                className="input resize-none"
                rows={3}
                placeholder="За что начисляются баллы..."
              />
            </div>
            <button
              onClick={handleAddScore}
              disabled={!scoreForm.cadet_id || !scoreForm.description || scoreForm.points === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Начислить баллы
            </button>
          </div>
        </motion.div>

        {/* Quick Score Cards */}
        <div className="space-y-6">
          <h4 className="text-xl font-bold text-white">Быстрое начисление</h4>
          
          <motion.div 
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-white flex items-center">
                <BookOpen className="h-6 w-6 mr-2" />
                Учёба
              </h5>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map(points => (
                <button
                  key={points}
                  onClick={() => setScoreForm({...scoreForm, category: 'study', points})}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
                >
                  +{points}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-6"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-white flex items-center">
                <Target className="h-6 w-6 mr-2" />
                Дисциплина
              </h5>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[3, 7, 12].map(points => (
                <button
                  key={points}
                  onClick={() => setScoreForm({...scoreForm, category: 'discipline', points})}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
                >
                  +{points}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-6"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold text-white flex items-center">
                <Users className="h-6 w-6 mr-2" />
                Мероприятия
              </h5>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[8, 15, 25].map(points => (
                <button
                  key={points}
                  onClick={() => setScoreForm({...scoreForm, category: 'events', points})}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded font-semibold transition-colors"
                >
                  +{points}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  const renderNewsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white">Управление новостями</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Создать новость</span>
        </motion.button>
      </div>

      {/* Add News Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h4 className="text-xl font-bold text-white mb-6">Создать новость</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Заголовок новости"
                value={newNews.title}
                onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                className="input"
              />
              <textarea
                placeholder="Содержание новости"
                value={newNews.content}
                onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                className="input resize-none"
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Автор"
                  value={newNews.author}
                  onChange={(e) => setNewNews({...newNews, author: e.target.value})}
                  className="input"
                />
                <input
                  type="url"
                  placeholder="URL изображения"
                  value={newNews.background_image_url}
                  onChange={(e) => setNewNews({...newNews, background_image_url: e.target.value})}
                  className="input"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    checked={newNews.is_main}
                    onChange={(e) => setNewNews({...newNews, is_main: e.target.checked})}
                    className="rounded"
                  />
                  <span>Главная новость</span>
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddNews}
                  disabled={!newNews.title || !newNews.content || !newNews.author}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Опубликовать
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05, y: -10 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 shadow-lg"
          >
            {item.background_image_url && (
              <img
                src={item.background_image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                {item.is_main && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    ГЛАВНАЯ
                  </span>
                )}
                <span className="text-blue-300 text-sm">
                  {new Date(item.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <h4 className="text-white font-bold text-lg mb-3 line-clamp-2">{item.title}</h4>
              <p className="text-blue-200 text-sm mb-4 line-clamp-3">{item.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-blue-300 text-sm font-semibold">{item.author}</span>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteNews(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderTasksTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white">Управление заданиями</h3>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:scale-105 transition-transform shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Создать задание</span>
        </motion.button>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h4 className="text-xl font-bold text-white mb-6">Создать задание</h4>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Название задания"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="input"
              />
              <textarea
                placeholder="Описание задания"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="input resize-none"
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value as any})}
                  className="input"
                >
                  <option value="study">Учёба</option>
                  <option value="discipline">Дисциплина</option>
                  <option value="events">Мероприятия</option>
                </select>
                <select
                  value={newTask.difficulty}
                  onChange={(e) => setNewTask({...newTask, difficulty: e.target.value as any})}
                  className="input"
                >
                  <option value="easy">Легко</option>
                  <option value="medium">Средне</option>
                  <option value="hard">Сложно</option>
                </select>
                <input
                  type="number"
                  placeholder="Баллы"
                  value={newTask.points}
                  onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value) || 0})}
                  className="input"
                />
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="input"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title || !newTask.description || !newTask.deadline}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all hover:scale-105"
                >
                  Создать задание
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Отмена
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => {
          const taskStats = taskSubmissions.find(s => s.task_id === task.id);
          return (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.05, y: -10 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    task.category === 'study' ? 'bg-blue-400/20 text-blue-300' :
                    task.category === 'discipline' ? 'bg-red-400/20 text-red-300' :
                    'bg-green-400/20 text-green-300'
                  }`}>
                    {task.category === 'study' ? 'Учёба' : 
                     task.category === 'discipline' ? 'Дисциплина' : 'Мероприятия'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    task.difficulty === 'easy' ? 'bg-green-400/20 text-green-300' :
                    task.difficulty === 'medium' ? 'bg-yellow-400/20 text-yellow-300' :
                    'bg-red-400/20 text-red-300'
                  }`}>
                    {task.difficulty === 'easy' ? 'Легко' : 
                     task.difficulty === 'medium' ? 'Средне' : 'Сложно'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star className="h-4 w-4" />
                  <span className="font-bold">{task.points}</span>
                </div>
              </div>

              <h4 className="text-white font-bold text-lg mb-3 line-clamp-2">{task.title}</h4>
              <p className="text-blue-200 text-sm mb-4 line-clamp-3">{task.description}</p>

              <div className="flex items-center justify-between text-blue-300 text-sm mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(task.deadline).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {Math.ceil((new Date(task.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дн.
                  </span>
                </div>
              </div>

              {taskStats && (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-blue-300 font-bold">{taskStats.total_submissions}</div>
                      <div className="text-blue-400">Всего</div>
                    </div>
                    <div>
                      <div className="text-orange-300 font-bold">{taskStats.pending_review}</div>
                      <div className="text-orange-400">На проверке</div>
                    </div>
                    <div>
                      <div className="text-green-300 font-bold">{taskStats.completed}</div>
                      <div className="text-green-400">Выполнено</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Редактировать
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  const renderAchievementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-white">Управление достижениями</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Achievement Form */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Medal className="h-6 w-6 mr-3 text-purple-400" />
            Выдать достижение
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Кадет</label>
              <select 
                value={achievementForm.cadet_id}
                onChange={(e) => setAchievementForm({...achievementForm, cadet_id: e.target.value})}
                className="input"
              >
                <option value="">Выберите кадета</option>
                {cadets.map(cadet => (
                  <option key={cadet.id} value={cadet.id}>{cadet.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Название достижения</label>
              <input
                type="text"
                placeholder="Например: Лучший в учёбе"
                value={achievementForm.title}
                onChange={(e) => setAchievementForm({...achievementForm, title: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Описание</label>
              <textarea
                placeholder="Описание достижения..."
                value={achievementForm.description}
                onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
                rows={3}
                className="input resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Категория</label>
                <select 
                  value={achievementForm.category}
                  onChange={(e) => setAchievementForm({...achievementForm, category: e.target.value})}
                  className="input"
                >
                  <option value="study">Учёба</option>
                  <option value="discipline">Дисциплина</option>
                  <option value="events">Мероприятия</option>
                  <option value="leadership">Лидерство</option>
                  <option value="sports">Спорт</option>
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Иконка</label>
                <select 
                  value={achievementForm.icon}
                  onChange={(e) => setAchievementForm({...achievementForm, icon: e.target.value})}
                  className="input"
                >
                  <option value="Star">Звезда</option>
                  <option value="Trophy">Кубок</option>
                  <option value="Medal">Медаль</option>
                  <option value="Crown">Корона</option>
                  <option value="Shield">Щит</option>
                  <option value="Heart">Сердце</option>
                  <option value="Zap">Молния</option>
                  <option value="Flame">Огонь</option>
                  <option value="Sparkles">Искры</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Цвет</label>
              <select 
                value={achievementForm.color}
                onChange={(e) => setAchievementForm({...achievementForm, color: e.target.value})}
                className="input"
              >
                <option value="from-blue-500 to-blue-700">Синий</option>
                <option value="from-green-500 to-green-700">Зелёный</option>
                <option value="from-red-500 to-red-700">Красный</option>
                <option value="from-yellow-500 to-yellow-700">Жёлтый</option>
                <option value="from-purple-500 to-purple-700">Фиолетовый</option>
                <option value="from-pink-500 to-pink-700">Розовый</option>
                <option value="from-indigo-500 to-indigo-700">Индиго</option>
              </select>
            </div>
            <button
              onClick={handleAwardAchievement}
              disabled={!achievementForm.cadet_id || !achievementForm.title || !achievementForm.description}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Выдать достижение
            </button>
          </div>
        </motion.div>

        {/* Auto Achievements Management */}
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <Sparkles className="h-6 w-6 mr-3 text-cyan-400" />
            Автоматические достижения
          </h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {autoAchievements.map((achievement) => (
              <div key={achievement.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-white font-semibold">{achievement.title}</h5>
                  <div className="flex space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
                <p className="text-blue-200 text-sm mb-2">{achievement.description}</p>
                <div className="text-xs text-blue-300">
                  Требование: {achievement.requirement_value} {
                    achievement.requirement_type === 'total_score' ? 'общих баллов' :
                    `баллов в категории "${achievement.requirement_category}"`
                  }
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <h3 className="text-3xl font-bold text-white">Аналитика и статистика</h3>
      
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-12 w-12 text-cyan-200" />
            <span className="text-3xl font-black text-white">
              {Math.round(cadets.reduce((acc, cadet) => acc + cadet.total_score, 0) / cadets.length) || 0}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white">Средний балл</h4>
          <p className="text-cyan-200 text-sm">По всем кадетам</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-12 w-12 text-emerald-200" />
            <span className="text-3xl font-black text-white">
              {taskSubmissions.reduce((acc, task) => acc + task.completed, 0)}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white">Выполнено заданий</h4>
          <p className="text-emerald-200 text-sm">Всего завершено</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-12 w-12 text-amber-200" />
            <span className="text-3xl font-black text-white">
              {taskSubmissions.reduce((acc, task) => acc + task.pending_review, 0)}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white">Ожидают проверки</h4>
          <p className="text-amber-200 text-sm">Требуют внимания</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-12 w-12 text-rose-200" />
            <span className="text-3xl font-black text-white">
              {new Set(cadets.map(c => c.platoon)).size}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white">Активных взводов</h4>
          <p className="text-rose-200 text-sm">Участвуют в системе</p>
        </motion.div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <Trophy className="h-6 w-6 mr-3 text-yellow-400" />
            Топ кадетов по баллам
          </h4>
          <div className="space-y-3">
            {cadets.slice(0, 5).map((cadet, index) => (
              <div key={cadet.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                    'bg-gradient-to-r from-blue-500 to-blue-700'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{cadet.name}</div>
                    <div className="text-blue-300 text-sm">{cadet.platoon}-{cadet.squad}</div>
                  </div>
                </div>
                <div className="text-yellow-400 font-bold text-lg">{cadet.total_score}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          whileHover={{ scale: 1.02, y: -5 }}
        >
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-3 text-blue-400" />
            Статистика по взводам
          </h4>
          <div className="space-y-3">
            {platoons.map((platoon) => {
              const platoonCadets = cadets.filter(c => c.platoon === platoon);
              const avgScore = platoonCadets.length > 0 
                ? Math.round(platoonCadets.reduce((acc, c) => acc + c.total_score, 0) / platoonCadets.length)
                : 0;
              
              return (
                <div key={platoon} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-semibold">{platoon} взвод</div>
                    <div className="text-blue-300 text-sm">{platoonCadets.length} кадетов</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{avgScore}</div>
                    <div className="text-blue-300 text-sm">средний балл</div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'cadets': return renderCadetsTab();
      case 'scores': return renderScoresTab();
      case 'news': return renderNewsTab();
      case 'tasks': return renderTasksTab();
      case 'achievements': return renderAchievementsTab();
      case 'analytics': return renderAnalyticsTab();
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Загрузка административной панели..." size="lg" />
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
            Административная панель
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-6"></div>
          <p className="text-2xl text-white/90 max-w-3xl mx-auto text-shadow text-balance">
            Полное управление системой рейтинга кадетов
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-4 mb-12 overflow-x-auto"
        >
          {tabs.map(({ key, name, icon: Icon }) => (
            <motion.button
              key={key}
              variants={staggerItem}
              onClick={() => setActiveTab(key)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 shadow-2xl ${
                activeTab === key
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-blue-900 shadow-yellow-500/25 scale-105'
                  : 'glass-effect text-white hover:bg-white/20'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span>{name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderTabContent()}
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPage;