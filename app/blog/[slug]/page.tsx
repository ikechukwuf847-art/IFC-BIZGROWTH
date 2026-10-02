import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./blog-detail.css";

export const dynamic = "force-dynamic";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  cover_image_url: string | null;
  author_name: string;
  published_at: string | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: post } = await supabase
    .from("blog")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!post) {
    return {
      title: "Article Not Found | IFC BIZGROWTH",
    };
  }

  return {
    title: `${post.title} | IFC BIZGROWTH`,
    description:
      post.excerpt ||
      "Business insights, growth strategies and practical ideas from IFC BIZGROWTH.",
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: post, error } = await supabase
    .from("blog")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      category,
      cover_image_url,
      author_name,
      published_at
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Blog detail fetch error:", error);
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="blog-detail-page">
      <article className="blog-detail">
        <div className="blog-detail-container">

          <Link href="/blog" className="back-to-blog">
            <span>←</span>
            Back to blog
          </Link>

          <header className="blog-detail-header">
            <div className="blog-detail-category">
              {post.category}
            </div>

            <h1>{post.title}</h1>

            {post.excerpt && (
              <p className="blog-detail-excerpt">
                {post.excerpt}
              </p>
            )}

            <div className="blog-detail-meta">
              <span>By {post.author_name}</span>

              {post.published_at && (
                <>
                  <span className="meta-dot" />
                  <time dateTime={post.published_at}>
                    {formatDate(post.published_at)}
                  </time>
                  <span className="meta-dot" />
                  <span>{readingTime(post.content)}</span>
                </>
              )}
            </div>
          </header>

          <div className="blog-detail-cover">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
              />
            ) : (
              <div className="blog-detail-placeholder">
                <span>IFC</span>
                <small>BIZGROWTH</small>
              </div>
            )}
          </div>

          <div
            className="blog-detail-content"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          />

          <footer className="blog-detail-footer">
            <div>
              <span className="footer-label">
                IFC BIZGROWTH
              </span>

              <h2>
                Keep learning.
                <br />
                Keep growing.
              </h2>

              <p>
                Explore more business insights and practical ideas
                from IFC BIZGROWTH.
              </p>
            </div>

            <Link href="/blog" className="all-articles-link">
              View all articles
              <span>→</span>
            </Link>
          </footer>

        </div>
      </article>
    </main>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(content: string) {
  const plainText = content.replace(/<[^>]*>/g, " ");

  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(2, Math.ceil(words / 200));

  return `${minutes} min read`;
}
