import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar } from 'lucide-react';
import LazyImage from '../LazyImage';
import { Cadet } from '../../lib/supabase';
import { DEFAULTS, IMAGE_SIZES } from '../../utils/constants';
import { optimizeImageUrl } from '../../utils/performance';
import { fadeInUp, staggerContainer, staggerItem } from '../../utils/animations';

interface CadetHeaderProps {
  cadet: Cadet;
}

const CadetHeader: React.FC<CadetHeaderProps> = ({ cadet }) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="card-gradient from-blue-800 to-blue-900 p-12 mb-12 shadow-2xl hover-lift"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="relative"
        >
          <LazyImage
            src={optimizeImageUrl(
              cadet.avatar_url || DEFAULTS.AVATAR_URL,
              IMAGE_SIZES.AVATAR_LARGE.width,
              IMAGE_SIZES.AVATAR_LARGE.height
            )}
            alt={cadet.name}
            className="w-40 h-40 rounded-full object-cover border-4 border-yellow-400 shadow-2xl hover-glow"
          />
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 rounded-full w-14 h-14 flex items-center justify-center font-black text-xl shadow-2xl hover-glow">
            #{cadet.rank}
          </div>
        </motion.div>

        <div className="flex-grow">
          <motion.h1
            className="text-5xl font-display font-black text-white mb-4 text-shadow text-glow"
          >
            {cadet.name}
          </motion.h1>
          <motion.p
            className="text-blue-200 text-2xl mb-6 font-semibold"
          >
            {cadet.platoon} взвод, {cadet.squad} отделение
          </motion.p>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4"
          >
            <motion.div 
              variants={staggerItem}
              className="glass-effect rounded-xl px-6 py-3 shadow-lg hover-lift"
            >
              <div className="flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span className="text-white font-bold text-lg">{cadet.total_score} баллов</span>
              </div>
            </motion.div>
            <motion.div 
              variants={staggerItem}
              className="glass-effect rounded-xl px-6 py-3 shadow-lg hover-lift"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-300" />
                <span className="text-white font-semibold text-lg">В корпусе с {new Date(cadet.join_date).toLocaleDateString('ru-RU')}</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CadetHeader;