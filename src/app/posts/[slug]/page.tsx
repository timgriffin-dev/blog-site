import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '../../../lib/posts';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 text-foreground">
      <nav className="bg-white dark:bg-stone-800 shadow-sm border-b border-stone-200 dark:border-stone-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium transition-colors">
            ← Back to Blog
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
          <header className="px-8 py-12 border-b border-stone-100 dark:border-stone-700">
            <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center text-stone-500 dark:text-stone-400">
              <time>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            
            {post.description && (
              <p className="text-xl text-stone-600 dark:text-stone-300 mt-4 leading-relaxed">
                {post.description}
              </p>
            )}
          </header>

          <div className="px-8 py-12">
            <div 
              className="prose prose-lg max-w-none prose-stone dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />
          </div>
        </article>

        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-amber-700 dark:bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-800 dark:hover:bg-amber-700 transition-colors shadow-sm"
          >
            ← Back to All Posts
          </Link>
        </div>
      </main>
    </div>
  );
}