import { BlogPost } from '../types';
import postsData from '../data/blog.json';

// ─────────────────────────────────────────────────────────────────────────
// Insights / blog content.
//
// Single source of truth lives in data/blog.json so the server (api/render.ts
// for SSR meta + JSON-LD, api/sitemap.ts) can read the same data the client
// renders. To publish a post: add an object to data/blog.json with a unique
// `slug` (URL: /insights/your-slug) and the body in `content` as Markdown.
// Newest `date` shows first.
// ─────────────────────────────────────────────────────────────────────────

const POSTS = postsData as BlogPost[];

/** Posts, newest first. */
export const getBlogPosts = (): BlogPost[] =>
  [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

export const getBlogPost = (slug: string): BlogPost | undefined =>
  POSTS.find((p) => p.slug === slug);

/** Raw list — used by the server to build the sitemap. */
export const BLOG_POSTS = POSTS;
