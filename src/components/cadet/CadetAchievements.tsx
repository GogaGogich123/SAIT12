import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, CheckCircle, Zap, Shield, Users, Flame, BookOpen, Crown, Trophy, Heart } from 'lucide-react';
import { CadetAchievement } from '../../lib/supabase';
import { fadeInUp, staggerItem } from '../../utils/animations';

interface CadetAchievementsProps {
  achievements: CadetAchievement[];
}

const CadetAchievements: React.FC<CadetAchievementsProps> = ({ achievements }) => {
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      CheckCircle, Zap, Star, Shield, Users, Flame, BookOpen, Crown, Trophy, Heart
    };
    return icons[iconName] || Star;
  };

  const adminAchievements = achievements.filter(a => a.achievement);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-hover p-8 shadow-2xl"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Award className="h-8 w-8 text-yellow-400" />
        <h2 className="text-3xl font-display font-bold text-white text-shadow">Достижения</h2>
      </div>
      <div className="space-y-6">
        {adminAchievements.map((achievement, index) => {
          const achievementData = achievement.achievement!;
          const IconComponent = getIconComponent(achievementData.icon);
          
          return (
          <motion.div
            key={achievement.id}
            variants={staggerItem}
            whileHover={{ scale: 1.05, y: -5 }}
            className={`p-6 bg-gradient-to-r ${achievementData.color} rounded-2xl shadow-2xl hover-glow`}
          >
            <div className="flex items-start space-x-3">
              <IconComponent className="h-8 w-8 text-white flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">{achievementData.title}</h3>
                <p className="text-white/90 text-base mb-3">{achievementData.description}</p>
                <span className="text-white/70 text-sm font-semibold">
                  {new Date(achievement.awarded_date).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </motion.div>
          );
        })}
        {adminAchievements.length === 0 && (
          <p className="text-blue-300 text-center py-8 text-lg">Пока нет достижений от администрации</p>
        )}
      </div>
    </motion.div>
  );
};

export default CadetAchievements;