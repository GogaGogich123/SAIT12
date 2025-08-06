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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';
import ModernBackground from '../components/ModernBackground';
import AnimatedSVGBackground from '../components/AnimatedSVGBackground';
import LoadingSpinner from '../components/LoadingSpinner';
import { supabase } from '../lib/supabase';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

interface Cadet {
  id: string;
  name: string;
  email: string;
  platoon: string;
  squad: number;
  total_score: number;
  rank: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'discipline' | 'events';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  deadline: string;
  status: 'active' | 'inactive';
}

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'cadets' | 'tasks' | 'achievements'>('cadets');
  const [cadets, setCadets] = useState<Cadet[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [showAddCadet, setShowAddCadet] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingCadet, setEditingCadet] = useState<Cadet | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form data
  const [cadetForm, setCadetForm] = useState({
    name: '',
    email: '',
    platoon: '10-1',
    squad: 1
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'study' as 'study' | 'discipline' | 'events',
    points: 10,
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    deadline: ''
  });

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Получаем кадетов
      const { data: cadetsData, error: cadetsError } = await supabase
        .from('cadets')
        .select('*')
        .order('rank', { ascending: true });
      
      if (cadetsError) throw cadetsError;
      setCadets(cadetsData || []);
      
      // Получаем задания
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

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
      setCadetForm({ name: '', email: '', platoon: '10-1', squad: 1 });
    } catch (err: any) {
      console.error('Error adding cadet:', err);
      alert('Ошибка при добавлении кадета: ' + err.message);
    }
  };

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
      setTaskForm({
        title: '',
        description: '',
        category: 'study',
        points: 10,
        difficulty: 'easy',
        deadline: ''
      });
    } catch (err: any) {
      console.error('Error adding task:', err);
      alert('Ошибка при добавлении задания: ' + err.message);
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
              Управление кадетами, заданиями и достижениями
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
                  <div className="flex space-x-2">
                    {[
                      { key: 'cadets', name: 'Кадеты', icon: Users },
                      { key: 'tasks', name: 'Задания', icon: BookOpen },
                      { key: 'achievements', name: 'Достижения', icon: Award }
                    ].map(({ key, name, icon: Icon }) => (
                      <motion.button
                        key={key}
                        variants={staggerItem}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveTab(key as any)}
                        className={`flex items-center space-x-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-500 ${
                          activeTab === key
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'text-blue-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
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
                                onClick={() => setEditingCadet(cadet)}
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
                              onClick={() => setEditingTask(task)}
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

              {/* Achievements Tab */}
              {activeTab === 'achievements' && (
                <motion.div
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  <h2 className="text-4xl font-display font-bold text-white">Управление достижениями</h2>
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                    <p className="text-blue-200 text-xl">Функционал в разработке</p>
                  </div>
                </motion.div>
              )}
            </>
          )}

          {/* Add Cadet Modal */}
          {showAddCadet && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-2xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">Добавить кадета</h3>
                  <button
                    onClick={() => setShowAddCadet(false)}
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
                    onClick={handleAddCadet}
                    disabled={!cadetForm.name || !cadetForm.email}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowAddCadet(false)}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Task Modal */}
          {showAddTask && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-effect rounded-3xl max-w-3xl w-full p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-white">Добавить задание</h3>
                  <button
                    onClick={() => setShowAddTask(false)}
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
                    onClick={handleAddTask}
                    disabled={!taskForm.title || !taskForm.description || !taskForm.deadline}
                    className="flex-1 btn-primary disabled:opacity-50"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    Добавить
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
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