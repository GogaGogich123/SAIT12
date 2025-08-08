import React from 'react';
import OptimizedImage from './OptimizedImage';

// Backward compatibility wrapper
const LazyImage: React.FC<React.ComponentProps<typeof OptimizedImage>> = (props) => {
  return <OptimizedImage {...props} />;
};

export default LazyImage;