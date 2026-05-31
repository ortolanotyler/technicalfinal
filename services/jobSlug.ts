// Human-readable job URL slugs, e.g. "service-manager-trd-2817".
// The same logic is duplicated verbatim in api/render.ts and api/sitemap.ts
// (those run as @vercel/node functions and can't import across directories),
// so keep all three in sync.
export function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

export function jobSlug(job: { title?: string; ref?: string; id: string | number }): string {
  return slugify(`${job.title || 'job'} ${job.ref || job.id}`) || String(job.id);
}
