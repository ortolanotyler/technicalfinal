import React from 'react';
import { Helmet } from 'react-helmet-async';
import { JobPosting } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'jobPosting';
  job?: JobPosting;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Certus Technical Search | Skilled Trades & Operations Recruitment",
  description = "Certus Technical Search specializes in connecting licensed and certified professionals with leading employers across construction, manufacturing, transportation, and industrial services.",
  canonical = "https://certusgroup.com/technical-search",
  ogImage = "https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png",
  ogType = "website",
  job
}) => {
  const siteName = "Certus Technical Search";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const jobSchema = job ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": `
      <p>${job.summary}</p>
      <h3>Responsibilities:</h3>
      <ul>${job.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>
      <h3>Requirements:</h3>
      <ul>${job.requirements.map(r => `<li>${r}</li>`).join('')}</ul>
    `,
    "datePosted": job.createdAt || new Date().toISOString().split('T')[0],
    "validThrough": new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Certus Technical Search",
      "sameAs": "https://certusgroup.com/",
      "logo": "https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location.split(',')[0].trim(),
        "addressRegion": job.location.split(',')[1]?.trim() || "ON",
        "addressCountry": "CA"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "CAD",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary,
        "unitText": "YEAR"
      }
    },
    "industry": "Skilled Trades",
    "occupationalCategory": job.title
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {jobSchema && (
        <script type="application/ld+json">
          {JSON.stringify(jobSchema)}
        </script>
      )}
      
      {!job && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Certus Technical Search",
            "url": "https://certusgroup.com/",
            "logo": "https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png",
            "description": "Certus Technical Search is part of The Certus Group of Companies Inc., specializing in technical and skilled trades recruitment.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CA"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
