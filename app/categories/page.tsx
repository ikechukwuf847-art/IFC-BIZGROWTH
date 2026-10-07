"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./categories.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean | null;
};

export default function CategoriesPage() {
  const supabase = createSupabaseBrowserClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("business_categories")
        .select("id, name, slug, description, is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error("Failed to load categories:", error);
        setError("Unable to load categories. Please try again.");
        setCategories([]);
      } else {
        setCategories((data ?? []) as Category[]);
      }

      setLoading(false);
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() ?? "";
      const description = category.description?.toLowerCase() ?? "";

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [categories, search]);

  function getCategoryInitial(name: string) {
    return name?.trim()?.charAt(0)?.toUpperCase() || "C";
  }

  return (
    <main className="categories-page">
      {/* HERO */}
      <section className="categories-hero">
        <div className="categories-hero-inner">
          <div className="categories-hero-content">
            <span className="categories-eyebrow">
              IFC BIZGROWTH
            </span>

            <h1>Explore Business Categories</h1>

            <p>
              Discover businesses across different industries and
              find the right products and services for you.
            </p>

            <div className="categories-search">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="search"
                placeholder="Search categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search categories"
              />

              {search && (
                <button
                  type="button"
                  className="categories-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear category search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="categories-hero-decoration">
            <div className="categories-decoration-circle circle-one" />
            <div className="categories-decoration-circle circle-two" />
            <div className="categories-decoration-card">
              <span>{categories.length}</span>
              <small>Categories</small>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="categories-content">
        <div className="categories-content-header">
          <div>
            <span className="categories-section-label">
              BUSINESS DIRECTORY
            </span>

            <h2>
              {search
                ? `Results for "${search}"`
                : "Browse Categories"}
            </h2>
          </div>

          {!loading && !error && (
            <span className="categories-count">
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1
                ? "category"
                : "categories"}
            </span>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="categories-grid" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                className="category-skeleton"
                key={index}
              >
                <div className="skeleton-icon" />
                <div className="skeleton-lines">
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="categories-state">
            <div className="categories-state-icon">
              !
            </div>

            <h3>Something went wrong</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="categories-retry"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredCategories.length === 0 && (
            <div className="categories-state">
              <div className="categories-state-icon">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3>No categories found</h3>

              <p>
                Try searching with another category name.
              </p>

              {search && (
                <button
                  type="button"
                  className="categories-retry"
                  onClick={() => setSearch("")}
                >
                  View All Categories
                </button>
              )}
            </div>
          )}

        {/* CATEGORIES */}
        {!loading &&
          !error &&
          filteredCategories.length > 0 && (
            <div className="categories-grid">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${encodeURIComponent(
                    category.slug
                  )}`}
                  className="category-card"
                >
                  <div className="category-card-icon">
                    <span>
                      {getCategoryInitial(category.name)}
                    </span>

                    <svg
                      className="category-arrow"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h13M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div className="category-card-content">
                    <h3>{category.name}</h3>

                    {category.description && (
                      <p>
                        {category.description}
                      </p>
                    )}

                    <span className="category-explore">
                      Explore businesses
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M5 12h13M13 6l6 6-6 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>
    </main>
  );
  }
