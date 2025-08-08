import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useVirtualization } from '../hooks/useVirtualization';
import OptimizedImage from './OptimizedImage';
import { Cadet } from '../lib/supabase';
import { optimizeImageUrl } from '../utils/performance';
import { IMAGE_SIZES, DEFAULTS } from '../utils/constants';

interface VirtualizedCadetListProps {
  cadets: Cadet[];
  containerHeight: number;
  onScroll: (scrollTop: number) => void;
}

const ITEM_HEIGHT = 120;

const CadetListItem = memo(({ cadet, index }: { cadet: Cadet; index: number }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-500 to-blue-700';
  };

  const getScoreChange = useMemo(() => {
    const changes = [5, -2, 8, 3, -1, 12, 0, 4, -3, 7];
    return changes[parseInt(cadet.id.slice(-1)) % changes.length] || 0;
  }, [cadet.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group hover-lift"
    >
      <Link to={`/cadet/${cadet.id}`}>
        <div className="card-hover p-6 shadow-2xl border border-white/20 hover:border-yellow-400/50 transition-all duration-500">
          <div className="flex items-center space-x-4">
            {/* Rank */}
            <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getRankColor(cadet.rank)} flex items-center justify-center font-bold text-white text-lg shadow-2xl hover-glow`}>
              {getRankIcon(cadet.rank)}
            </div>

            {/* Avatar */}
            <div className="flex-shrink-0">
              <OptimizedImage
                src={optimizeImageUrl(
                  cadet.avatar_url || DEFAULTS.AVATAR_URL,
                  IMAGE_SIZES.AVATAR_MEDIUM.width,
                  IMAGE_SIZES.AVATAR_MEDIUM.height
                )}
                alt={cadet.name}
                className="w-16 h-16 rounded-full border-4 border-white/30 group-hover:border-yellow-400/70 transition-all duration-500 shadow-lg"
                width={IMAGE_SIZES.AVATAR_MEDIUM.width}
                height={IMAGE_SIZES.AVATAR_MEDIUM.height}
              />
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <h3 className="text-xl font-bold text-white group-hover:text-yellow-300 transition-colors text-shadow truncate">
                {cadet.name}
              </h3>
              <p className="text-blue-300 text-base">
                {cadet.platoon} взвод, {cadet.squad} отделение
              </p>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-center">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-2xl font-black text-white text-glow">{cadet.total_score}</span>
                {getScoreChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : getScoreChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                ) : null}
              </div>
              <div className="text-sm text-blue-300 font-semibold">Общий балл</div>
              {getScoreChange !== 0 && (
                <div className={`text-sm font-bold ${getScoreChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {getScoreChange > 0 ? '+' : ''}{getScoreChange}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

CadetListItem.displayName = 'CadetListItem';

const VirtualizedCadetList: React.FC<VirtualizedCadetListProps> = ({
  cadets,
  containerHeight,
  onScroll
}) => {
  const { visibleItems, totalHeight, offsetY, setScrollTop } = useVirtualization(cadets, {
    itemHeight: ITEM_HEIGHT,
    containerHeight,
    overscan: 3
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll(scrollTop);
  };

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <div className="space-y-6">
            {visibleItems.map((cadet, index) => (
              <div key={cadet.id} style={{ height: ITEM_HEIGHT }}>
                <CadetListItem cadet={cadet} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(VirtualizedCadetList);