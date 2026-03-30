import React from 'react';
import { Helmet } from 'react-helmet-async';
import { JobPosting } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'jobPosting';
  job?: JobPosting;
  isGateway?: boolean;
  schemaOnly?: boolean;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "Certus Technical Search | Specialized Technical Recruitment",
  description = "Certus Technical Search specializes in connecting licensed and certified professionals with leading employers across material handling, manufacturing, transportation, and industrial services.",
  keywords = "technical recruitment, skilled trades hiring, industrial maintenance jobs, engineering recruitment, manufacturing headhunters, Toronto recruitment agency",
  canonical = "https://certusgroup.com/technical-search",
  ogImage = "https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png",
  ogType = "website",
  job,
  isGateway = false,
  schemaOnly = false
}) => {
  const siteName = "Certus Technical Search";
  
  // Adjust title and description for Gateway if needed
  const finalTitle = isGateway 
    ? "Certus Technical Search | Certainty Delivered" 
    : title.includes(siteName) ? title : `${title} | ${siteName}`;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "RecruitmentAgency",
    "name": "Certus Technical Search",
    "alternateName": "Certus Group",
    "url": "https://certusgroup.com/technical-search",
    "logo": "https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png",
    "description": "Certus Technical Search is part of The Certus Group of Companies Inc., specializing in technical and skilled trades recruitment since 2008.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "91 Skyway Avenue, Suite 206",
      "addressLocality": "Toronto",
      "addressRegion": "ON",
      "postalCode": "M9W 6R5",
      "addressCountry": "CA"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-437-295-1799",
      "contactType": "customer service",
      "email": "info@certusgroup.com",
      "availableLanguage": ["English", "French"]
    },
    "sameAs": [
      "https://www.linkedin.com/showcase/certus-technical-search/"
    ],
    "areaServed": "North America",
    "foundingDate": "2008"
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Technical Recruitment & Executive Search",
    "provider": {
      "@type": "RecruitmentAgency",
      "name": "Certus Technical Search"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    },
    "description": "Specialized recruitment services for skilled trades, industrial maintenance, and technical operations."
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://certusgroup.com/technical-search"
      },
      job ? {
        "@type": "ListItem",
        "position": 2,
        "name": "Job Board",
        "item": "https://certusgroup.com/technical-search/jobs"
      } : null,
      job ? {
        "@type": "ListItem",
        "position": 3,
        "name": job.title,
        "item": `https://certusgroup.com/technical-search/jobs/${job.id}`
      } : null
    ].filter(Boolean)
  };

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
    "industry": "Technical Operations",
    "occupationalCategory": job.title
  } : null;

  return (
    <Helmet>
      {!schemaOnly && (
        <>
          {/* Basic Meta Tags */}
          <title>{finalTitle}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          <meta name="robots" content="index, follow" />
          <link rel="canonical" href={canonical} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content={ogType} />
          <meta property="og:url" content={canonical} />
          <meta property="og:title" content={finalTitle} />
          <meta property="og:description" content={description} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:site_name" content={siteName} />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={canonical} />
          <meta name="twitter:title" content={finalTitle} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={ogImage} />
        </>
      )}

      {/* Structured Data */}
      {!schemaOnly && (
        <>
          <script type="application/ld+json">
            {JSON.stringify(organizationSchema)}
          </script>
          
          <script type="application/ld+json">
            {JSON.stringify(serviceSchema)}
          </script>

          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        </>
      )}

      {jobSchema && (
        <script type="application/ld+json">
          {JSON.stringify(jobSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
