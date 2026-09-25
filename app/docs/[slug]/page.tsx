import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import "./doc-detail.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: doc } = await supabase
    .from("doc")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (!doc) {
    return {
      title: "Documentation | IFC BIZGROWTH",
    };
  }

  return {
    title: `${doc.title} | IFC BIZGROWTH`,
    description:
      doc.excerpt ||
      `Official IFC BIZGROWTH documentation: ${doc.title}`,
  };
}

export default async function DocumentationDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;

  const supabase = await createSupabaseServerClient();

  const { data: doc, error } = await supabase
    .from("doc")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        category,
        cover_image_url,
        published_at,
        updated_at
      `
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("Documentation detail error:", error);
  }

  if (!doc) {
    notFound();
  }

  return (
    <main className="doc-detail-page">
      <section className="doc-detail-hero">
        <div className="doc-detail-container">
          <Link
            href="/docs"
            className="doc-back-link"
          >
            ← Back to documentation
          </Link>

          <div className="doc-detail-meta">
            <span>{doc.category}</span>

            {doc.published_at && (
              <time dateTime={doc.published_at}>
                Published{" "}
                {new Date(
                  doc.published_at
                ).toLocaleDateString("en-NG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
          </div>

          <h1>{doc.title}</h1>

          {doc.excerpt && (
            <p className="doc-detail-excerpt">
              {doc.excerpt}
            </p>
          )}
        </div>
      </section>

      <section className="doc-detail-content-section">
        <div className="doc-detail-container">
          {doc.cover_image_url && (
            <div className="doc-detail-cover">
              <img
                src={doc.cover_image_url}
                alt=""
              />
            </div>
          )}

          <article className="doc-content">
            {doc.content}
          </article>

          <div className="doc-last-updated">
            Last updated{" "}
            {new Date(
              doc.updated_at
            ).toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
