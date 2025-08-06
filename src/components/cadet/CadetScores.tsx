import React from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, Users } from 'lucide-react';
import ProgressBar from '../ProgressBar';
import { Score } from '../../lib/supabase';
import { fadeInUp } from '../../utils/animations';

interface CadetScoresProps {
  scores: Score | null;
}

const CadetScores: React.FC<CadetScoresProps> = ({ scores }) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-hover p-8 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Target className="h-8 w-8 text-yellow-400" />
        <h2 className="text-3xl font-display font-bold text-white text-shadow">Текущие баллы</h2>
      </div>
      <div className="space-y-6">
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg hover-glow"
        >
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-200" />
            <span className="text-white font-bold text-lg">Учёба</span>
          </div>
          <span className="text-3xl font-black text-white text-glow">{scores?.study_score || 0}</span>
          <div className="mt-2">
            <ProgressBar 
              value={scores?.study_score || 0} 
              max={100} 
              color="from-blue-500 to-blue-700"
              showPercentage={false}
            />
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-lg hover-glow"
        >
          <div className="flex items-center space-x-3">
            <Target className="h-6 w-6 text-red-200" />
            <span className="text-white font-bold text-lg">Дисциплина</span>
          </div>
          <div>
            <span className="text-3xl font-black text-white text-glow">{scores?.discipline_score || 0}</span>
            <div className="mt-2">
              <ProgressBar 
                value={scores?.discipline_score || 0} 
                max={100} 
                color="from-red-500 to-red-700"
                showPercentage={false}
              />
            </div>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.05, y: -5 }}
          className="p-6 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg hover-glow"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-green-200" />
            <span className="text-white font-bold text-lg">Мероприятия</span>
          </div>
          <div>
            <span className="text-3xl font-black text-white text-glow">{scores?.events_score || 0}</span>
            <div className="mt-2">
              <ProgressBar 
                value={scores?.events_score || 0} 
                max={100} 
                color="from-green-500 to-green-700"
                showPercentage={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CadetScores;