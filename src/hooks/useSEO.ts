import { useEffect } from 'react';
import { updatePageTitle, updateMetaDescription, updateMetaKeywords, updateOpenGraphTags } from '../utils/seo';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
}

export const useSEO = (data: SEOData) => {
  useEffect(() => {
    if (data.title) {
      updatePageTitle(data.title);
    }
    
    if (data.description) {
      updateMetaDescription(data.description);
    }
    
    if (data.keywords) {
      updateMetaKeywords(data.keywords);
    }
    
    updateOpenGraphTags({
      title: data.title,
      description: data.description,
      image: data.ogImage,
      url: window.location.href,
      type: data.ogType || 'website'
    });
  }, [data]);
};