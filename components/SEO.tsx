import React from 'react';
import { Helmet } from 'react-helmet-async';
import { JobPosting } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  job?: JobPosting;
  isGateway?: boolean;
  schemaOnly?: boolean;
}

const SITE_ORIGIN = 'https://thecertusgroup.tech';
const SITE_NAME = 'Certus Technical Search';
const DEFAULT_IMAGE =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

/**
 * Client-side <head> management for titles, descriptions and Open Graph tags,
 * used for in-app (SPA) navigation and as a baseline in dev.
 *
 * Structured data (JSON-LD) is intentionally NOT emitted here:
 *  - Organization + WebSite live statically in index.html.
 *  - JobPosting is injected server-side per /jobs/:id by api/render.ts.
 * Emitting it again from the client would create duplicate/competing schema,
 * so legacy `schemaOnly` usages now render nothing.
 */
const SEO: React.FC<SEOProps> = ({
  title = 'Certus Technical Search | Skilled Trades & Industrial Recruitment',
  description = 'Certus Technical Search connects licensed and certified professionals with leading employers across skilled trades, industrial maintenance, engineering operations and technical roles in Canada.',
  keywords = 'technical recruitment, skilled trades jobs, industrial maintenance jobs, engineering recruitment, technician jobs Canada, recruitment agency',
  canonical,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  job,
  isGateway = false,
  schemaOnly = false,
}) => {
  // Structured data is owned server-side / statically — nothing to emit here.
  if (schemaOnly) return null;

  const finalTitle = isGateway
    ? `${SITE_NAME} | Certainty Delivered`
    : title.includes(SITE_NAME)
      ? title
      : `${title} | ${SITE_NAME}`;

  const finalDescription = job?.summary || description;

  // Anchor canonical to the real domain + current path so it can't drift back
  // to the wrong host on hydration.
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const finalCanonical =
    canonical || `${SITE_ORIGIN}${path === '/' ? '/' : path.replace(/\/$/, '')}`;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={finalCanonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={finalCanonical} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
