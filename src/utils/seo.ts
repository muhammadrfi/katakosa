/**
 * SEO utilities untuk optimasi meta tags dan structured data
 */

interface MetaTagsConfig {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  locale?: string;
}

interface StructuredDataConfig {
  '@type': string;
  name?: string;
  description?: string;
  url?: string;
  image?: string;
  author?: {
    '@type': 'Person' | 'Organization';
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
}

/**
 * Update document title dengan format yang konsisten
 */
export const updateTitle = (title: string, siteName = 'Katakosa'): void => {
  document.title = title ? `${title} | ${siteName}` : siteName;
};

/**
 * Update meta tags untuk SEO
 */
export const updateMetaTags = (config: MetaTagsConfig): void => {
  const {
    title,
    description,
    keywords,
    author,
    image,
    url,
    type = 'website',
    siteName = 'Katakosa',
    locale = 'id_ID'
  } = config;

  // Update title
  if (title) {
    updateTitle(title, siteName);
  }

  // Update atau create meta tags
  const metaTags = [
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { property: 'og:title', content: title ? `${title} | ${siteName}` : siteName },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: locale },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title ? `${title} | ${siteName}` : siteName },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];

  metaTags.forEach(({ name, property, content }) => {
    if (!content) return;

    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let metaElement = document.querySelector(selector) as HTMLMetaElement;

    if (!metaElement) {
      metaElement = document.createElement('meta');
      if (name) metaElement.name = name;
      if (property) metaElement.setAttribute('property', property);
      document.head.appendChild(metaElement);
    }

    metaElement.content = content;
  });
};

/**
 * Add structured data (JSON-LD) untuk SEO
 */
export const addStructuredData = (data: StructuredDataConfig): void => {
  const structuredData = {
    '@context': 'https://schema.org',
    ...data
  };

  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * Generate canonical URL
 */
export const setCanonicalUrl = (url: string): void => {
  let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  
  if (!linkElement) {
    linkElement = document.createElement('link');
    linkElement.rel = 'canonical';
    document.head.appendChild(linkElement);
  }
  
  linkElement.href = url;
};

/**
 * Add preload hints untuk performance
 */
export const addPreloadHints = (resources: Array<{ href: string; as: string; type?: string }>): void => {
  resources.forEach(({ href, as, type }) => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'preload';
    linkElement.href = href;
    linkElement.as = as;
    if (type) linkElement.type = type;
    document.head.appendChild(linkElement);
  });
};

/**
 * Add DNS prefetch untuk external domains
 */
export const addDnsPrefetch = (domains: string[]): void => {
  domains.forEach(domain => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'dns-prefetch';
    linkElement.href = domain;
    document.head.appendChild(linkElement);
  });
};

/**
 * Generate sitemap data untuk vocabulary pages
 */
export const generateVocabularySitemap = (vocabularies: Array<{ id: string; title: string; updatedAt: string }>): string => {
  const baseUrl = window.location.origin;
  
  const urls = vocabularies.map(vocab => `
  <url>
    <loc>${baseUrl}/kosakata/${vocab.id}</loc>
    <lastmod>${new Date(vocab.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
};

/**
 * SEO-friendly URL slug generator
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Calculate reading time untuk artikel
 */
export const calculateReadingTime = (text: string, wordsPerMinute = 200): number => {
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>): void => {
  const structuredData = {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };

  addStructuredData(structuredData);
};

/**
 * Default SEO configuration untuk aplikasi
 */
export const defaultSEOConfig: MetaTagsConfig = {
  title: 'Katakosa - Aplikasi Pembelajaran Kosakata Bahasa Jepang',
  description: 'Pelajari kosakata bahasa Jepang dengan mudah menggunakan flashcard, latihan, dan AI. Tingkatkan kemampuan bahasa Jepang Anda dengan Katakosa.',
  keywords: 'bahasa jepang, kosakata, flashcard, pembelajaran, AI, latihan, hiragana, katakana, kanji',
  author: 'Katakosa Team',
  type: 'website',
  siteName: 'Katakosa',
  locale: 'id_ID'
};

/**
 * Initialize default SEO settings
 */
export const initializeSEO = (): void => {
  updateMetaTags(defaultSEOConfig);
  setCanonicalUrl(window.location.href);
  
  // Add DNS prefetch untuk external resources
  addDnsPrefetch([
    '//fonts.googleapis.com',
    '//fonts.gstatic.com'
  ]);
};