"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

type ProfileSection =
  | "about"
  | "products"
  | "services"
  | "promotions"
  | "photos"
  | "contact"
  | "hours"
  | "social"
  | "reviews";

type AnalyticsMetadata = Record<
  string,
  string | number | boolean | null
>;

const SUPABASE_URL =
  "https://iluczxsqdpohzgbknldh.supabase.co";

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */

function getAnalyticsId(storage: Storage, key: string) {
  try {
    let id = storage.getItem(key);

    if (!id) {
      id =
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2)}`;

      storage.setItem(key, id);
    }

    return id;
  } catch {
    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
  }
}

function isValidUrl(value: string | null | undefined) {
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getStorageUrl(
  bucket: string,
  path: string | null,
) {
  if (!path) return null;

  if (isValidUrl(path)) return path;

  const cleanPath = path
    .replace(/^\/+/, "")
    .replace(new RegExp(`^${bucket}/`), "");

  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

function getLogoUrl(path: string | null) {
  return getStorageUrl("business-logos", path);
}

function getCustomerAvatarUrl(path: string | null) {
  return getStorageUrl("customer-logo", path);
}

function getBusinessMediaUrl(path: string | null) {
  return getStorageUrl("business-media", path);
}

function getProductMediaUrl(path: string | null) {
  return getStorageUrl("product-media", path);
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

function getWhatsAppUrl(
  phone: string | null,
  businessName: string,
) {
  if (!phone) return null;

  const digits = cleanPhone(phone).replace(/^\+/, "");

  if (!digits) return null;

  const message = encodeURIComponent(
    `Hello ${businessName}, I found your business on IFC BIZGROWTH.`,
  );

  return `https://wa.me/${digits}?text=${message}`;
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

function getMediaPath(row: GenericRow) {
  return getRowText(row, [
    "storage_path",
    "image_path",
    "image_url",
    "media_url",
    "media_path",
    "photo_url",
    "photo_path",
    "thumbnail_url",
    "thumbnail_path",
    "url",
    "image",
  ]);
}

function getDayName(value: unknown) {
  const day = Number(value);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  if (
    Number.isInteger(day) &&
    day >= 0 &&
    day <= 6
  ) {
    return days[day];
  }

  return typeof value === "string" ? value : "";
}

function formatBusinessTime(value: string | null) {
  if (!value) return null;

  const parts = value.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1] || 0);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(
    2,
    "0",
  )} ${suffix}`;
}

function isBusinessVerified(status: string | null) {
  if (!status) return false;

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return [
    "verified",
    "approved",
    "fully_verified",
    "verified_business",
  ].includes(normalized);
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

/* -------------------------------------------------------
   BUSINESS PROFILE
------------------------------------------------------- */

export default function BusinessProfilePage() {
  const params = useParams();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : "";

  const supabase = useMemo(
    () => createSupabaseBrowserClient(),
    [],
  );

  const [business, setBusiness] =
    useState<Business | null>(null);

  const [location, setLocation] =
    useState<Location | null>(null);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [rating, setRating] = useState<Rating>({
    average_rating: null,
    review_count: 0,
  });

  const [products, setProducts] =
    useState<GenericRow[]>([]);

  const [services, setServices] =
    useState<GenericRow[]>([]);

  const [media, setMedia] =
    useState<GenericRow[]>([]);

  const [socialLinks, setSocialLinks] =
    useState<GenericRow[]>([]);

  const [promotions, setPromotions] =
    useState<GenericRow[]>([]);

  const [hours, setHours] =
    useState<GenericRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const [reviewerName, setReviewerName] =
    useState("");

  const [reviewText, setReviewText] =
    useState("");

  const [reviewRating, setReviewRating] =
    useState(0);

  const [reviewImage, setReviewImage] =
    useState<File | null>(null);

  const [reviewImagePreview, setReviewImagePreview] =
    useState<string | null>(null);

  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [reviewMessage, setReviewMessage] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<ProfileSection>("about");

  const trackedProfileViews = useRef<Set<string>>(
    new Set(),
  );

  const lastTrackedSection = useRef<string>("");
  const lastTrackedLocationSection = useRef<string>("");

  /* -----------------------------------------------------
     ANALYTICS
  ----------------------------------------------------- */

  const trackEvent = useCallback(
    async (
      businessId: string,
      eventType: string,
      metadata: AnalyticsMetadata = {},
    ) => {
      if (
        typeof window === "undefined" ||
        !businessId
      ) {
        return;
      }

      try {
        const visitorId = getAnalyticsId(
          window.localStorage,
          "ifc_bizgrowth_visitor_id",
        );

        const sessionId = getAnalyticsId(
          window.sessionStorage,
          "ifc_bizgrowth_session_id",
        );

        await fetch("/api/analytics/business", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          keepalive: true,
          body: JSON.stringify({
            business_id: businessId,
            event_type: eventType,
            visitor_id: visitorId,
            session_id: sessionId,
            metadata: {
              ...metadata,
              page_path: window.location.pathname,
              page_url: window.location.href,
            },
          }),
        });
      } catch {
        // Analytics must never break the profile.
      }
    },
    [],
  );

  const trackContactClick = useCallback(
    (
      businessId: string,
      method: string,
      metadata: AnalyticsMetadata = {},
    ) => {
      void trackEvent(businessId, "contact_click", {
        method,
        ...metadata,
      });
    },
    [trackEvent],
  );

  /* -----------------------------------------------------
     LOAD BUSINESS DATA
  ----------------------------------------------------- */

  const loadBusiness = useCallback(async () => {
    if (!slug) return;

    setLoading(true);
    setError("");
    setNotFound(false);

    try {
      const {
        data: businessData,
        error: businessError,
      } = await supabase
        .from("businesses")
        .select(`
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
        `)
        .eq("slug", slug)
        .eq("is_public", true)
        .eq("status", "active")
        .maybeSingle();

      if (businessError) throw businessError;

      if (!businessData) {
        setNotFound(true);
        return;
      }

      setBusiness(businessData as Business);

      const businessId = businessData.id;

      if (!trackedProfileViews.current.has(businessId)) {
        trackedProfileViews.current.add(businessId);

        void trackEvent(businessId, "profile_view", {
          business_slug: businessData.slug,
          source: document.referrer
            ? "external_or_previous_page"
            : "direct",
        });
      }

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
          .order("is_primary", { ascending: false })
          .limit(1)
          .maybeSingle(),

        supabase
          .from("business_reviews")
          .select("*")
          .eq("business_id", businessId)
          .eq("is_published", true)
          .order("created_at", { ascending: false }),

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
          .order("sort_order", { ascending: true }),

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
          .order("day_of_week", { ascending: true }),
      ]);

      if (locationResult.error) console.error(locationResult.error);
      if (reviewsResult.error) console.error(reviewsResult.error);
      if (productsResult.error) console.error(productsResult.error);
      if (servicesResult.error) console.error(servicesResult.error);
      if (mediaResult.error) console.error(mediaResult.error);
      if (socialResult.error) console.error(socialResult.error);
      if (promotionsResult.error) console.error(promotionsResult.error);
      if (hoursResult.error) console.error(hoursResult.error);

      setLocation(
        (locationResult.data as Location | null) ?? null,
      );

      setReviews((reviewsResult.data as Review[]) ?? []);

      const ratingData = Array.isArray(ratingResult.data)
        ? ratingResult.data[0]
        : ratingResult.data;

      setRating({
        average_rating: ratingData
          ? Number(ratingData.average_rating) || 0
          : 0,
        review_count: ratingData
          ? Number(ratingData.review_count) || 0
          : 0,
      });

      setProducts((productsResult.data as GenericRow[]) ?? []);
      setServices((servicesResult.data as GenericRow[]) ?? []);
      setMedia((mediaResult.data as GenericRow[]) ?? []);
      setSocialLinks((socialResult.data as GenericRow[]) ?? []);
      setPromotions((promotionsResult.data as GenericRow[]) ?? []);
      setHours((hoursResult.data as GenericRow[]) ?? []);
    } catch (err) {
      console.error(err);

      setError(
        "We couldn't load this business right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug, supabase, trackEvent]);

  useEffect(() => {
    void loadBusiness();
  }, [loadBusiness]);

  useEffect(() => {
    return () => {
      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
      }
    };
  }, [reviewImagePreview]);

  useEffect(() => {
    setActiveSection("about");
    lastTrackedSection.current = "";
    lastTrackedLocationSection.current = "";
  }, [slug]);

  /* -----------------------------------------------------
     SHARED VALUES
  ----------------------------------------------------- */

  const logoUrl = getLogoUrl(
    business?.logo_url ?? null,
  );

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
      return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
    }

    if (address) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        address,
      )}`;
    }

    return null;
  }, [location, address]);

  /* -----------------------------------------------------
     SECTION ANALYTICS
  ----------------------------------------------------- */

  useEffect(() => {
    if (!business?.id) return;

    const trackingKey = `${business.id}:${activeSection}`;

    if (lastTrackedSection.current === trackingKey) {
      return;
    }

    lastTrackedSection.current = trackingKey;

    const eventTypes: Partial<
      Record<ProfileSection, string>
    > = {
      products: "product_view",
      services: "service_view",
      promotions: "promotion_view",
    };

    void trackEvent(
      business.id,
      eventTypes[activeSection] ?? "section_view",
      {
        section: activeSection,
        business_slug: business.slug,
      },
    );
  }, [
    business?.id,
    business?.slug,
    activeSection,
    trackEvent,
  ]);

  useEffect(() => {
    if (!business?.id || activeSection !== "contact") {
      lastTrackedLocationSection.current = "";
      return;
    }

    const trackingKey = `${business.id}:contact`;

    if (
      lastTrackedLocationSection.current === trackingKey
    ) {
      return;
    }

    lastTrackedLocationSection.current = trackingKey;

    void trackEvent(business.id, "location_view", {
      has_location: Boolean(location),
      has_address: Boolean(address),
      has_map: Boolean(mapUrl),
    });
  }, [
    business?.id,
    activeSection,
    location,
    address,
    mapUrl,
    trackEvent,
  ]);

  /* -----------------------------------------------------
     SHARE VALUES AND ACTIONS
  ----------------------------------------------------- */

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "";

  const encodedPageUrl = encodeURIComponent(pageUrl);

  const encodedShareText = encodeURIComponent(
    business
      ? `Check out ${business.name} on IFC BIZGROWTH.`
      : "Check out this business on IFC BIZGROWTH.",
  );

  const shareBusiness = async () => {
    if (!business) return;

    void trackEvent(business.id, "share_click", {
      method: "native_or_share_menu",
    });

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

      setShowShare(true);
    } catch {
      // The customer cancelled sharing.
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);

      if (business) {
        void trackEvent(business.id, "share_click", {
          method: "copy_link",
        });
      }

      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the business link.");
    }
  };

  const shareToTikTok = async () => {
    if (business) {
      void trackEvent(business.id, "share_click", {
        method: "tiktok",
      });
    }

    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);

      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Continue opening TikTok even if copying fails.
    }

    window.open(
      "https://www.tiktok.com/",
      "_blank",
      "noopener,noreferrer",
    );
  };
    /* -------------------------------------------------------
     REVIEW IMAGE
  ------------------------------------------------------- */

  const handleReviewImageChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReviewMessage("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setReviewMessage("The image must be smaller than 5 MB.");
      return;
    }

    if (reviewImagePreview) {
      URL.revokeObjectURL(reviewImagePreview);
    }

    setReviewImage(file);
    setReviewImagePreview(URL.createObjectURL(file));
    setReviewMessage("");
  };

  /* -------------------------------------------------------
     SUBMIT REVIEW
  ------------------------------------------------------- */

  const handleReviewSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!business) return;

    const name = reviewerName.trim();
    const text = reviewText.trim();

    if (!name) {
      setReviewMessage("Please enter your name.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewMessage("Please select a star rating.");
      return;
    }

    if (!text) {
      setReviewMessage("Please write your review.");
      return;
    }

    if (text.length > 2000) {
      setReviewMessage(
        "Your review must not exceed 2,000 characters.",
      );
      return;
    }

    setSubmittingReview(true);
    setReviewMessage("");

    try {
      let avatarPath: string | null = null;

      if (reviewImage) {
        const extension =
          reviewImage.name.split(".").pop()?.toLowerCase() ||
          "jpg";

        const allowedExtensions = [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ];

        if (!allowedExtensions.includes(extension)) {
          setReviewMessage(
            "Use a JPG, PNG, or WebP image.",
          );
          return;
        }

        const fileName =
          `${crypto.randomUUID()}.${extension}`;

        const { data: uploadedFile, error: uploadError } =
          await supabase.storage
            .from("customer-logo")
            .upload(fileName, reviewImage, {
              cacheControl: "3600",
              upsert: false,
              contentType: reviewImage.type,
            });

        if (uploadError) throw uploadError;

        avatarPath = uploadedFile.path;
      }

      const { error: submitError } = await supabase.rpc(
        "submit_public_business_review",
        {
          p_business_id: business.id,
          p_reviewer_name: name,
          p_rating: reviewRating,
          p_review_text: text,
          p_reviewer_avatar_url: avatarPath,
        },
      );

      if (submitError) throw submitError;

      void trackEvent(business.id, "review_submitted", {
        rating: reviewRating,
        has_avatar: Boolean(avatarPath),
      });

      setReviewerName("");
      setReviewText("");
      setReviewRating(0);
      setReviewImage(null);

      if (reviewImagePreview) {
        URL.revokeObjectURL(reviewImagePreview);
        setReviewImagePreview(null);
      }

      setReviewMessage(
        "Thank you! Your review has been submitted for moderation.",
      );
    } catch (err) {
      console.error("Review submission failed:", err);

      setReviewMessage(
        "We couldn't submit your review. Please try again.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  /* -------------------------------------------------------
     CONTACT ACTIONS
  ------------------------------------------------------- */

  const handlePhoneClick = (
    placement: "hero" | "contact",
  ) => {
    if (!business) return;

    void trackEvent(business.id, "phone_click", {
      placement,
    });

    trackContactClick(business.id, "phone", {
      placement,
    });
  };

  const handleWebsiteClick = (
    placement: "hero" | "contact",
  ) => {
    if (!business) return;

    void trackEvent(business.id, "website_click", {
      placement,
    });

    trackContactClick(business.id, "website", {
      placement,
    });
  };

  const handleWhatsAppClick = (
    placement:
      | "hero"
      | "contact"
      | "floating_button",
  ) => {
    if (!business) return;

    void trackEvent(business.id, "whatsapp_click", {
      placement,
    });

    trackContactClick(business.id, "whatsapp", {
      placement,
    });
  };

  const handleEmailClick = () => {
    if (!business) return;

    void trackEvent(business.id, "email_click", {
      placement: "contact",
    });

    trackContactClick(business.id, "email", {
      placement: "contact",
    });
  };

  const handleDirectionsClick = () => {
    if (!business) return;

    void trackEvent(business.id, "directions_click", {
      has_coordinates: Boolean(
        location?.latitude != null &&
        location?.longitude != null,
      ),
    });

    void trackEvent(business.id, "location_view", {
      action: "directions",
    });
  };

  /* -------------------------------------------------------
     SOCIAL LINKS
  ------------------------------------------------------- */

  const handleSocialClick = (
    platform: string,
    url: string,
  ) => {
    if (business) {
      void trackEvent(business.id, "social_click", {
        platform,
      });
    }

    window.open(
      url,
      "_blank",
      "noopener,noreferrer",
    );
  };

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const sections: {
    id: ProfileSection;
    label: string;
  }[] = [
    { id: "about", label: "About" },
    { id: "products", label: "Products" },
    { id: "services", label: "Services" },
    { id: "promotions", label: "Promotions" },
    { id: "photos", label: "Photos" },
    { id: "contact", label: "Contact" },
    { id: "hours", label: "Opening Hours" },
    { id: "social", label: "Social Media" },
    { id: "reviews", label: "Reviews" },
  ];

  const navigateToSection = (
    section: ProfileSection,
  ) => {
    setActiveSection(section);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* -------------------------------------------------------
     LOADING STATE
  ------------------------------------------------------- */

  if (loading) {
    return (
      <main className="bp-page">
        <div className="bp-loading">
          <div className="bp-spinner" />
          <p>Loading business profile...</p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     NOT FOUND STATE
  ------------------------------------------------------- */

  if (notFound || !business) {
    return (
      <main className="bp-page">
        <div className="bp-not-found">
          <div className="bp-not-found-icon">⌕</div>

          <h1>Business not found</h1>

          <p>
            This business profile may be unavailable,
            inactive, or no longer public.
          </p>

          <Link href="/discover" className="bp-primary-button">
            Discover businesses
          </Link>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     DERIVED VALUES
  ------------------------------------------------------- */

  const verified = isBusinessVerified(
    business.verification_status,
  );

  const websiteUrl = business.website_url
    ? business.website_url.startsWith("http://") ||
      business.website_url.startsWith("https://")
      ? business.website_url
      : `https://${business.website_url}`
    : null;

  const averageRating = Number(
    rating.average_rating ?? 0,
  );

  const reviewCount = Number(
    rating.review_count ?? reviews.length,
  );

  const activeProducts = products.filter((item) => {
    const status = getRowText(item, ["status"]);

    return (
      item.is_active !== false &&
      item.is_public !== false &&
      (!status ||
        ["active", "published", "approved"].includes(
          status.toLowerCase(),
        ))
    );
  });

  const activeServices = services.filter((item) => {
    const status = getRowText(item, ["status"]);

    return (
      item.is_active !== false &&
      item.is_public !== false &&
      (!status ||
        ["active", "published", "approved"].includes(
          status.toLowerCase(),
        ))
    );
  });

  const activePromotions = promotions.filter((item) => {
    const status = getRowText(item, ["status"]);

    return (
      item.is_active !== false &&
      item.is_public !== false &&
      (!status ||
        ["active", "published", "approved"].includes(
          status.toLowerCase(),
        ))
    );
  });

  const getSocialPlatform = (row: GenericRow) =>
    getRowText(row, [
      "platform",
      "social_platform",
      "name",
      "type",
    ]) ?? "Social media";

  const getSocialUrl = (row: GenericRow) =>
    getRowText(row, [
      "url",
      "profile_url",
      "social_url",
      "link",
    ]);

  const getItemTitle = (row: GenericRow) =>
    getRowText(row, [
      "name",
      "title",
      "product_name",
      "service_name",
      "promotion_name",
    ]) ?? "Untitled";

  const getItemDescription = (row: GenericRow) =>
    getRowText(row, [
      "description",
      "short_description",
      "details",
    ]);

  const getItemPrice = (row: GenericRow) =>
    getRowText(row, [
      "price",
      "selling_price",
      "amount",
    ]);

  const getItemCurrency = (row: GenericRow) =>
    getRowText(row, ["currency", "currency_code"]) ??
    "NGN";

  const getItemImage = (row: GenericRow) => {
    const path = getMediaPath(row);

    if (!path) return null;

    if (isValidUrl(path)) return path;

    if (path.startsWith("business-media/")) {
      return getStorageUrl("business-media", path);
    }

    if (path.startsWith("product-media/")) {
      return getStorageUrl("product-media", path);
    }

    return getBusinessMediaUrl(path);
  };

  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <main className="bp-page">
      {/* HEADER */}

      <header className="bp-topbar">
        <Link
          href="/"
          className="bp-brand"
          aria-label="IFC BIZGROWTH home"
        >
          <span className="bp-brand-mark">IFC</span>

          <span className="bp-brand-name">
            BIZGROWTH
          </span>
        </Link>

        <div className="bp-topbar-actions">
          <Link
            href="/discover"
            className="bp-header-link"
          >
            Discover
          </Link>

          <button
            type="button"
            className="bp-share-button"
            onClick={() => {
              setShowShare((current) => !current);

              void trackEvent(
                business.id,
                "share_menu_open",
              );
            }}
          >
            Share profile
          </button>
        </div>
      </header>

      {/* SHARE MENU */}

      {showShare && (
        <div
          className="bp-share-backdrop"
          onClick={() => setShowShare(false)}
        >
          <div
            className="bp-share-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Share business profile"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="bp-share-heading">
              <div>
                <h2>Share business</h2>
                <p>
                  Help more people discover this business.
                </p>
              </div>

              <button
                type="button"
                className="bp-icon-button"
                aria-label="Close share menu"
                onClick={() => setShowShare(false)}
              >
                ×
              </button>
            </div>

            <button
              type="button"
              className="bp-share-option"
              onClick={() => void copyLink()}
            >
              <span>🔗</span>

              <span>
                <strong>
                  {copied ? "Link copied" : "Copy link"}
                </strong>

                <small>
                  Share the profile URL anywhere.
                </small>
              </span>
            </button>

            <a
              className="bp-share-option"
              href={`https://wa.me/?text=${encodedShareText}%20${encodedPageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void trackEvent(
                  business.id,
                  "share_click",
                  { method: "whatsapp_share" },
                );
              }}
            >
              <span>💬</span>

              <span>
                <strong>WhatsApp</strong>
                <small>Send the profile to your contacts.</small>
              </span>
            </a>

            <a
              className="bp-share-option"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedPageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void trackEvent(
                  business.id,
                  "share_click",
                  { method: "facebook" },
                );
              }}
            >
              <span>f</span>

              <span>
                <strong>Facebook</strong>
                <small>Share with your Facebook audience.</small>
              </span>
            </a>

            <a
              className="bp-share-option"
              href={`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodedPageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                void trackEvent(
                  business.id,
                  "share_click",
                  { method: "x" },
                );
              }}
            >
              <span>𝕏</span>

              <span>
                <strong>X</strong>
                <small>Post this business profile.</small>
              </span>
            </a>

            <button
              type="button"
              className="bp-share-option"
              onClick={() => void shareToTikTok()}
            >
              <span>♪</span>

              <span>
                <strong>TikTok</strong>
                <small>
                  Copy the link and open TikTok.
                </small>
              </span>
            </button>

            <button
              type="button"
              className="bp-primary-button bp-share-done"
              onClick={() => setShowShare(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* BUSINESS HERO */}

      <section className="bp-hero">
        <div className="bp-hero-inner">
          <div className="bp-hero-main">
            <div className="bp-hero-logo">
              <Logo
                src={logoUrl}
                name={business.name}
              />
            </div>

            <div className="bp-hero-content">
              <div className="bp-business-badges">
                {verified && (
                  <span className="bp-verified-badge">
                    ✓ Verified business
                  </span>
                )}

                {business.is_featured && (
                  <span className="bp-featured-badge">
                    Featured
                  </span>
                )}
              </div>

              <h1>{business.name}</h1>

              {location && (
                <p className="bp-location-summary">
                  <span aria-hidden="true">⌖</span>

                  {[
                    location.city,
                    location.state_region,
                    location.country_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <div className="bp-rating-summary">
                <StarRating
                  rating={averageRating}
                  size="medium"
                />

                <span>
                  {averageRating.toFixed(1)}
                </span>

                <span className="bp-rating-count">
                  ({reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>

              <p className="bp-hero-description">
                {business.description ||
                  "Discover this business, explore its offerings, and get in touch directly."}
              </p>

              <div className="bp-hero-actions">
                {business.phone && (
                  <a
                    href={`tel:${cleanPhone(business.phone)}`}
                    className="bp-primary-button"
                    onClick={() =>
                      handlePhoneClick("hero")
                    }
                  >
                    Call business
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bp-whatsapp-button"
                    onClick={() =>
                      handleWhatsAppClick("hero")
                    }
                  >
                    WhatsApp
                  </a>
                )}

                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bp-secondary-button"
                    onClick={() =>
                      handleWebsiteClick("hero")
                    }
                  >
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <div className="bp-layout">
        <aside className="bp-sidebar">
          <div className="bp-sidebar-heading">
            <span className="bp-sidebar-label">
              BUSINESS PROFILE
            </span>

            <h2>Explore</h2>
          </div>

          <nav
            className="bp-section-nav"
            aria-label="Business profile sections"
          >
            {sections.map((section) => (
              <button
                type="button"
                key={section.id}
                className={
                  activeSection === section.id
                    ? "bp-nav-item active"
                    : "bp-nav-item"
                }
                onClick={() =>
                  navigateToSection(section.id)
                }
              >
                <span>{section.label}</span>

                {section.id === "products" &&
                  activeProducts.length > 0 && (
                    <span className="bp-nav-count">
                      {activeProducts.length}
                    </span>
                  )}

                {section.id === "services" &&
                  activeServices.length > 0 && (
                    <span className="bp-nav-count">
                      {activeServices.length}
                    </span>
                  )}

                {section.id === "reviews" &&
                  reviewCount > 0 && (
                    <span className="bp-nav-count">
                      {reviewCount}
                    </span>
                  )}
              </button>
            ))}
          </nav>

          <div className="bp-sidebar-card">
            <h3>Discover more businesses</h3>

            <p>
              Explore businesses and services on
              IFC BIZGROWTH.
            </p>

            <Link
              href="/discover"
              className="bp-sidebar-cta"
            >
              Explore directory →
            </Link>
          </div>
        </aside>

        <section className="bp-content">
          {/* ABOUT */}

          {activeSection === "about" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  ABOUT THE BUSINESS
                </span>

                <h2>About {business.name}</h2>

                <p>
                  Learn more about this business and
                  what it offers.
                </p>
              </div>

              <div className="bp-info-card">
                <h3>Business overview</h3>

                <p className="bp-description">
                  {business.description ||
                    "This business has not added a detailed description yet."}
                </p>

                <div className="bp-info-grid">
                  <div className="bp-info-item">
                    <span className="bp-info-label">
                      Verification
                    </span>

                    <strong>
                      {verified
                        ? "Verified"
                        : "Not verified"}
                    </strong>
                  </div>

                  <div className="bp-info-item">
                    <span className="bp-info-label">
                      Customer rating
                    </span>

                    <strong>
                      {averageRating.toFixed(1)} / 5
                    </strong>
                  </div>

                  <div className="bp-info-item">
                    <span className="bp-info-label">
                      Reviews
                    </span>

                    <strong>{reviewCount}</strong>
                  </div>

                  <div className="bp-info-item">
                    <span className="bp-info-label">
                      Location
                    </span>

                    <strong>
                      {location
                        ? [
                            location.city,
                            location.state_region,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Available on request"
                        : "Contact the business"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="bp-overview-grid">
                <button
                  type="button"
                  className="bp-overview-card"
                  onClick={() =>
                    navigateToSection("products")
                  }
                >
                  <span className="bp-overview-icon">
                    ◈
                  </span>

                  <strong>Products</strong>

                  <span>
                    {activeProducts.length} available
                  </span>

                  <span className="bp-overview-link">
                    Explore products →
                  </span>
                </button>

                <button
                  type="button"
                  className="bp-overview-card"
                  onClick={() =>
                    navigateToSection("services")
                  }
                >
                  <span className="bp-overview-icon">
                    ◉
                  </span>

                  <strong>Services</strong>

                  <span>
                    {activeServices.length} available
                  </span>

                  <span className="bp-overview-link">
                    Explore services →
                  </span>
                </button>

                <button
                  type="button"
                  className="bp-overview-card"
                  onClick={() =>
                    navigateToSection("promotions")
                  }
                >
                  <span className="bp-overview-icon">
                    %
                  </span>

                  <strong>Promotions</strong>

                  <span>
                    {activePromotions.length} available
                  </span>

                  <span className="bp-overview-link">
                    View promotions →
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* PRODUCTS */}

          {activeSection === "products" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  WHAT THIS BUSINESS SELLS
                </span>

                <h2>Products</h2>

                <p>
                  Browse the products listed by{" "}
                  {business.name}.
                </p>
              </div>

              {activeProducts.length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">◈</span>

                  <h3>No products available yet</h3>

                  <p>
                    This business has not listed any
                    products for display.
                  </p>
                </div>
              ) : (
                <div className="bp-product-grid">
                  {activeProducts.map((product, index) => {
                    const id =
                      getRowText(product, ["id"]) ??
                      `${index}`;

                    const title = getItemTitle(product);
                    const image = getItemImage(product);
                    const description =
                      getItemDescription(product);
                    const price = getItemPrice(product);
                    const currency =
                      getItemCurrency(product);

                    return (
                      <article
                        className="bp-product-card"
                        key={id}
                      >
                        <div className="bp-product-image">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              loading="lazy"
                              onClick={() => {
                                void trackEvent(
                                  business.id,
                                  "product_view",
                                  {
                                    product_id: id,
                                    product_name: title,
                                    action: "image_click",
                                  },
                                );
                              }}
                            />
                          ) : (
                            <div className="bp-product-placeholder">
                              ◈
                            </div>
                          )}
                        </div>

                        <div className="bp-product-body">
                          <h3>{title}</h3>

                          {description && (
                            <p>{description}</p>
                          )}

                          {price && (
                            <strong className="bp-product-price">
                              {currency}{" "}
                              {Number(price).toLocaleString(
                                "en-NG",
                              )}
                            </strong>
                          )}

                          {business.phone && (
                            <a
                              href={`tel:${cleanPhone(
                                business.phone,
                              )}`}
                              className="bp-card-action"
                              onClick={() =>
                                handlePhoneClick("contact")
                              }
                            >
                              Enquire about product →
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SERVICES */}

          {activeSection === "services" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  HOW THIS BUSINESS CAN HELP
                </span>

                <h2>Services</h2>

                <p>
                  Explore the services offered by{" "}
                  {business.name}.
                </p>
              </div>

              {activeServices.length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">◉</span>

                  <h3>No services listed yet</h3>

                  <p>
                    Check back later for services from
                    this business.
                  </p>
                </div>
              ) : (
                <div className="bp-service-list">
                  {activeServices.map((service, index) => {
                    const id =
                      getRowText(service, ["id"]) ??
                      `${index}`;

                    const title = getItemTitle(service);
                    const description =
                      getItemDescription(service);
                    const price = getItemPrice(service);
                    const image = getItemImage(service);

                    return (
                      <article
                        className="bp-service-card"
                        key={id}
                      >
                        {image && (
                          <img
                            src={image}
                            alt={title}
                            className="bp-service-image"
                            loading="lazy"
                          />
                        )}

                        <div className="bp-service-content">
                          <h3>{title}</h3>

                          {description && (
                            <p>{description}</p>
                          )}

                          {price && (
                            <strong>
                              {getItemCurrency(service)}{" "}
                              {Number(price).toLocaleString(
                                "en-NG",
                              )}
                            </strong>
                          )}

                          {business.phone && (
                            <a
                              href={`tel:${cleanPhone(
                                business.phone,
                              )}`}
                              className="bp-card-action"
                              onClick={() =>
                                handlePhoneClick("contact")
                              }
                            >
                              Enquire about service →
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROMOTIONS */}

          {activeSection === "promotions" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  SPECIAL OFFERS
                </span>

                <h2>Promotions</h2>

                <p>
                  Check out offers published by{" "}
                  {business.name}.
                </p>
              </div>

              {activePromotions.length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">%</span>

                  <h3>No promotions available</h3>

                  <p>
                    This business has no promotions
                    available for display right now.
                  </p>
                </div>
              ) : (
                <div className="bp-promotion-grid">
                  {activePromotions.map(
                    (promotion, index) => {
                      const id =
                        getRowText(promotion, ["id"]) ??
                        `${index}`;

                      const title =
                        getItemTitle(promotion);

                      const description =
                        getItemDescription(promotion);

                      const image =
                        getItemImage(promotion);

                      const discount = getRowText(
                        promotion,
                        [
                          "discount_percentage",
                          "discount_percent",
                          "discount",
                        ],
                      );

                      const endDate = getRowText(
                        promotion,
                        [
                          "end_date",
                          "valid_until",
                          "expires_at",
                        ],
                      );

                      return (
                        <article
                          className="bp-promotion-card"
                          key={id}
                        >
                          {image && (
                            <img
                              src={image}
                              alt={title}
                              loading="lazy"
                            />
                          )}

                          <div className="bp-promotion-body">
                            {discount && (
                              <span className="bp-promotion-badge">
                                {discount}
                                {String(discount).includes("%")
                                  ? ""
                                  : "% off"}
                              </span>
                            )}

                            <h3>{title}</h3>

                            {description && (
                              <p>{description}</p>
                            )}

                            {endDate && (
                              <small>
                                Valid until:{" "}
                                {formatDate(endDate)}
                              </small>
                            )}

                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bp-card-action"
                                onClick={() =>
                                  handleWhatsAppClick(
                                    "contact",
                                  )
                                }
                              >
                                Ask about this offer →
                              </a>
                            )}
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          )}

          {/* PHOTOS */}

          {activeSection === "photos" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  BUSINESS GALLERY
                </span>

                <h2>Photos</h2>

                <p>
                  Explore photos shared by{" "}
                  {business.name}.
                </p>
              </div>

              {media.length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">▧</span>

                  <h3>No photos available yet</h3>

                  <p>
                    This business has not added photos
                    to its gallery.
                  </p>
                </div>
              ) : (
                <div className="bp-gallery-grid">
                  {media.map((item, index) => {
                    const id =
                      getRowText(item, ["id"]) ??
                      `${index}`;

                    const path = getMediaPath(item);

                    const image = path
                      ? isValidUrl(path)
                        ? path
                        : getBusinessMediaUrl(path)
                      : null;

                    if (!image) return null;

                    const caption =
                      getRowText(item, [
                        "caption",
                        "title",
                        "alt_text",
                        "description",
                      ]) ?? business.name;

                    return (
                      <button
                        type="button"
                        key={id}
                        className="bp-gallery-item"
                        onClick={() => {
                          void trackEvent(
                            business.id,
                            "photo_click",
                            {
                              media_id: id,
                            },
                          );

                          window.open(
                            image,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                        aria-label={`View ${caption}`}
                      >
                        <img
                          src={image}
                          alt={caption}
                          loading="lazy"
                        />

                        <span>{caption}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CONTACT */}

          {activeSection === "contact" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  GET IN TOUCH
                </span>

                <h2>Contact {business.name}</h2>

                <p>
                  Use the available contact details
                  to reach this business.
                </p>
              </div>

              <div className="bp-contact-grid">
                {business.phone && (
                  <div className="bp-contact-card">
                    <span className="bp-contact-icon">
                      ☎
                    </span>

                    <div>
                      <h3>Phone</h3>
                      <p>{business.phone}</p>

                      <a
                        href={`tel:${cleanPhone(
                          business.phone,
                        )}`}
                        onClick={() =>
                          handlePhoneClick("contact")
                        }
                      >
                        Call now →
                      </a>
                    </div>
                  </div>
                )}

                {business.email && (
                  <div className="bp-contact-card">
                    <span className="bp-contact-icon">
                      ✉
                    </span>

                    <div>
                      <h3>Email</h3>
                      <p>{business.email}</p>

                      <a
                        href={`mailto:${business.email}`}
                        onClick={handleEmailClick}
                      >
                        Send email →
                      </a>
                    </div>
                  </div>
                )}

                {websiteUrl && (
                  <div className="bp-contact-card">
                    <span className="bp-contact-icon">
                      ◎
                    </span>

                    <div>
                      <h3>Website</h3>
                      <p>Visit the official website.</p>

                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          handleWebsiteClick("contact")
                        }
                      >
                        Visit website →
                      </a>
                    </div>
                  </div>
                )}

                {whatsappUrl && (
                  <div className="bp-contact-card">
                    <span className="bp-contact-icon">
                      ◉
                    </span>

                    <div>
                      <h3>WhatsApp</h3>
                      <p>
                        Contact the business directly.
                      </p>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          handleWhatsAppClick("contact")
                        }
                      >
                        Chat on WhatsApp →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {address && (
                <div className="bp-address-card">
                  <div>
                    <span className="bp-eyebrow">
                      BUSINESS ADDRESS
                    </span>

                    <h3>Visit the business</h3>

                    <p>{address}</p>
                  </div>

                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bp-primary-button"
                      onClick={handleDirectionsClick}
                    >
                      Get directions
                    </a>
                  )}
                </div>
              )}

              {!business.phone &&
                !business.email &&
                !websiteUrl &&
                !whatsappUrl && (
                  <div className="bp-empty-state">
                    <h3>Contact details unavailable</h3>

                    <p>
                      This business has not published
                      contact details yet.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* OPENING HOURS */}

          {activeSection === "hours" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  BUSINESS SCHEDULE
                </span>

                <h2>Opening Hours</h2>

                <p>
                  Check the published opening hours
                  before visiting.
                </p>
              </div>

              {hours.length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">◷</span>

                  <h3>Opening hours unavailable</h3>

                  <p>
                    Contact the business to confirm
                    its opening hours.
                  </p>
                </div>
              ) : (
                <div className="bp-hours-card">
                  {hours.map((item, index) => {
                    const dayValue =
                      item.day_of_week ??
                      item.day ??
                      item.weekday;

                    const day = getDayName(dayValue);

                    const opens = getRowText(item, [
                      "open_time",
                      "opening_time",
                      "opens_at",
                      "start_time",
                    ]);

                    const closes = getRowText(item, [
                      "close_time",
                      "closing_time",
                      "closes_at",
                      "end_time",
                    ]);

                    const isClosed =
                      item.is_closed === true ||
                      item.closed === true ||
                      getRowText(item, ["status"])
                        ?.toLowerCase() === "closed";

                    return (
                      <div
                        className="bp-hours-row"
                        key={`${day}-${index}`}
                      >
                        <span className="bp-hours-day">
                          {day || "Day"}
                        </span>

                        <span
                          className={
                            isClosed
                              ? "bp-hours-closed"
                              : "bp-hours-time"
                          }
                        >
                          {isClosed
                            ? "Closed"
                            : opens && closes
                              ? `${formatBusinessTime(
                                  opens,
                                )} – ${formatBusinessTime(
                                  closes,
                                )}`
                              : "Hours not specified"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SOCIAL MEDIA */}

          {activeSection === "social" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  STAY CONNECTED
                </span>

                <h2>Social Media</h2>

                <p>
                  Follow {business.name} on its
                  published social media channels.
                </p>
              </div>

              {socialLinks.filter((item) =>
                getSocialUrl(item),
              ).length === 0 ? (
                <div className="bp-empty-state">
                  <span className="bp-empty-icon">◎</span>

                  <h3>No social links available</h3>

                  <p>
                    This business has not added any
                    social media links yet.
                  </p>
                </div>
              ) : (
                <div className="bp-social-grid">
                  {socialLinks.map((item, index) => {
                    const url = getSocialUrl(item);

                    if (!url) return null;

                    const platform =
                      getSocialPlatform(item);

                    const safeUrl =
                      url.startsWith("http://") ||
                      url.startsWith("https://")
                        ? url
                        : `https://${url}`;

                    return (
                      <button
                        type="button"
                        key={
                          getRowText(item, ["id"]) ??
                          `${platform}-${index}`
                        }
                        className="bp-social-card"
                        onClick={() =>
                          handleSocialClick(
                            platform,
                            safeUrl,
                          )
                        }
                      >
                        <span className="bp-social-icon">
                          ◎
                        </span>

                        <span>
                          <strong>{platform}</strong>
                          <small>
                            Visit profile →
                          </small>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* REVIEWS */}

          {activeSection === "reviews" && (
            <div className="bp-section">
              <div className="bp-section-heading">
                <span className="bp-eyebrow">
                  CUSTOMER FEEDBACK
                </span>

                <h2>Reviews</h2>

                <p>
                  Read customer feedback or share
                  your own experience.
                </p>
              </div>

              <div className="bp-rating-overview">
                <div className="bp-rating-number">
                  {averageRating.toFixed(1)}
                </div>

                <div>
                  <StarRating
                    rating={averageRating}
                    size="large"
                  />

                  <p>
                    Based on {reviewCount}{" "}
                    {reviewCount === 1
                      ? "review"
                      : "reviews"}
                  </p>
                </div>
              </div>

              <div className="bp-reviews-list">
                {reviews.length === 0 ? (
                  <div className="bp-empty-state">
                    <span className="bp-empty-icon">
                      ★
                    </span>

                    <h3>No reviews yet</h3>

                    <p>
                      Be the first to share your
                      experience with this business.
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const avatar = getCustomerAvatarUrl(
                      review.reviewer_avatar_url,
                    );

                    return (
                      <article
                        className="bp-review-card"
                        key={review.id}
                      >
                        <div className="bp-review-avatar">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              loading="lazy"
                            />
                          ) : (
                            getInitials(
                              review.reviewer_name ||
                                "Customer",
                            )
                          )}
                        </div>

                        <div className="bp-review-content">
                          <div className="bp-review-heading">
                            <div>
                              <h3>
                                {review.reviewer_name ||
                                  "Customer"}
                              </h3>

                              <span className="bp-review-date">
                                {formatDate(
                                  review.created_at,
                                )}
                              </span>
                            </div>

                            <StarRating
                              rating={review.rating}
                              size="small"
                            />
                          </div>

                          {review.review_text && (
                            <p>{review.review_text}</p>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="bp-review-form-card">
                <h3>Write a review</h3>

                <p>
                  Share an honest review of your
                  experience with this business.
                </p>

                <form
                  className="bp-review-form"
                  onSubmit={handleReviewSubmit}
                >
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

                  <label>Rating</label>

                  <div
                    className="bp-rating-selector"
                    role="radiogroup"
                    aria-label="Choose your rating"
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={
                          star <= reviewRating
                            ? "bp-rating-star selected"
                            : "bp-rating-star"
                        }
                        onClick={() =>
                          setReviewRating(star)
                        }
                        aria-label={`${star} star${
                          star === 1 ? "" : "s"
                        }`}
                        aria-pressed={
                          reviewRating === star
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <label htmlFor="review-text">
                    Your review
                  </label>

                  <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(event) =>
                      setReviewText(event.target.value)
                    }
                    placeholder="Describe your experience..."
                    rows={5}
                    maxLength={2000}
                    required
                  />

                  <div className="bp-character-count">
                    {reviewText.length}/2000
                  </div>

                  <label htmlFor="review-image">
                    Profile photo (optional)
                  </label>

                  <input
                    id="review-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleReviewImageChange}
                  />

                  {reviewImagePreview && (
                    <div className="bp-review-image-preview">
                      <img
                        src={reviewImagePreview}
                        alt="Selected profile photo"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (reviewImagePreview) {
                            URL.revokeObjectURL(
                              reviewImagePreview,
                            );
                          }

                          setReviewImage(null);
                          setReviewImagePreview(null);
                        }}
                      >
                        Remove photo
                      </button>
                    </div>
                  )}

                  {reviewMessage && (
                    <p
                      className="bp-review-message"
                      role="status"
                    >
                      {reviewMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="bp-primary-button bp-review-submit"
                    disabled={submittingReview}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "Submit review"}
                  </button>

                  <small className="bp-review-disclaimer">
                    Reviews may be checked before
                    appearing publicly.
                  </small>
                </form>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* FLOATING WHATSAPP BUTTON */}

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bp-floating-whatsapp"
          aria-label={`Contact ${business.name} on WhatsApp`}
          onClick={() =>
            handleWhatsAppClick("floating_button")
          }
        >
          <span aria-hidden="true">◉</span>
          <span>Chat with business</span>
        </a>
      )}

      {/* FOOTER */}

      <footer className="bp-footer">
        <div className="bp-footer-inner">
          <Link href="/" className="bp-footer-brand">
            IFC BIZGROWTH
          </Link>

          <p>
            Discover businesses. Explore products.
            Connect with opportunities.
          </p>

          <div className="bp-footer-links">
            <Link href="/discover">
              Discover businesses
            </Link>

            <Link href="/privacy">
              Privacy policy
            </Link>

            <Link href="/terms">
              Terms of service
            </Link>
          </div>

          <small>
            © {new Date().getFullYear()} IFC BIZGROWTH.
            All rights reserved.
          </small>
        </div>
      </footer>
    </main>
  );
}
