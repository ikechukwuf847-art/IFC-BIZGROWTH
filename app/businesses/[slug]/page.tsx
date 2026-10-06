"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./business-profile.css";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_code: string | null;
  verification_status: string | null;
  is_featured: boolean;
  is_public: boolean;
  status: string;
};

type Location = {
  id: string;
  business_id: string;
  country_code: string | null;
  city: string | null;
  state_region: string | null;
  address: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  is_active: boolean;
  is_public: boolean;
};

type Review = {
  id: string;
  business_id: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_avatar_url: string | null;
  rating: number;
  review_text: string | null;
  is_published: boolean;
  created_at: string;
};

type Rating = {
  average_rating: number | null;
  review_count: number | null;
};

type GenericRow = Record<string, unknown>;

function isValidUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getLogoUrl(path: string | null) {
  if (!path) return null;

  if (isValidUrl(path)) {
    return path;
  }

  return `https://iluczxsqdpohzgbknldh.supabase.co/storage/v1/object/public/business-logos/${path}`;
}

function getCustomerAvatarUrl(path: string | null) {
  if (!path) return null;

  if (isValidUrl(path)) {
    return path;
  }

  return `https://iluczxsqdpohzgbknldh.supabase.co/storage/v1/object/public/customer-logo/${path}`;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function cleanPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function getWhatsAppUrl(phone: string | null, businessName: string) {
  if (!phone) return null;

  const digits = cleanPhone(phone).replace(/^\+/, "");

  if (!digits) return null;

  return `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hello ${businessName}, I found your business on IFC BIZGROWTH.`,
  )}`;
}

function getRowText(
  row: GenericRow,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = row[key];

    if (
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      return value.trim();
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }
  }

  return null;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function StarRating({
  rating,
  size = "medium",
}: {
  rating: number;
  size?: "small" | "medium" | "large";
}) {
  const rounded = Math.round(rating);

  return (
    <div
      className={`bp-stars bp-stars-${size}`}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rounded ? "filled" : ""}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function Logo({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="bp-logo-fallback">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      className="bp-logo-image"
      onError={() => setFailed(true)}
    />
  );
}

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    [],
  );

  const [business, setBusiness] = useState<Business | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<Rating>({
    average_rating: null,
    review_count: 0,
  });

  const [products, setProducts] = useState<GenericRow[]>([]);
  const [services, setServices] = useState<GenericRow[]>([]);
  const [media, setMedia] = useState<GenericRow[]>([]);
  const [socialLinks, setSocialLinks] = useState<GenericRow[]>([]);
  const [promotions, setPromotions] = useState<GenericRow[]>([]);
  const [hours, setHours] = useState<GenericRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const [reviewerName, setReviewerName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] =
    useState<string | null>(null);

  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const loadBusiness = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const { data: businessData, error: businessError } =
        await supabase
          .from("businesses")
          .select(
            `
              id,
              name,
              slug,
              description,
              email,
              phone,
              website_url,
              logo_url,
              country_code,
              verification_status,
              is_featured,
              is_public,
              status
            `,
          )
          .eq("slug", slug)
          .eq("is_public", true)
          .eq("status", "active")
          .maybeSingle();

      if (businessError) {
        throw businessError;
      }

      if (!businessData) {
        setNotFound(true);
        return;
      }

      setBusiness(businessData as Business);

      const businessId = businessData.id;

      const [
        locationResult,
        reviewsResult,
        ratingResult,
        productsResult,
        servicesResult,
        mediaResult,
        socialResult,
        promotionsResult,
        hoursResult,
      ] = await Promise.all([
        supabase
          .from("business_locations")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_active", true)
          .eq("is_public", true)
          .order("is_primary", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("business_reviews")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_published", true)
          .order("created_at", {
            ascending: false,
          }),

        supabase.rpc("get_business_rating", {
          p_business_id: businessId,
        }),

        supabase
          .from("business_products")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("business_services")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("business_media")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("business_social_links")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("business_promotions")
          .select("*")
          .eq("business_id", businessId),

        supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", businessId)
          .order("day_of_week", {
            ascending: true,
          }),
      ]);

      if (locationResult.error) {
        console.error(locationResult.error);
      }

      if (reviewsResult.error) {
        console.error(reviewsResult.error);
      }

      if (productsResult.error) {
        console.error(productsResult.error);
      }

      if (servicesResult.error) {
        console.error(servicesResult.error);
      }

      if (mediaResult.error) {
        console.error(mediaResult.error);
      }

      if (socialResult.error) {
        console.error(socialResult.error);
      }

      if (promotionsResult.error) {
        console.error(promotionsResult.error);
      }

      if (hoursResult.error) {
        console.error(hoursResult.error);
      }

      setLocation(
        (locationResult.data as Location | null) ?? null,
      );

      setReviews(
        (reviewsResult.data as Review[]) ?? [],
      );

      const ratingData = Array.isArray(ratingResult.data)
        ? ratingResult.data[0]
        : ratingResult.data;

      if (ratingData) {
        setRating({
          average_rating:
            Number(ratingData.average_rating) || 0,
          review_count:
            Number(ratingData.review_count) || 0,
        });
      }

      setProducts(
        (productsResult.data as GenericRow[]) ?? [],
      );

      setServices(
        (servicesResult.data as GenericRow[]) ?? [],
      );

      setMedia(
        (mediaResult.data as GenericRow[]) ?? [],
      );

      setSocialLinks(
        (socialResult.data as GenericRow[]) ?? [],
      );

      setPromotions(
        (promotionsResult.data as GenericRow[]) ?? [],
      );

      setHours(
        (hoursResult.data as GenericRow[]) ?? [],
      );
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't load this business right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug, supabase]);

  useEffect(() => {
    loadBusiness();
  }, [loadBusiness]);

  const logoUrl = getLogoUrl(business?.logo_url ?? null);

  const whatsappUrl = getWhatsAppUrl(
    business?.phone ?? null,
    business?.name ?? "",
  );

  const address = useMemo(() => {
    if (!location) return "";

    return [
      location.address_line_1,
      location.address_line_2,
      location.address,
      location.city,
      location.state_region,
      location.country_code,
    ]
      .filter(Boolean)
      .join(", ");
  }, [location]);

  const mapUrl = useMemo(() => {
    if (!location) return null;

    if (
      typeof location.latitude === "number" &&
      typeof location.longitude === "number"
    ) {
      return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    }

    if (address) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`;
    }

    return null;
  }, [location, address]);

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";

  const shareBusiness = async () => {
    if (!business) return;

    const shareData = {
      title: business.name,
      text:
        business.description ||
        `Check out ${business.name} on IFC BIZGROWTH.`,
      url: pageUrl,
    };

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // User cancelled native sharing.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the business link.");
    }
  };

  const handleReviewImage = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      setReviewMessage(
        "Please choose a JPG, PNG, or WebP image.",
      );
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setReviewMessage(
        "Your picture must be 2 MB or smaller.",
      );
      event.target.value = "";
      return;
    }

    setReviewImage(file);
    setReviewMessage("");

    const previewUrl = URL.createObjectURL(file);
    setReviewImagePreview(previewUrl);
  };

  const submitReview = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!business) return;

    setReviewMessage("");

    if (reviewerName.trim().length < 2) {
      setReviewMessage(
        "Please enter your name.",
      );
      return;
    }

    if (!reviewRating) {
      setReviewMessage(
        "Please select a rating.",
      );
      return;
    }

    setSubmittingReview(true);

    try {
      let avatarPath: string | null = null;

      if (reviewImage) {
        const extension =
          reviewImage.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const randomPart = crypto.randomUUID();

        const filePath = `reviews/${business.id}/${randomPart}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("customer-logo")
            .upload(filePath, reviewImage, {
              cacheControl: "3600",
              upsert: false,
              contentType: reviewImage.type,
            });

        if (uploadError) {
          throw uploadError;
        }

        avatarPath = filePath;
      }

      const { error: reviewError } =
        await supabase.rpc(
          "submit_public_business_review",
          {
            p_business_id: business.id,
            p_reviewer_name: reviewerName.trim(),
            p_reviewer_avatar_url: avatarPath,
            p_rating: reviewRating,
            p_review_text:
              reviewText.trim() || null,
          },
        );

      if (reviewError) {
        throw reviewError;
      }

      setReviewerName("");
      setReviewText("");
      setReviewRating(0);
      setReviewImage(null);
      setReviewImagePreview(null);

      setReviewMessage(
        "Thank you! Your review has been submitted.",
      );

      await loadBusiness();
    } catch (err) {
      console.error(err);

      setReviewMessage(
        "We couldn't submit your review. Please try again.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="bp-page">
        <div className="bp-loading">
          <div className="bp-spinner" />
          <p>Loading business...</p>
        </div>
      </main>
    );
  }

  if (notFound || !business) {
    return (
      <main className="bp-page">
        <div className="bp-empty">
          <div className="bp-empty-icon">?</div>
          <h1>Business not found</h1>
          <p>
            This business may no longer be publicly available.
          </p>
          <Link
            href="/businesses"
            className="bp-primary-button"
          >
            Browse businesses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bp-page">
      <header className="bp-topbar">
        <div className="bp-topbar-inner">
          <Link
            href="/businesses"
            className="bp-back"
            aria-label="Back to businesses"
          >
            ←
          </Link>

          <Link
            href="/discover"
            className="bp-brand"
          >
            IFC BIZGROWTH
          </Link>

          <button
            type="button"
            className="bp-share-top"
            onClick={() => setShowShare((value) => !value)}
            aria-label="Share business"
          >
            ↗
          </button>
        </div>

        {showShare && (
          <div className="bp-share-menu">
            <button
              type="button"
              onClick={shareBusiness}
            >
              Share business
            </button>

            <button
              type="button"
              onClick={copyLink}
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        )}
      </header>

      <section className="bp-hero">
        <div className="bp-hero-inner">
          <div className="bp-business-heading">
            <div className="bp-logo">
              <Logo
                src={logoUrl}
                name={business.name}
              />
            </div>

            <div className="bp-business-heading-content">
              <div className="bp-name-row">
                <h1>{business.name}</h1>

                {business.verification_status ===
                  "verified" && (
                  <span
                    className="bp-verified"
                    title="Verified business"
                  >
                    ✓
                  </span>
                )}
              </div>

              <div className="bp-rating-row">
                <StarRating
                  rating={rating.average_rating ?? 0}
                  size="medium"
                />

                <strong>
                  {rating.average_rating
                    ? Number(
                        rating.average_rating,
                      ).toFixed(1)
                    : "0.0"}
                </strong>

                <span>
                  ({rating.review_count ?? 0} reviews)
                </span>
              </div>

              {location && (
                <p className="bp-location">
                  <span>⌖</span>
                  {[
                    location.city,
                    location.state_region,
                    location.country_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="bp-action-row">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-action bp-whatsapp"
              >
                <span>◉</span>
                WhatsApp
              </a>
            )}

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="bp-action"
              >
                <span>☎</span>
                Call
              </a>
            )}

            {business.website_url && (
              <a
                href={
                  isValidUrl(business.website_url)
                    ? business.website_url
                    : `https://${business.website_url}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bp-action"
              >
                <span>↗</span>
                Website
              </a>
            )}

            <button
              type="button"
              onClick={shareBusiness}
              className="bp-action"
            >
              <span>↗</span>
              Share
            </button>
          </div>
        </div>
      </section>

      <div className="bp-container">
        {business.description && (
          <section className="bp-section bp-about">
            <div className="bp-section-heading">
              <h2>About</h2>
            </div>

            <p>{business.description}</p>
          </section>
        )}

        {promotions.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Special Offers</h2>
            </div>

            <div className="bp-offers">
              {promotions.map((promotion, index) => {
                const title =
                  getRowText(promotion, [
                    "title",
                    "name",
                    "promotion_name",
                  ]) || "Special offer";

                const description =
                  getRowText(promotion, [
                    "description",
                    "details",
                    "offer_description",
                  ]);

                const discount =
                  getRowText(promotion, [
                    "discount",
                    "discount_text",
                    "offer",
                  ]);

                return (
                  <article
                    className="bp-offer"
                    key={
                      getRowText(promotion, ["id"]) ||
                      `${title}-${index}`
                    }
                  >
                    <div className="bp-offer-icon">
                      %
                    </div>

                    <div>
                      <h3>{title}</h3>

                      {discount && (
                        <strong>{discount}</strong>
                      )}

                      {description && (
                        <p>{description}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {media.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Photos</h2>
            </div>

            <div className="bp-gallery">
              {media.map((item, index) => {
                const path = getRowText(item, [
                  "storage_path",
                  "media_url",
                  "url",
                ]);

                if (!path) return null;

                const imageUrl = isValidUrl(path)
                  ? path
                  : `https://iluczxsqdpohzgbknldh.supabase.co/storage/v1/object/public/business-media/${path}`;

                return (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={
                      getRowText(item, ["id"]) ||
                      `${path}-${index}`
                    }
                    className="bp-gallery-item"
                  >
                    <img
                      src={imageUrl}
                      alt={
                        getRowText(item, [
                          "title",
                          "description",
                        ]) ||
                        `${business.name} photo`
                      }
                    />
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {services.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Services</h2>
            </div>

            <div className="bp-service-grid">
              {services.map((service, index) => {
                const name =
                  getRowText(service, [
                    "service_name",
                    "name",
                    "title",
                  ]) || "Service";

                const description =
                  getRowText(service, [
                    "description",
                    "service_description",
                  ]);

                return (
                  <article
                    className="bp-service-card"
                    key={
                      getRowText(service, ["id"]) ||
                      `${name}-${index}`
                    }
                  >
                    <h3>{name}</h3>

                    {description && (
                      <p>{description}</p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Products</h2>
            </div>

            <div className="bp-product-grid">
              {products.map((product, index) => {
                const name =
                  getRowText(product, [
                    "product_name",
                    "name",
                    "title",
                  ]) || "Product";

                const description =
                  getRowText(product, [
                    "description",
                    "product_description",
                  ]);

                const image =
                  getRowText(product, [
                    "image_url",
                    "media_url",
                    "image",
                  ]);

                const price =
                  getRowText(product, [
                    "price",
                    "display_price",
                    "price_text",
                  ]);

                return (
                  <article
                    className="bp-product-card"
                    key={
                      getRowText(product, ["id"]) ||
                      `${name}-${index}`
                    }
                  >
                    {image && (
                      <img
                        src={
                          isValidUrl(image)
                            ? image
                            : `https://iluczxsqdpohzgbknldh.supabase.co/storage/v1/object/public/product-media/${image}`
                        }
                        alt={name}
                      />
                    )}

                    <div className="bp-product-content">
                      <h3>{name}</h3>

                      {description && (
                        <p>{description}</p>
                      )}

                      {price && (
                        <strong>{price}</strong>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="bp-section">
          <div className="bp-section-heading">
            <h2>Contact</h2>
          </div>

          <div className="bp-contact-card">
            {address && (
              <div className="bp-contact-item">
                <span className="bp-contact-icon">
                  ⌖
                </span>

                <div>
                  <strong>Address</strong>
                  <p>{address}</p>

                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get directions
                    </a>
                  )}
                </div>
              </div>
            )}

            {business.phone && (
              <div className="bp-contact-item">
                <span className="bp-contact-icon">
                  ☎
                </span>

                <div>
                  <strong>Phone</strong>
                  <a href={`tel:${business.phone}`}>
                    {business.phone}
                  </a>
                </div>
              </div>
            )}

            {business.email && (
              <div className="bp-contact-item">
                <span className="bp-contact-icon">
                  @
                </span>

                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${business.email}`}>
                    {business.email}
                  </a>
                </div>
              </div>
            )}

            {business.website_url && (
              <div className="bp-contact-item">
                <span className="bp-contact-icon">
                  ↗
                </span>

                <div>
                  <strong>Website</strong>
                  <a
                    href={
                      isValidUrl(
                        business.website_url,
                      )
                        ? business.website_url
                        : `https://${business.website_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit website
                  </a>
                </div>
              </div>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bp-whatsapp-large"
              >
                <span>◉</span>
                Contact on WhatsApp
              </a>
            )}
          </div>
        </section>

        {hours.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Business Hours</h2>
            </div>

            <div className="bp-hours">
              {hours.map((item, index) => {
                const day =
                  getRowText(item, [
                    "day_name",
                    "day",
                    "day_of_week",
                  ]) || "";

                const open =
                  getRowText(item, [
                    "open_time",
                    "opening_time",
                    "opens_at",
                  ]);

                const close =
                  getRowText(item, [
                    "close_time",
                    "closing_time",
                    "closes_at",
                  ]);

                const closedValue =
                  getRowText(item, [
                    "is_closed",
                    "closed",
                  ]);

                const closed =
                  closedValue === "true";

                return (
                  <div
                    className="bp-hours-row"
                    key={
                      getRowText(item, ["id"]) ||
                      `${day}-${index}`
                    }
                  >
                    <span>{day}</span>

                    <strong
                      className={
                        closed ? "closed" : ""
                      }
                    >
                      {closed
                        ? "Closed"
                        : open && close
                          ? `${open} – ${close}`
                          : "Hours unavailable"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {socialLinks.length > 0 && (
          <section className="bp-section">
            <div className="bp-section-heading">
              <h2>Follow {business.name}</h2>
            </div>

            <div className="bp-socials">
              {socialLinks.map((social, index) => {
                const url = getRowText(social, [
                  "url",
                  "profile_url",
                  "social_url",
                  "link",
                ]);

                if (!url) return null;

                const platform =
                  getRowText(social, [
                    "platform",
                    "platform_name",
                    "name",
                  ]) || "Social";

                return (
                  <a
                    href={
                      isValidUrl(url)
                        ? url
                        : `https://${url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bp-social"
                    key={
                      getRowText(social, ["id"]) ||
                      `${platform}-${index}`
                    }
                  >
                    {platform}
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section
          className="bp-section bp-reviews-section"
          id="reviews"
        >
          <div className="bp-section-heading bp-reviews-heading">
            <div>
              <h2>Reviews</h2>

              <div className="bp-rating-summary">
                <StarRating
                  rating={rating.average_rating ?? 0}
                  size="large"
                />

                <strong>
                  {rating.average_rating
                    ? Number(
                        rating.average_rating,
                      ).toFixed(1)
                    : "0.0"}
                </strong>

                <span>
                  {rating.review_count ?? 0} reviews
                </span>
              </div>
            </div>
          </div>

          <div className="bp-review-form-card">
            <div className="bp-review-form-header">
              <h3>Write a review</h3>
              <p>
                No account is required. Tell others about
                your experience.
              </p>
            </div>

            <form onSubmit={submitReview}>
              <div className="bp-form-group">
                <label htmlFor="reviewer-name">
                  Your name
                </label>

                <input
                  id="reviewer-name"
                  type="text"
                  value={reviewerName}
                  onChange={(event) =>
                    setReviewerName(event.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="bp-form-group">
                <label>Your rating</label>

                <div className="bp-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={
                        star <= reviewRating
                          ? "selected"
                          : ""
                      }
                      onClick={() =>
                        setReviewRating(star)
                      }
                      aria-label={`${star} star${
                        star === 1 ? "" : "s"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="bp-form-group">
                <label htmlFor="review-text">
                  Your review
                </label>

                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(event) =>
                    setReviewText(event.target.value)
                  }
                  placeholder="Share your experience..."
                  maxLength={2000}
                  rows={5}
                />
              </div>

              <div className="bp-form-group">
                <label htmlFor="review-picture">
                  Your picture
                  <span> Optional</span>
                </label>

                <input
                  id="review-picture"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleReviewImage}
                />

                {reviewImagePreview && (
                  <div className="bp-review-image-preview">
                    <img
                      src={reviewImagePreview}
                      alt="Your review picture preview"
                    />
                  </div>
                )}

                <small>
                  JPG, PNG or WebP. Maximum 2 MB.
                </small>
              </div>

              {reviewMessage && (
                <p className="bp-review-message">
                  {reviewMessage}
                </p>
              )}

              <button
                type="submit"
                className="bp-primary-button"
                disabled={submittingReview}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit review"}
              </button>
            </form>
          </div>

          {reviews.length > 0 ? (
            <div className="bp-reviews-list">
              {reviews.map((review) => {
                const avatar = getCustomerAvatarUrl(
                  review.reviewer_avatar_url,
                );

                const reviewer =
                  review.reviewer_name ||
                  "Customer";

                return (
                  <article
                    className="bp-review"
                    key={review.id}
                  >
                    <div className="bp-review-top">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={reviewer}
                          className="bp-review-avatar"
                        />
                      ) : (
                        <div className="bp-review-avatar-fallback">
                          {getInitials(reviewer)}
                        </div>
                      )}

                      <div className="bp-review-author">
                        <strong>{reviewer}</strong>

                        <div className="bp-review-meta">
                          <StarRating
                            rating={review.rating}
                            size="small"
                          />

                          <span>
                            {formatDate(
                              review.created_at,
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.review_text && (
                      <p className="bp-review-text">
                        {review.review_text}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="bp-no-reviews">
              <div>★</div>
              <h3>No reviews yet</h3>
              <p>
                Be the first person to review this
                business.
              </p>
            </div>
          )}
        </section>
      </div>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bp-floating-whatsapp"
          aria-label="Contact this business on WhatsApp"
        >
          <span>◉</span>
          <strong>WhatsApp</strong>
        </a>
      )}
    </main>
  );
  }
