import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./docs.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Documentation | IFC BIZGROWTH",
  description:
    "Official documentation and guides published by IFC BIZGROWTH.",
};

export default async function DocsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: docs, error } = await supabase
    .from("doc")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        category,
        cover_image_url,
        published_at,
        created_at,
        updated_at
      `
    )
    .eq("is_published", true)
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Documentation fetch error:", error);
  }

  return (
    <main className="docs-page">
      {/* HERO */}
      <section className="docs-hero">
        <div className="docs-container">
          <div className="docs-hero-content">
            <span className="docs-eyebrow">
              IFC BIZGROWTH • DOCUMENTATION
            </span>

            <h1>
              Information for businesses,
              <span> customers and partners.</span>
            </h1>

            <p>
              Explore official documentation published by IFC BIZGROWTH.
              Learn how the platform works, understand its services and find
              useful information about using IFC BIZGROWTH.
            </p>
          </div>
        </div>
      </section>

      {/* DOCUMENTATION */}
      <section className="docs-section">
        <div className="docs-container">
          <div className="docs-section-heading">
            <div>
              <span className="docs-small-label">
                KNOWLEDGE CENTRE
              </span>

              <h2>Documentation</h2>
            </div>

            <p>
              Official guides and information published by the IFC BIZGROWTH
              team.
            </p>
          </div>

          {error ? (
            <div className="docs-state docs-error">
              <div className="docs-state-icon">!</div>

              <h3>Documentation is temporarily unavailable</h3>

              <p>
                Please try again later.
              </p>
            </div>
          ) : !docs || docs.length === 0 ? (
            <div className="docs-state">
              <div className="docs-state-icon">◫</div>

              <h3>No documentation published yet</h3>

              <p>
                The IFC BIZGROWTH team has not published any documentation
                here yet.
              </p>
            </div>
          ) : (
            <div className="docs-grid">
              {docs.map((doc) => (
                <article className="doc-card" key={doc.id}>
                  {doc.cover_image_url ? (
                    <div className="doc-card-image">
                      <img
                        src={doc.cover_image_url}
                        alt=""
                      />
                    </div>
                  ) : (
                    <div className="doc-card-placeholder">
                      <span>IFC</span>
                      <strong>BIZGROWTH</strong>
                    </div>
                  )}

                  <div className="doc-card-body">
                    <div className="doc-card-meta">
                      <span>{doc.category}</span>

                      {doc.published_at && (
                        <time dateTime={doc.published_at}>
                          {new Date(
                            doc.published_at
                          ).toLocaleDateString("en-NG", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      )}
                    </div>

                    <h3>{doc.title}</h3>

                    {doc.excerpt && (
                      <p>{doc.excerpt}</p>
                    )}

                    <Link
                      href={`/docs/${doc.slug}`}
                      className="doc-read-link"
                    >
                      Read documentation
                      <span>→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* INFORMATION */}
      <section className="docs-info">
        <div className="docs-container">
          <div className="docs-info-card">
            <div>
              <span className="docs-small-label">
                OFFICIAL INFORMATION
              </span>

              <h2>
                Documentation published by IFC BIZGROWTH.
              </h2>

              <p>
                Documentation available on this page is published through the
                IFC BIZGROWTH documentation system. Information may be updated
                as the platform develops.
              </p>
            </div>

            <div className="docs-info-mark">
              IFC
            </div>
          </div>
        </div>
      </section>
    </main>
  );
    }
