"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./profile.css";

type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  logo_url: string | null;
  country_code: string;
  status: string;
  verification_status: string;
  is_public: boolean;
  is_featured: boolean;
};

type Props = {
  business: Business;
  accountEmail: string;
  logoUrl: string | null;
  initials: string;
  location: any;
  socialLinks: any[];
  businessHours: any[];
  media: any[];
  products: any[];
  services: any[];
  promotions: any[];
  reviews: any[];
  rating: any;
  country: any;
};

const SOCIAL_PLATFORMS = [
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/234..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/..." },
];

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const MAX_LOGO_SIZE = 5 * 1024 * 1024;

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "B";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function firstValue(row: any, keys: string[]) {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null) {
      return row[key];
    }
  }

  return null;
}

function formatRating(value: any) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0.0";

  return number.toFixed(1);
}

function getReviewCount(rating: any, reviews: any[]) {
  const count = Number(
    firstValue(rating, ["review_count", "reviewCount", "count"])
  );

  if (Number.isFinite(count)) return count;

  return reviews.length;
}

function normalizeSocialLinks(rows: any[]) {
  const result: Record<string, string> = {};

  for (const row of rows) {
    const platform = firstValue(row, [
      "platform",
      "name",
      "type",
      "social_platform",
    ]);

    const url = firstValue(row, [
      "url",
      "link",
      "profile_url",
      "social_url",
    ]);

    if (platform && url) {
      result[String(platform).toLowerCase()] = String(url);
    }
  }

  return result;
}

function normalizeHours(rows: any[]) {
  return DAYS.map((day) => {
    const row = rows.find((item) => {
      const value = firstValue(item, [
        "day_of_week",
        "day",
        "weekday",
      ]);

      return Number(value) === day.value;
    });

    return {
      day: day.value,
      label: day.label,
      id: row?.id ?? null,
      isClosed: Boolean(
        firstValue(row, ["is_closed", "closed"]) ?? false
      ),
      open: firstValue(row, [
        "opens_at",
        "open_time",
        "opening_time",
        "start_time",
      ]) ?? "08:00",
      close: firstValue(row, [
        "closes_at",
        "close_time",
        "closing_time",
        "end_time",
      ]) ?? "17:00",
    };
  });
}

