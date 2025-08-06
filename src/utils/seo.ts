// SEO утилиты
export const updatePageTitle = (title: string, siteName = 'НККК') => {
  document.title = `${title} | ${siteName}`;
};

export const updateMetaDescription = (description: string) => {
  let metaDescription = document.querySelector('meta[name="description"]');
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  
  metaDescription.setAttribute('content', description);
};

export const updateMetaKeywords = (keywords: string[]) => {
  let metaKeywords = document.querySelector('meta[name="keywords"]');
  
  if (!metaKeywords) {
    metaKeywords = document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    document.head.appendChild(metaKeywords);
  }
  
  metaKeywords.setAttribute('content', keywords.join(', '));
};

export const updateOpenGraphTags = (data: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}) => {
  const updateOrCreateMetaTag = (property: string, content: string) => {
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    
    metaTag.setAttribute('content', content);
  };

  if (data.title) updateOrCreateMetaTag('og:title', data.title);
  if (data.description) updateOrCreateMetaTag('og:description', data.description);
  if (data.image) updateOrCreateMetaTag('og:image', data.image);
  if (data.url) updateOrCreateMetaTag('og:url', data.url);
  if (data.type) updateOrCreateMetaTag('og:type', data.type);
};

export const addStructuredData = (data: object) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

// Генерация structured data для организации
export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Новороссийский казачий кадетский корпус",
    "alternateName": "НККК",
    "description": "Кадетский корпус для воспитания лидеров будущего через традиции, дисциплину и стремление к совершенству",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Новороссийск",
      "addressCountry": "RU"
    }
  };
};