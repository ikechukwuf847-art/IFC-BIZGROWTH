"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./categories.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
};

export default function CategoriesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoading(true);
      setError("");

      try {
        const [categoriesResult, subcategoriesResult] = await Promise.all([
          supabase
            .from("business_categories")
            .select(
              "id,name,slug,description,is_active,sort_order"
            )
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),

          supabase
            .from("business_subcategories")
            .select(
              "id,category_id,name,slug,description,is_active,sort_order"
            )
            .eq("is_active", true)
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true }),
        ]);

        if (categoriesResult.error) {
          throw new Error(categoriesResult.error.message);
        }

        if (subcategoriesResult.error) {
          throw new Error(subcategoriesResult.error.message);
        }

        if (!mounted) return;

        setCategories(categoriesResult.data ?? []);
        setSubcategories(subcategoriesResult.data ?? []);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load categories."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
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
      const categorySubcategories = subcategories.filter(
        (subcategory) => subcategory.category_id === category.id
      );

      return (
        category.name.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query) ||
        categorySubcategories.some(
          (subcategory) =>
            subcategory.name.toLowerCase().includes(query) ||
            subcategory.description?.toLowerCase().includes(query)
        )
      );
    });
  }, [categories, subcategories, search]);

  const getSubcategories = (categoryId: string) =>
    subcategories
      .filter((subcategory) => subcategory.category_id === categoryId)
      .slice(0, 6);

  return (
    <main className="categories-page">
      <section className="categories-hero">
        <div className="categories-container">
          <div className="categories-hero-content">
            <span className="categories-eyebrow">
              Explore businesses
            </span>

            <h1>Find businesses by category</h1>

            <p>
              Discover businesses, products, services and opportunities
              across the IFC BIZGROWTH network.
            </p>

            <div className="categories-search">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                aria-label="Search categories"
              />

              {search && (
                <button
                  type="button"
                  className="categories-search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="categories-container">
          {loading ? (
            <div className="categories-grid" aria-busy="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  className="category-card category-card-skeleton"
                  key={index}
                >
                  <div className="skeleton-icon" />
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="categories-state categories-error">
              <div className="state-icon">!</div>

              <h2>Unable to load categories</h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="categories-state">
              <div className="state-icon">⌕</div>

              <h2>
                {search
                  ? "No categories found"
                  : "No categories available"}
              </h2>

              <p>
                {search
                  ? "Try searching for a different category."
                  : "Business categories will appear here when they are available."}
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="categories-section-heading">
                <div>
                  <span className="section-label">
                    Business directory
                  </span>

                  <h2>
                    {search
                      ? "Search results"
                      : "Browse all categories"}
                  </h2>
                </div>

                <span className="category-count">
                  {filteredCategories.length}{" "}
                  {filteredCategories.length === 1
                    ? "category"
                    : "categories"}
                </span>
              </div>

              <div className="categories-grid">
                {filteredCategories.map((category) => {
                  const categorySubcategories =
                    getSubcategories(category.id);

                  return (
                    <article
                      className="category-card"
                      key={category.id}
                    >
                      <div className="category-card-top">
                        <div className="category-icon">
                          {category.name
                            .trim()
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="category-arrow">
                          →
                        </span>
                      </div>

                      <div className="category-card-content">
                        <h3>{category.name}</h3>

                        {category.description && (
                          <p>{category.description}</p>
                        )}

                        {categorySubcategories.length > 0 && (
                          <div className="subcategory-list">
                            {categorySubcategories.map(
                              (subcategory) => (
                                <span
                                  key={subcategory.id}
                                  className="subcategory-tag"
                                >
                                  {subcategory.name}
                                </span>
                              )
                            )}

                            {subcategories.filter(
                              (subcategory) =>
                                subcategory.category_id ===
                                category.id
                            ).length > 6 && (
                              <span className="subcategory-more">
                                +
                                {subcategories.filter(
                                  (subcategory) =>
                                    subcategory.category_id ===
                                    category.id
                                ).length - 6}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/categories/${category.slug}`}
                        className="category-card-link"
                        aria-label={`Explore ${category.name}`}
                      >
                        Explore category
                        <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
    }
