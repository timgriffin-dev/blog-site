'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  slug: string;
  title: string;
  date: string;
  description?: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.description && post.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-foreground py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-stone-300 dark:bg-stone-700 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-2/3 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-stone-800 p-6 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700">
                  <div className="h-6 bg-stone-300 dark:bg-stone-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-stone-300 dark:bg-stone-700 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-foreground">
      {/* Header */}
      <header className="bg-white dark:bg-stone-800 shadow-sm border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Tim Griffin
          </h1>
          <p className="text-xl text-stone-600 dark:text-stone-300">
            Software engineering, privacy, security, and emerging tech
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-colors text-stone-800 dark:text-stone-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-stone-400 dark:text-stone-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400 text-lg">No posts found matching &quot;{searchTerm}&quot;</p>
          </div>
        )}

        <div className="space-y-8">
          {filteredPosts.map((post) => (
            <article
              key={post.slug}
              className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200"
            >
              <div className="p-8">
                <Link href={`/posts/${post.slug}`} className="group">
                  <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                <p className="text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                  {post.description || 'Click to read more...'}
                </p>
                
                <div className="flex items-center justify-between">
                  <time className="text-sm text-stone-500 dark:text-stone-400">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                  
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium text-sm transition-colors"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 mt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-stone-500 dark:text-stone-400 text-center">
            © 2025 Tim Griffin
          </p>
        </div>
      </footer>
    </div>
  );
}