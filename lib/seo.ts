import type { JobDoc } from './jobs';

export const SITE_ORIGIN = 'https://thecertusgroup.tech';
export const ORG_NAME = 'Certus Technical Search';
export const ORG_LOGO =
  'https://res.cloudinary.com/dvbubqhpp/image/upload/v1770919808/CertusLOGO_szfewa.png';

export function escapeHtml(s = ''): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function jobPath(id: string | number): string {
  return `/jobs/${id}`;
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'full time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'part time': 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  temp: 'TEMPORARY',
  internship: 'INTERN',
  intern: 'INTERN',
};

function employmentType(type = ''): string {
  return EMPLOYMENT_TYPES[type.trim().toLowerCase()] || 'FULL_TIME';
}

function isRemote(job: JobDoc): boolean {
  return /remote|work from home|wfh|telecommute/i.test(
    `${job.location || ''} ${job.type || ''} ${job.title || ''}`
  );
}

// Parse free-text salary like "$80,000 - $100,000", "$45/hr", "Up to $90k".
// Returns a valid schema.org MonetaryAmount, or null if no numbers are present
// (an invalid baseSalary is worse for Google than omitting it).
function parseSalary(salary = ''): Record<string, unknown> | null {
  const unit = /hour|\/hr|hourly/i.test(salary)
    ? 'HOUR'
    : /week/i.test(salary)
      ? 'WEEK'
      : /month/i.test(salary)
        ? 'MONTH'
        : 'YEAR';
  const nums = (salary.match(/\d[\d,]*(?:\.\d+)?/g) || [])
    .map((n) => parseFloat(n.replace(/,/g, '')))
    .filter((n) => !Number.isNaN(n) && n > 0)
    // crude "k" handling: "90k" -> 90000
    .map((n) => (n < 1000 && /k/i.test(salary) && unit === 'YEAR' ? n * 1000 : n));
  if (!nums.length) return null;
  const value: Record<string, unknown> = { '@type': 'QuantitativeValue', unitText: unit };
  if (nums.length >= 2) {
    value.minValue = Math.min(...nums);
    value.maxValue = Math.max(...nums);
  } else {
    value.value = nums[0];
  }
  return { '@type': 'MonetaryAmount', currency: 'CAD', value };
}

function descriptionHtml(job: JobDoc): string {
  const parts: string[] = [];
  if (job.summary) parts.push(`<p>${escapeHtml(job.summary)}</p>`);
  if (job.description) parts.push(`<p>${escapeHtml(job.description)}</p>`);
  if (job.responsibilities?.length) {
    parts.push(
      `<h3>Responsibilities</h3><ul>${job.responsibilities
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join('')}</ul>`
    );
  }
  if (job.requirements?.length) {
    parts.push(
      `<h3>Requirements</h3><ul>${job.requirements
        .map((r) => `<li>${escapeHtml(r)}</li>`)
        .join('')}</ul>`
    );
  }
  return parts.join('') || `<p>${escapeHtml(job.title || 'Career opportunity')}</p>`;
}

function isoDate(input?: string): string {
  const t = input ? Date.parse(input) : NaN;
  const d = Number.isNaN(t) ? new Date() : new Date(t);
  return d.toISOString().slice(0, 10);
}

// schema.org JobPosting for Google for Jobs. Returns a plain object.
export function jobPostingJsonLd(job: JobDoc): Record<string, unknown> {
  const datePosted = isoDate(job.createdAt || job.posted);
  const base = Date.parse(job.createdAt || job.posted || '') || Date.now();
  const validThrough = new Date(base + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: job.title,
    description: descriptionHtml(job),
    datePosted,
    validThrough,
    employmentType: employmentType(job.type),
    directApply: true,
    hiringOrganization: {
      '@type': 'Organization',
      name: ORG_NAME,
      sameAs: SITE_ORIGIN,
      logo: ORG_LOGO,
    },
  };

  if (job.ref) {
    schema.identifier = { '@type': 'PropertyValue', name: ORG_NAME, value: job.ref };
  }

  const salary = parseSalary(job.salary);
  if (salary) schema.baseSalary = salary;

  if (isRemote(job)) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = { '@type': 'Country', name: 'Canada' };
  } else {
    const [locality, region] = (job.location || '').split(',').map((s) => s.trim());
    schema.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: locality || job.location || 'Canada',
        addressRegion: region || 'ON',
        addressCountry: 'CA',
      },
    };
  }

  return schema;
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: ORG_NAME,
    url: SITE_ORIGIN,
    logo: ORG_LOGO,
    description:
      'Specialized recruitment and executive search for skilled trades, industrial maintenance, engineering operations and technical roles across Canada.',
    areaServed: 'CA',
    sameAs: ['https://www.linkedin.com/showcase/certus-technical-search/'],
  };
}
