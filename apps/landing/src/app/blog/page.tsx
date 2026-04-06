'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface BlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  tags: string[] | null;
  publishedAt: string | null;
  coverImage: string | null;
}

interface BlogPostFull extends BlogPostSummary {
  content: string;
}

const tagColors: Record<string, string> = {
  FinOps: 'bg-cyan-500/10 text-cyan-400',
  Security: 'bg-violet-500/10 text-violet-400',
  CVE: 'bg-red-500/10 text-red-400',
  'Threat Intelligence': 'bg-amber-500/10 text-amber-400',
  'Cloud Costs': 'bg-emerald-500/10 text-emerald-400',
  'Best Practices': 'bg-blue-500/10 text-blue-400',
  AWS: 'bg-orange-500/10 text-orange-400',
  Optimization: 'bg-teal-500/10 text-teal-400',
  'Cloud Strategy': 'bg-indigo-500/10 text-indigo-400',
  'Cloud Security': 'bg-rose-500/10 text-rose-400',
};

function getTagColor(tag: string): string {
  return tagColors[tag] || 'bg-slate-500/10 text-slate-400';
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, "<h3 class='text-xl font-semibold text-white mt-8 mb-3'>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class='text-2xl font-bold text-white mt-10 mb-4'>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class='text-3xl font-bold text-white mt-10 mb-4'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-semibold'>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li class='ml-6 list-disc text-slate-300 leading-relaxed'>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class='ml-6 list-decimal text-slate-300 leading-relaxed'>$1</li>")
    .replace(/\n\n/g, "</p><p class='text-slate-300 leading-relaxed mb-4'>");

  html = `<p class='text-slate-300 leading-relaxed mb-4'>${html}</p>`;
  html = html.replace(/<p class='text-slate-300 leading-relaxed mb-4'>\s*<\/p>/g, '');
  return html;
}

function getSlugFromPath(): string | null {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  // /blog/ -> null (listing), /blog/some-slug/ -> "some-slug"
  const match = path.match(/^\/blog\/([a-z0-9][a-z0-9-]*[a-z0-9])\/?$/);
  return match ? match[1] : null;
}

function BlogListing() {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('https://dashboard.clouddory.com/api/blog');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Blog
            </span>
            <h1 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Insights &{' '}
              <span className="text-gradient">Updates</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Cloud cost optimization, security best practices, and threat intelligence insights from the CloudDory team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="relative py-24 lg:py-32">
        <div className="section-divider mb-24" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <p className="text-xl text-slate-400">
                Coming soon — our blog is being set up
              </p>
              <p className="text-sm text-slate-500 mt-3">
                Check back shortly for cloud cost optimization insights, security best practices, and more.
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <a
                    href={`/blog/${post.slug}/`}
                    className="card-hover group relative rounded-2xl p-7 bg-navy-900/40 border border-white/5 hover:border-cyan-500/15 transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {Array.isArray(post.tags) &&
                        post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      {post.publishedAt && (
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-semibold text-lg text-white mb-3 group-hover:text-cyan-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-400 leading-relaxed flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{post.authorName}</span>
                      <span className="flex items-center gap-2 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                        Read more
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5-5 5M6 12h12"
                          />
                        </svg>
                      </span>
                    </div>
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function BlogPostView({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(
          `https://dashboard.clouddory.com/api/blog/${slug}`
        );
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setPost(data.post);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="relative flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 grid-bg" />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
            <p className="text-slate-400 mb-8">
              The blog post you are looking for does not exist or has been removed.
            </p>
            <a
              href="/blog/"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Back to Blog
            </a>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
      <div className="absolute inset-0 grid-bg" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Back link */}
          <a
            href="/blog/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </a>

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${getTagColor(tag)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-slate-400 mb-12 pb-8 border-b border-white/5">
            <span>{post.authorName}</span>
            {post.publishedAt && (
              <>
                <span className="text-slate-600">|</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Bottom nav */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <a
              href="/blog/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All Posts
            </a>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

export default function BlogPage() {
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSlug(getSlugFromPath());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <main className="relative">
        <Navbar />
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950" />
          <div className="absolute inset-0 grid-bg" />
          <div className="relative flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative">
      <Navbar />
      {slug ? <BlogPostView slug={slug} /> : <BlogListing />}
      <Footer />
    </main>
  );
}
