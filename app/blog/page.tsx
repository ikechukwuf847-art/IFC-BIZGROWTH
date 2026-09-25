import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./blog.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog | IFC BIZGROWTH",
  description:
    "Business insights, growth strategies, marketing ideas and stories from IFC BIZGROWTH.",
};

export default async function BlogPage() {
  const supabase = await createSupabaseServerClient();

  const { data: posts, error } = await supabase
    .from("blog")
    .select(`
      id,
      title,
      slug,
      excerpt,
      category,
      cover_image_url,
      author_name,
      published_at
    `)
    .eq("is_published", true)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error("Blog fetch error:", error);
  }

  const articles = posts || [];
  const featured = articles[0];
  const latest = articles.slice(1);

  const categories = Array.from(
    new Set(
      articles
        .map((post) => post.category)
        .filter(Boolean)
    )
  );

  return (
    <main className="blog-page">

      {/* TOP INTRO */}
      <section className="blog-intro">
        <div className="blog-container">

          <div className="blog-brand-row">
            <div>
              <span className="blog-overline">
                IFC BIZGROWTH
              </span>

              <h1>The Business Growth Journal</h1>
            </div>

            <p>
              Practical ideas, insights and stories for businesses
              building, marketing and growing in Africa.
            </p>
          </div>

        </div>
      </section>

      {/* CATEGORY NAVIGATION */}
      <nav className="blog-category-nav">
        <div className="blog-container">

          <div className="blog-category-scroll">

            <Link
              href="/blog"
              className="blog-category active"
            >
              All
            </Link>

            {categories.map((category) => (
              <span
                className="blog-category"
                key={category}
              >
                {category}
              </span>
            ))}

          </div>

        </div>
      </nav>

      {/* MAIN */}
      <section className="blog-main">
        <div className="blog-container">

          {error ? (
            <div className="blog-empty">
              <h2>Something went wrong</h2>
              <p>
                We couldn't load the blog right now. Please try again later.
              </p>
            </div>
          ) : !featured ? (
            <div className="blog-empty">
              <div className="blog-empty-icon">
                ✦
              </div>

              <h2>Articles are coming soon</h2>

              <p>
                IFC BIZGROWTH hasn't published any articles yet.
              </p>
            </div>
          ) : (
            <>
              {/* FEATURED STORY */}
              <section className="featured-story">

                <div className="featured-image">

                  {featured.cover_image_url ? (
                    <img
                      src={featured.cover_image_url}
                      alt={featured.title}
                    />
                  ) : (
                    <div className="article-placeholder">
                      <span>IFC</span>
                      <small>BIZGROWTH</small>
                    </div>
                  )}

                </div>

                <div className="featured-content">

                  <div className="article-category">
                    {featured.category}
                  </div>

                  <h2>
                    {featured.title}
                  </h2>

                  {featured.excerpt && (
                    <p className="featured-excerpt">
                      {featured.excerpt}
                    </p>
                  )}

                  <div className="article-info">
                    <span>
                      By {featured.author_name}
                    </span>

                    {featured.published_at && (
                      <>
                        <i />
                        <time>
                          {formatDate(featured.published_at)}
                        </time>
                        <i />
                        <span>
                          {readingTime(featured.excerpt)}
                        </span>
                      </>
                    )}
                  </div>

                  <Link
                    href={`/blog/${featured.slug}`}
                    className="read-story"
                  >
                    Read story
                    <span>→</span>
                  </Link>

                </div>

              </section>

              {/* LATEST */}
              {latest.length > 0 && (
                <section className="latest-section">

                  <div className="section-heading">

                    <div>
                      <span>
                        FROM THE JOURNAL
                      </span>

                      <h2>Latest articles</h2>
                    </div>

                    <p>
                      New ideas and useful perspectives from
                      IFC BIZGROWTH.
                    </p>

                  </div>

                  <div className="article-grid">

                    {latest.map((post) => (
                      <article
                        className="article-card"
                        key={post.id}
                      >

                        <Link
                          href={`/blog/${post.slug}`}
                          className="article-image"
                        >

                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                            />
                          ) : (
                            <div className="article-placeholder">
                              <span>IFC</span>
                              <small>BIZGROWTH</small>
                            </div>
                          )}

                        </Link>

                        <div className="article-body">

                          <div className="article-category">
                            {post.category}
                          </div>

                          <h3>
                            <Link
                              href={`/blog/${post.slug}`}
                            >
                              {post.title}
                            </Link>
                          </h3>

                          {post.excerpt && (
                            <p>
                              {post.excerpt}
                            </p>
                          )}

                          <div className="article-info">

                            <span>
                              By {post.author_name}
                            </span>

                            {post.published_at && (
                              <>
                                <i />
                                <time>
                                  {formatDate(
                                    post.published_at
                                  )}
                                </time>
                              </>
                            )}

                          </div>

                        </div>

                      </article>
                    ))}

                  </div>

                </section>
              )}

              {/* NEWSLETTER / CTA */}
              <section className="blog-subscribe">

                <div className="subscribe-content">

                  <span className="blog-overline">
                    IFC BIZGROWTH
                  </span>

                  <h2>
                    Keep learning. Keep growing.
                  </h2>

                  <p>
                    Explore practical ideas for building stronger
                    businesses and reaching more customers.
                  </p>

                </div>

                <Link
                  href="/"
                  className="subscribe-link"
                >
                  Explore IFC BIZGROWTH
                  <span>→</span>
                </Link>

              </section>
            </>
          )}

        </div>
      </section>

    </main>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readingTime(excerpt: string | null) {
  if (!excerpt) return "3 min read";

  const words = excerpt.trim().split(/\s+/).length;
  const minutes = Math.max(2, Math.ceil(words / 40));

  return `${minutes} min read`;
}