export default function ProfileWorkspace({
  business,
  accountEmail,
  logoUrl,
  initials,
  location,
  socialLinks,
  businessHours,
  media,
  products,
  services,
  promotions,
  reviews,
  rating,
  country,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(business.name);
  const [description, setDescription] = useState(
    business.description ?? ""
  );
  const [phone, setPhone] = useState(business.phone ?? "");
  const [email, setEmail] = useState(business.email ?? "");
  const [website, setWebsite] = useState(
    business.website_url ?? ""
  );
  const [isPublic, setIsPublic] = useState(
    Boolean(business.is_public)
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    logoUrl
  );
  const [logoPath, setLogoPath] = useState(
    business.logo_url ?? ""
  );
  const [selectedLogo, setSelectedLogo] = useState<File | null>(
    null
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [address1, setAddress1] = useState(
    location?.address_line_1 ?? ""
  );
  const [address2, setAddress2] = useState(
    location?.address_line_2 ?? ""
  );
  const [city, setCity] = useState(location?.city ?? "");
  const [stateRegion, setStateRegion] = useState(
    location?.state_region ?? ""
  );
  const [postalCode, setPostalCode] = useState(
    location?.postal_code ?? ""
  );
  const [latitude, setLatitude] = useState(
    location?.latitude?.toString() ?? ""
  );
  const [longitude, setLongitude] = useState(
    location?.longitude?.toString() ?? ""
  );

  const [socials, setSocials] = useState<Record<string, string>>(
    normalizeSocialLinks(socialLinks)
  );

  const [hours, setHours] = useState(
    normalizeHours(businessHours)
  );

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const verified =
    business.verification_status === "approved" ||
    business.verification_status === "verified";

  const reviewCount = getReviewCount(rating, reviews);
  const averageRating = formatRating(
    firstValue(rating, ["average_rating", "avg_rating"])
  );

  async function saveBusiness(event: FormEvent) {
    event.preventDefault();

    setSavingBusiness(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/businesses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: business.id,
          name: name.trim(),
          description: description.trim(),
          country_code: business.country_code,
          phone: phone.trim(),
          email: email.trim(),
          website_url: website.trim(),
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update business information."
        );
      }

      setMessage("Business information saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business information."
      );
    } finally {
      setSavingBusiness(false);
    }
  }

  function chooseLogo(event: ChangeEvent<HTMLInputElement>) {
    setMessage("");
    setError("");

    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setError("Logo must be JPG, PNG, or WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      setError("Logo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo() {
    if (!selectedLogo) return;

    setUploadingLogo(true);
    setMessage("");
    setError("");

    try {
      const extension =
        selectedLogo.type === "image/jpeg"
          ? "jpg"
          : selectedLogo.type === "image/png"
            ? "png"
            : "webp";

      const newPath = `${business.id}/logo.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(newPath, selectedLogo, {
          upsert: true,
          cacheControl: "3600",
          contentType: selectedLogo.type,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { error: databaseError } = await supabase
        .from("businesses")
        .update({
          logo_url: newPath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id)
        .eq("owner_id", business.owner_id);

      if (databaseError) {
        await supabase.storage
          .from("business-logos")
          .remove([newPath]);

        throw new Error(databaseError.message);
      }

      const { data: signed } = await supabase.storage
        .from("business-logos")
        .createSignedUrl(newPath, 60 * 60);

      if (logoPath && logoPath !== newPath) {
        await supabase.storage
          .from("business-logos")
          .remove([logoPath]);
      }

      setLogoPath(newPath);
      setLogoPreview(signed?.signedUrl ?? null);
      setSelectedLogo(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage("Business logo updated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload business logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function removeLogo() {
    if (!logoPath) return;

    setUploadingLogo(true);
    setMessage("");
    setError("");

    try {
      const { error: storageError } = await supabase.storage
        .from("business-logos")
        .remove([logoPath]);

      if (storageError) {
        throw new Error(storageError.message);
      }

      const { error: databaseError } = await supabase
        .from("businesses")
        .update({
          logo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id)
        .eq("owner_id", business.owner_id);

      if (databaseError) {
        throw new Error(databaseError.message);
      }

      setLogoPath("");
      setLogoPreview(null);
      setMessage("Business logo removed.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove business logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function saveLocation(event: FormEvent) {
    event.preventDefault();

    setSavingLocation(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        business_id: business.id,
        address_line_1: address1.trim(),
        address_line_2: address2.trim() || null,
        city: city.trim(),
        state_region: stateRegion.trim(),
        postal_code: postalCode.trim() || null,
        country_code: business.country_code,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        is_primary: true,
        is_public: true,
      };

      if (location?.id) {
        const { error: updateError } = await supabase
          .from("business_locations")
          .update(payload)
          .eq("id", location.id)
          .eq("business_id", business.id);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from("business_locations")
          .insert(payload);

        if (insertError) throw new Error(insertError.message);
      }

      setMessage("Business location saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business location."
      );
    } finally {
      setSavingLocation(false);
    }
  }

  async function saveSocials(event: FormEvent) {
    event.preventDefault();

    setSavingSocials(true);
    setMessage("");
    setError("");

    try {
      /*
       * Keep the operation restricted to this business.
       * Existing links are updated by platform.
       * Empty links are removed.
       */
      for (const item of SOCIAL_PLATFORMS) {
        const platform = item.key;
        const url = socials[platform]?.trim() ?? "";

        const existing = socialLinks.find((row) => {
          const rowPlatform = firstValue(row, [
            "platform",
            "name",
            "type",
            "social_platform",
          ]);

          return (
            String(rowPlatform ?? "").toLowerCase() === platform
          );
        });

        if (existing?.id) {
          if (url) {
            const { error: updateError } = await supabase
              .from("business_social_links")
              .update({
                platform,
                url,
                is_public: true,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id)
              .eq("business_id", business.id);

            if (updateError) {
              throw new Error(updateError.message);
            }
          } else {
            const { error: deleteError } = await supabase
              .from("business_social_links")
              .delete()
              .eq("id", existing.id)
              .eq("business_id", business.id);

            if (deleteError) {
              throw new Error(deleteError.message);
            }
          }
        } else if (url) {
          const { error: insertError } = await supabase
            .from("business_social_links")
            .insert({
              business_id: business.id,
              platform,
              url,
              is_public: true,
            });

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      setMessage("Contact and social links saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save social links."
      );
    } finally {
      setSavingSocials(false);
    }
  }

  async function saveHours(event: FormEvent) {
    event.preventDefault();

    setSavingHours(true);
    setMessage("");
    setError("");

    try {
      for (const item of hours) {
        if (item.id) {
          const { error: updateError } = await supabase
            .from("business_hours")
            .update({
              day_of_week: item.day,
              opens_at: item.isClosed ? null : item.open,
              closes_at: item.isClosed ? null : item.close,
              is_closed: item.isClosed,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id)
            .eq("business_id", business.id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        } else {
          const { error: insertError } = await supabase
            .from("business_hours")
            .insert({
              business_id: business.id,
              day_of_week: item.day,
              opens_at: item.isClosed ? null : item.open,
              closes_at: item.isClosed ? null : item.close,
              is_closed: item.isClosed,
            });

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      setMessage("Business hours saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save business hours."
      );
    } finally {
      setSavingHours(false);
    }
  }

  function updateHour(
    index: number,
    field: "open" | "close" | "isClosed",
    value: string | boolean
  ) {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  const addressParts = [
    firstValue(location, ["address_line_1"]),
    firstValue(location, ["address_line_2"]),
    firstValue(location, ["city"]),
    firstValue(location, ["state_region"]),
    firstValue(location, ["postal_code"]),
    country?.name,
  ].filter(Boolean);

  return (
    <main className="profile-page">
      <header className="profile-page-header">
        <div>
          <span className="profile-eyebrow">Business profile</span>
          <h1>{business.name}</h1>
          <p>
            Manage the information customers see when they discover
            your business.
          </p>
        </div>

        <Link href={`/businesses/${business.slug}`} className="view-profile-button">
          View public profile
        </Link>
      </header>

      {(message || error) && (
        <div className={`profile-message ${error ? "error" : "success"}`}>
          {error || message}
        </div>
      )}

      <section className="profile-cover">
        <div className="profile-cover-pattern" />

        <div className="profile-identity">
          <div className="profile-avatar">
            {logoPreview ? (
              <img src={logoPreview} alt={`${business.name} logo`} />
            ) : (
              <span>{getInitials(name || initials)}</span>
            )}
          </div>

          <div className="profile-identity-text">
            <div className="profile-name-row">
              <h2>{business.name}</h2>

              {verified && (
                <span
                  className="verification-check"
                  title="Verified business"
                  aria-label="Verified business"
                >
                  ✓
                </span>
              )}
            </div>

            <p>{country?.name || business.country_code}</p>

            <div className="profile-status-row">
              {verified ? (
                <span className="verified-badge">
                  ✓ Verified Business
                </span>
              ) : (
                <Link
                  href="/business/verification"
                  className="verify-profile-button"
                >
                  Get verified
                </Link>
              )}

              <span
                className={
                  business.is_public
                    ? "visibility-badge public"
                    : "visibility-badge private"
                }
              >
                {business.is_public ? "Public profile" : "Private profile"}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-cover-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={chooseLogo}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingLogo}
          >
            {logoPreview ? "Change logo" : "Add logo"}
          </button>

          {selectedLogo && (
            <button
              type="button"
              className="primary"
              onClick={uploadLogo}
              disabled={uploadingLogo}
            >
              {uploadingLogo ? "Uploading..." : "Save logo"}
            </button>
          )}

          {logoPath && !selectedLogo && (
            <button
              type="button"
              className="danger"
              onClick={removeLogo}
              disabled={uploadingLogo}
            >
              Remove
            </button>
          )}
        </div>
      </section>

      <div className="profile-grid">
        <div className="profile-main-column">
          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Business information</h2>
                <p>Information customers use to understand and contact your business.</p>
              </div>
            </div>

            <form onSubmit={saveBusiness}>
              <div className="profile-form-grid">
                <label>
                  Business name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  Business email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                  />
                </label>

                <label>
                  Phone number
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={40}
                  />
                </label>

                <label>
                  Website
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                  />
                </label>

                <label className="full">
                  About the business
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    maxLength={2000}
                    placeholder="Tell customers about your business..."
                  />
                </label>
              </div>

              <div className="profile-public-toggle">
                <div>
                  <strong>Show this business publicly</strong>
                  <p>
                    When enabled, customers can discover your business
                    through the public IFC BIZGROWTH directory.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${isPublic ? "on" : ""}`}
                  aria-pressed={isPublic}
                  onClick={() => setIsPublic((value) => !value)}
                >
                  <span />
                </button>
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  type="submit"
                  disabled={savingBusiness}
                >
                  {savingBusiness ? "Saving..." : "Save information"}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Contact & social media</h2>
                <p>
                  Add the channels customers can use to reach your business.
                </p>
              </div>
            </div>

            <form onSubmit={saveSocials}>
              <div className="social-grid">
                {SOCIAL_PLATFORMS.map((platform) => (
                  <label key={platform.key}>
                    {platform.label}
                    <input
                      type="url"
                      value={socials[platform.key] ?? ""}
                      onChange={(e) =>
                        setSocials((current) => ({
                          ...current,
                          [platform.key]: e.target.value,
                        }))
                      }
                      placeholder={platform.placeholder}
                    />
                  </label>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  type="submit"
                  disabled={savingSocials}
                >
                  {savingSocials ? "Saving..." : "Save contact links"}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Business location</h2>
                <p>
                  Give customers the complete address of your business.
                </p>
              </div>
            </div>

            <form onSubmit={saveLocation}>
              <div className="profile-form-grid">
                <label className="full">
                  Address
                  <input
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </label>

                <label className="full">
                  Address line 2
                  <input
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Suite, building, landmark..."
                  />
                </label>

                <label>
                  City
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </label>

                <label>
                  State / Region
                  <input
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Postal code
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </label>

                <label>
                  Country
                  <input
                    value={country?.name || business.country_code}
                    disabled
                  />
                </label>

                <label>
                  Latitude
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="9.0765"
                  />
                </label>

                <label>
                  Longitude
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="7.3986"
                  />
                </label>
              </div>

              <div className="location-preview">
                <div className="location-preview-icon">⌖</div>
                <div>
                  <strong>
                    {addressParts.length
                      ? addressParts.join(", ")
                      : "Location not completed"}
                  </strong>
                  <span>
                    Customers will see this address on your public profile.
                  </span>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  type="submit"
                  disabled={savingLocation}
                >
                  {savingLocation ? "Saving..." : "Save location"}
                </button>
              </div>
            </form>
          </section>

          <section className="profile-card">
            <div className="profile-card-heading">
              <div>
                <h2>Business hours</h2>
                <p>Tell customers when your business is open.</p>
              </div>
            </div>

            <form onSubmit={saveHours}>
              <div className="hours-list">
                {hours.map((item, index) => (
                  <div className="hours-row" key={item.day}>
                    <strong>{item.label}</strong>

                    <label className="closed-control">
                      <input
                        type="checkbox"
                        checked={item.isClosed}
                        onChange={(e) =>
                          updateHour(
                            index,
                            "isClosed",
                            e.target.checked
                          )
                        }
                      />
                      Closed
                    </label>

                    {!item.isClosed && (
                      <div className="hours-times">
                        <input
                          type="time"
                          value={item.open}
                          onChange={(e) =>
                            updateHour(index, "open", e.target.value)
                          }
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={item.close}
                          onChange={(e) =>
                            updateHour(index, "close", e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  className="save-button"
                  type="submit"
                  disabled={savingHours}
                >
                  {savingHours ? "Saving..." : "Save business hours"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <aside className="profile-side-column">
          <section className="profile-card rating-card">
            <div className="rating-number">{averageRating}</div>

            <div>
              <div className="stars">
                {"★★★★★".split("").map((star, index) => (
                  <span
                    key={index}
                    className={
                      index < Math.round(Number(averageRating))
                        ? "filled"
                        : ""
                    }
                  >
                    {star}
                  </span>
                ))}
              </div>

              <strong>{reviewCount} reviews</strong>
              <span>Customer rating</span>
            </div>
          </section>

          <section className="profile-card">
            <div className="side-heading">
              <h2>Profile status</h2>
            </div>

            <div className="status-list">
              <div>
                <span>Business</span>
                <strong>{business.status}</strong>
              </div>

              <div>
                <span>Visibility</span>
                <strong>{business.is_public ? "Public" : "Private"}</strong>
              </div>

              <div>
                <span>Verification</span>
                <strong className={verified ? "verified-text" : ""}>
                  {verified ? "Verified" : "Not verified"}
                </strong>
              </div>
            </div>

            {!verified && (
              <Link
                href="/business/verification"
                className="verification-cta"
              >
                <span>✓</span>
                <div>
                  <strong>Verify your business</strong>
                  <small>
                    Build customer trust with IFC BIZGROWTH verification.
                  </small>
                </div>
                <b>→</b>
              </Link>
            )}
          </section>

          <section className="profile-card">
            <div className="side-heading">
              <h2>Profile content</h2>
            </div>

            <div className="content-counts">
              <div>
                <strong>{media.length}</strong>
                <span>Photos</span>
              </div>
              <div>
                <strong>{services.length}</strong>
                <span>Services</span>
              </div>
              <div>
                <strong>{products.length}</strong>
                <span>Products</span>
              </div>
              <div>
                <strong>{promotions.length}</strong>
                <span>Updates</span>
              </div>
            </div>
          </section>

          <section className="profile-card">
            <div className="side-heading">
              <h2>Account contact</h2>
            </div>

            <div className="account-contact">
              <span>Account email</span>
              <strong>{accountEmail || "Not available"}</strong>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
  }
