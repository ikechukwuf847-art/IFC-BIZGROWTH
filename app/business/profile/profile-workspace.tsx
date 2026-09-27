"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useMemo,
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
  country_code: string | null;
  status: string;
  verification_status: string;
  is_public: boolean;
  is_featured: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type CategoryAssignment = {
  category_id: string;
} | null;

type SubcategoryAssignment = {
  subcategory_id: string;
} | null;

type ProfileWorkspaceProps = {
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
  categories: Category[];
  subcategories: Subcategory[];
  categoryAssignment: CategoryAssignment;
  subcategoryAssignment: SubcategoryAssignment;
};

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "X",
  "LinkedIn",
  "YouTube",
  "WhatsApp",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function firstValue(...values: any[]) {
  return values.find(
    (value) => value !== null && value !== undefined && value !== ""
  );
}

function formatRating(rating: any) {
  const value = firstValue(
    rating?.average_rating,
    rating?.avg_rating,
    rating?.rating,
    rating
  );

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.0";
  }

  return number.toFixed(1);
}

function getReviewCount(rating: any, reviews: any[]) {
  const value = firstValue(
    rating?.review_count,
    rating?.total_reviews,
    rating?.count
  );

  const number = Number(value);

  if (Number.isFinite(number)) {
    return number;
  }

  return reviews.length;
}

function normalizeSocialLinks(rows: any[]) {
  return SOCIAL_PLATFORMS.map((platform) => {
    const row = rows.find(
      (item) =>
        String(
          firstValue(item.platform, item.name, item.type)
        ).toLowerCase() === platform.toLowerCase()
    );

    return {
      platform,
      url: row
        ? String(firstValue(row.url, row.link, row.value) ?? "")
        : "",
      id: row?.id ?? null,
    };
  });
}

function normalizeHours(rows: any[]) {
  return DAYS.map((day, index) => {
    const row = rows.find((item) => {
      const dayValue = firstValue(
        item.day_of_week,
        item.day,
        item.day_name
      );

      if (typeof dayValue === "number") {
        return dayValue === index;
      }

      return (
        String(dayValue ?? "").toLowerCase() === day.toLowerCase()
      );
    });

    return {
      day,
      dayOfWeek: index,
      isOpen: row ? Boolean(firstValue(row.is_open, row.open)) : false,
      openTime: String(
        firstValue(row?.open_time, row?.opening_time) ?? "09:00"
      ),
      closeTime: String(
        firstValue(row?.close_time, row?.closing_time) ?? "17:00"
      ),
      id: row?.id ?? null,
    };
  });
}

function validateSocialUrl(url: string) {
  if (!url.trim()) {
    return true;
  }

  try {
    const parsed = new URL(url.trim());

    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
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
  categories,
  subcategories,
  categoryAssignment,
  subcategoryAssignment,
}: ProfileWorkspaceProps) {
  const supabase = createSupabaseBrowserClient();

  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [businessName, setBusinessName] = useState(business.name ?? "");
  const [description, setDescription] = useState(
    business.description ?? ""
  );
  const [email, setEmail] = useState(business.email ?? accountEmail);
  const [phone, setPhone] = useState(business.phone ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(
    business.website_url ?? ""
  );
  const [countryCode, setCountryCode] = useState(
    business.country_code ?? ""
  );
  const [isPublic, setIsPublic] = useState(
    Boolean(business.is_public)
  );

  const [currentLogoUrl, setCurrentLogoUrl] = useState(logoUrl);

  const [city, setCity] = useState(location?.city ?? "");
  const [stateRegion, setStateRegion] = useState(
    location?.state_region ?? ""
  );
  const [address, setAddress] = useState(
    location?.address ?? location?.address_line_1 ?? ""
  );
  const [addressLine2, setAddressLine2] = useState(
    location?.address_line_2 ?? ""
  );
  const [postalCode, setPostalCode] = useState(
    location?.postal_code ?? ""
  );

  const [socials, setSocials] = useState(
    normalizeSocialLinks(socialLinks)
  );

  const [hours, setHours] = useState(
    normalizeHours(businessHours)
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryAssignment?.category_id ?? ""
  );

  const [selectedSubcategoryId, setSelectedSubcategoryId] =
    useState(subcategoryAssignment?.subcategory_id ?? "");

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const availableSubcategories = useMemo(() => {
    return subcategories
      .filter(
        (subcategory) =>
          subcategory.category_id === selectedCategoryId
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [subcategories, selectedCategoryId]);

  function clearStatus() {
    setMessage("");
    setError("");
  }

  async function saveBusiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearStatus();

    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    setSavingBusiness(true);

    try {
      const response = await fetch("/api/businesses", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: business.id,
          name: businessName.trim(),
          description: description.trim() || null,
          country_code: countryCode || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          website_url: websiteUrl.trim() || null,
          is_public: isPublic,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update business information."
        );
      }

      setMessage("Business information saved successfully.");
    } catch (saveError: any) {
      setError(
        saveError?.message ||
          "Failed to update business information."
      );
    } finally {
      setSavingBusiness(false);
    }
  }

  async function saveCategory() {
    clearStatus();

    if (!selectedCategoryId) {
      setError("Please select a business category.");
      return;
    }

    if (
      selectedSubcategoryId &&
      !availableSubcategories.some(
        (subcategory) =>
          subcategory.id === selectedSubcategoryId
      )
    ) {
      setError(
        "The selected subcategory does not belong to this category."
      );
      return;
    }

    setSavingCategory(true);

    try {
      const { error: rpcError } = await supabase.rpc(
        "save_business_category",
        {
          p_business_id: business.id,
          p_category_id: selectedCategoryId,
          p_subcategory_id: selectedSubcategoryId || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      setMessage("Business category saved successfully.");
    } catch (saveError: any) {
      setError(
        saveError?.message ||
          "Failed to save business category."
      );
    } finally {
      setSavingCategory(false);
    }
  }

  async function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    clearStatus();

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Logo must not be larger than 5MB.");
      return;
    }

    setUploadingLogo(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${business.id}/logo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-logos")
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          logo_url: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id)
        .eq("owner_id", business.owner_id);

      if (updateError) {
        await supabase.storage
          .from("business-logos")
          .remove([filePath]);

        throw updateError;
      }

      const { data: signedLogo } = await supabase.storage
        .from("business-logos")
        .createSignedUrl(filePath, 60 * 60);

      setCurrentLogoUrl(signedLogo?.signedUrl ?? null);

      setMessage("Business logo updated successfully.");
    } catch (uploadError: any) {
      setError(
        uploadError?.message ||
          "Failed to upload business logo."
      );
    } finally {
      setUploadingLogo(false);

      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }

  async function removeLogo() {
    clearStatus();

    if (!business.logo_url) {
      return;
    }

    setRemovingLogo(true);

    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          logo_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id)
        .eq("owner_id", business.owner_id);

      if (updateError) {
        throw updateError;
      }

      await supabase.storage
        .from("business-logos")
        .remove([business.logo_url]);

      setCurrentLogoUrl(null);

      setMessage("Business logo removed successfully.");
    } catch (removeError: any) {
      setError(
        removeError?.message ||
          "Failed to remove business logo."
      );
    } finally {
      setRemovingLogo(false);
    }
  }

  function getDeviceCoordinates(): Promise<{
    latitude: number;
    longitude: number;
  } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearStatus();

    if (!address.trim()) {
      setError("Business address is required.");
      return;
    }

    if (!city.trim()) {
      setError("City is required.");
      return;
    }

    if (!stateRegion.trim()) {
      setError("State or region is required.");
      return;
    }

    setSavingLocation(true);

    try {
      let resolvedCountryCode = countryCode;

      if (!resolvedCountryCode) {
        setError("Please select a country first.");
        return;
      }

      const { data: countryRow, error: countryError } =
        await supabase
          .from("countries")
          .select("id, code")
          .eq("code", resolvedCountryCode)
          .maybeSingle();

      if (countryError) {
        throw countryError;
      }

      if (!countryRow) {
        throw new Error("Selected country could not be found.");
      }

      const coordinates = await getDeviceCoordinates();

      const locationPayload = {
        business_id: business.id,
        country_id: countryRow.id,
        country_code: resolvedCountryCode,
        city: city.trim(),
        state_region: stateRegion.trim(),
        address: address.trim(),
        address_line_1: address.trim(),
        address_line_2: addressLine2.trim() || null,
        postal_code: postalCode.trim() || null,
        latitude: coordinates?.latitude ?? location?.latitude ?? null,
        longitude:
          coordinates?.longitude ?? location?.longitude ?? null,
        is_primary: true,
        is_active: true,
        is_public: true,
      };

      if (location?.id) {
        const { error: updateError } = await supabase
          .from("business_locations")
          .update({
            ...locationPayload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", location.id)
          .eq("business_id", business.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("business_locations")
          .insert(locationPayload);

        if (insertError) {
          throw insertError;
        }
      }

      setMessage("Business location saved successfully.");
    } catch (locationError: any) {
      setError(
        locationError?.message ||
          "Failed to save business location."
      );
    } finally {
      setSavingLocation(false);
    }
  }

  async function saveSocials() {
    clearStatus();

    for (const social of socials) {
      if (!validateSocialUrl(social.url)) {
        setError(
          `${social.platform} contains an invalid URL.`
        );
        return;
      }
    }

    setSavingSocials(true);

    try {
      const { data: existingRows, error: existingError } =
        await supabase
          .from("business_social_links")
          .select("*")
          .eq("business_id", business.id);

      if (existingError) {
        throw existingError;
      }

      for (const social of socials) {
        const existing = (existingRows ?? []).find(
          (row: any) =>
            String(
              firstValue(row.platform, row.name, row.type)
            ).toLowerCase() === social.platform.toLowerCase()
        );

        if (social.url.trim()) {
          const payload = {
            business_id: business.id,
            platform: social.platform,
            url: social.url.trim(),
          };

          if (existing?.id) {
            const { error } = await supabase
              .from("business_social_links")
              .update(payload)
              .eq("id", existing.id)
              .eq("business_id", business.id);

            if (error) {
              throw error;
            }
          } else {
            const { error } = await supabase
              .from("business_social_links")
              .insert(payload);

            if (error) {
              throw error;
            }
          }
        } else if (existing?.id) {
          const { error } = await supabase
            .from("business_social_links")
            .delete()
            .eq("id", existing.id)
            .eq("business_id", business.id);

          if (error) {
            throw error;
          }
        }
      }

      setMessage("Social media links saved successfully.");
    } catch (socialError: any) {
      setError(
        socialError?.message ||
          "Failed to save social media links."
      );
    } finally {
      setSavingSocials(false);
    }
  }

  async function saveHours() {
    clearStatus();

    setSavingHours(true);

    try {
      const { data: existingRows, error: existingError } =
        await supabase
          .from("business_hours")
          .select("*")
          .eq("business_id", business.id);

      if (existingError) {
        throw existingError;
      }

      for (const hour of hours) {
        const existing = (existingRows ?? []).find(
          (row: any) => {
            const dayValue = firstValue(
              row.day_of_week,
              row.day,
              row.day_name
            );

            if (typeof dayValue === "number") {
              return dayValue === hour.dayOfWeek;
            }

            return (
              String(dayValue ?? "").toLowerCase() ===
              hour.day.toLowerCase()
            );
          }
        );

        const payload = {
          business_id: business.id,
          day_of_week: hour.dayOfWeek,
          is_open: hour.isOpen,
          open_time: hour.openTime,
          close_time: hour.closeTime,
        };

        if (existing?.id) {
          const { error } = await supabase
            .from("business_hours")
            .update(payload)
            .eq("id", existing.id)
            .eq("business_id", business.id);

          if (error) {
            throw error;
          }
        } else {
          const { error } = await supabase
            .from("business_hours")
            .insert(payload);

          if (error) {
            throw error;
          }
        }
      }

      setMessage("Business hours saved successfully.");
    } catch (hoursError: any) {
      setError(
        hoursError?.message ||
          "Failed to save business hours."
      );
    } finally {
      setSavingHours(false);
    }
  }

  function updateSocial(
    index: number,
    value: string
  ) {
    setSocials((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              url: value,
            }
          : item
      )
    );
  }

  function updateHour(
    index: number,
    field: "isOpen" | "openTime" | "closeTime",
    value: boolean | string
  ) {
    setHours((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  }

  function handleCategoryChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    const value = event.target.value;

    setSelectedCategoryId(value);

    if (
      selectedSubcategoryId &&
      !subcategories.some(
        (subcategory) =>
          subcategory.id === selectedSubcategoryId &&
          subcategory.category_id === value
      )
    ) {
      setSelectedSubcategoryId("");
    }

    clearStatus();
  }

  function handleSubcategoryChange(
    event: ChangeEvent<HTMLSelectElement>
  ) {
    setSelectedSubcategoryId(event.target.value);
    clearStatus();
  }

  const reviewCount = getReviewCount(rating, reviews);
  const formattedRating = formatRating(rating);

  const verificationLabel =
    business.verification_status === "approved"
      ? "Verified"
      : business.verification_status === "pending"
      ? "Verification pending"
      : business.verification_status === "needs_more_information"
      ? "More information required"
      : "Not verified";

  const profileStatus = business.is_public
    ? "Public"
    : "Private";

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <p className="profile-eyebrow">
              Business workspace
            </p>

            <h1>Business Profile</h1>

            <p className="profile-header-description">
              Manage the information customers see on your
              IFC BIZGROWTH business profile.
            </p>
          </div>

          <Link
            href={`/business/${business.slug}`}
            className="profile-public-link"
          >
            View public profile
          </Link>
        </div>

        {message ? (
          <div className="profile-message success">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="profile-message error">
            {error}
          </div>
        ) : null}

        <section className="profile-card profile-identity-card">
          <div className="profile-identity">
            <div className="profile-logo-wrapper">
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt={`${business.name} logo`}
                  className="profile-logo"
                />
              ) : (
                <div className="profile-logo-placeholder">
                  {initials}
                </div>
              )}
            </div>

            <div className="profile-identity-content">
              <div className="profile-identity-title">
                <h2>{business.name}</h2>

                <span
                  className={`profile-verification ${
                    business.verification_status ===
                    "approved"
                      ? "verified"
                      : ""
                  }`}
                >
                  {verificationLabel}
                </span>
              </div>

              <p>
                {business.description ||
                  "Add a business description to tell customers what your business offers."}
              </p>

              <div className="profile-status-row">
                <span
                  className={
                    business.is_public
                      ? "status-public"
                      : "status-private"
                  }
                >
                  {profileStatus}
                </span>

                {business.is_featured ? (
                  <span className="status-featured">
                    Featured
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="profile-logo-actions">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              hidden
            />

            <button
              type="button"
              className="profile-secondary-button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo || removingLogo}
            >
              {uploadingLogo
                ? "Uploading..."
                : "Change logo"}
            </button>

            {currentLogoUrl ? (
              <button
                type="button"
                className="profile-danger-button"
                onClick={removeLogo}
                disabled={uploadingLogo || removingLogo}
              >
                {removingLogo
                  ? "Removing..."
                  : "Remove logo"}
              </button>
            ) : null}
          </div>
        </section>

        <div className="profile-layout">
          <div className="profile-main">
            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Business information</h2>
                  <p>
                    Keep your basic business information
                    accurate and up to date.
                  </p>
                </div>
              </div>

              <form
                className="profile-form"
                onSubmit={saveBusiness}
              >
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label htmlFor="business-name">
                      Business name
                    </label>

                    <input
                      id="business-name"
                      type="text"
                      value={businessName}
                      onChange={(event) =>
                        setBusinessName(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-email">
                      Business email
                    </label>

                    <input
                      id="business-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-phone">
                      Phone number
                    </label>

                    <input
                      id="business-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-website">
                      Website
                    </label>

                    <input
                      id="business-website"
                      type="url"
                      value={websiteUrl}
                      onChange={(event) =>
                        setWebsiteUrl(event.target.value)
                      }
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-country">
                      Country code
                    </label>

                    <input
                      id="business-country"
                      type="text"
                      value={countryCode}
                      onChange={(event) =>
                        setCountryCode(
                          event.target.value.toUpperCase()
                        )
                      }
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label htmlFor="business-description">
                    Description
                  </label>

                  <textarea
                    id="business-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    rows={5}
                  />
                </div>

                <label className="profile-checkbox">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) =>
                      setIsPublic(event.target.checked)
                    }
                  />

                  <span>
                    Make my business profile public
                  </span>
                </label>

                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={savingBusiness}
                >
                  {savingBusiness
                    ? "Saving..."
                    : "Save business information"}
                </button>
              </form>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Business category</h2>
                  <p>
                    Select the category that best describes
                    your business and an optional
                    subcategory.
                  </p>
                </div>
              </div>

              <div className="profile-form">
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label htmlFor="business-category">
                      Category
                    </label>

                    <select
                      id="business-category"
                      value={selectedCategoryId}
                      onChange={handleCategoryChange}
                    >
                      <option value="">
                        Select a category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-subcategory">
                      Subcategory
                    </label>

                    <select
                      id="business-subcategory"
                      value={selectedSubcategoryId}
                      onChange={handleSubcategoryChange}
                      disabled={!selectedCategoryId}
                    >
                      <option value="">
                        Select a subcategory
                      </option>

                      {availableSubcategories.map(
                        (subcategory) => (
                          <option
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className="profile-primary-button"
                  onClick={saveCategory}
                  disabled={
                    savingCategory || !selectedCategoryId
                  }
                >
                  {savingCategory
                    ? "Saving..."
                    : "Save category"}
                </button>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Contact & social media</h2>
                  <p>
                    Add the social profiles customers can
                    use to find your business online.
                  </p>
                </div>
              </div>

              <div className="profile-form">
                <div className="profile-social-list">
                  {socials.map((social, index) => (
                    <div
                      className="profile-field"
                      key={social.platform}
                    >
                      <label
                        htmlFor={`social-${social.platform}`}
                      >
                        {social.platform}
                      </label>

                      <input
                        id={`social-${social.platform}`}
                        type="url"
                        value={social.url}
                        onChange={(event) =>
                          updateSocial(
                            index,
                            event.target.value
                          )
                        }
                        placeholder={`https://${social.platform.toLowerCase()}.com/...`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="profile-primary-button"
                  onClick={saveSocials}
                  disabled={savingSocials}
                >
                  {savingSocials
                    ? "Saving..."
                    : "Save social links"}
                </button>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Business location</h2>
                  <p>
                    Add your primary business location so
                    customers can find you.
                  </p>
                </div>
              </div>

              <form
                className="profile-form"
                onSubmit={saveLocation}
              >
                <div className="profile-form-grid">
                  <div className="profile-field">
                    <label htmlFor="business-city">
                      City
                    </label>

                    <input
                      id="business-city"
                      type="text"
                      value={city}
                      onChange={(event) =>
                        setCity(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-state">
                      State / Region
                    </label>

                    <input
                      id="business-state"
                      type="text"
                      value={stateRegion}
                      onChange={(event) =>
                        setStateRegion(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="profile-field">
                    <label htmlFor="business-postal">
                      Postal code
                    </label>

                    <input
                      id="business-postal"
                      type="text"
                      value={postalCode}
                      onChange={(event) =>
                        setPostalCode(event.target.value)
                      }
                    />
                  </div>

                  <div className="profile-field profile-field-full">
                    <label htmlFor="business-address">
                      Address
                    </label>

                    <input
                      id="business-address"
                      type="text"
                      value={address}
                      onChange={(event) =>
                        setAddress(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="profile-field profile-field-full">
                    <label htmlFor="business-address-2">
                      Address line 2
                    </label>

                    <input
                      id="business-address-2"
                      type="text"
                      value={addressLine2}
                      onChange={(event) =>
                        setAddressLine2(event.target.value)
                      }
                    />
                  </div>
                </div>

                <p className="profile-helper-text">
                  Your device location may be used to save
                  the coordinates of your business location.
                </p>

                <button
                  type="submit"
                  className="profile-primary-button"
                  disabled={savingLocation}
                >
                  {savingLocation
                    ? "Saving..."
                    : "Save business location"}
                </button>
              </form>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Business hours</h2>
                  <p>
                    Tell customers when your business is
                    open.
                  </p>
                </div>
              </div>

              <div className="profile-hours-list">
                {hours.map((hour, index) => (
                  <div
                    className="profile-hours-row"
                    key={hour.day}
                  >
                    <div className="profile-hours-day">
                      <strong>{hour.day}</strong>

                      <label className="profile-checkbox">
                        <input
                          type="checkbox"
                          checked={hour.isOpen}
                          onChange={(event) =>
                            updateHour(
                              index,
                              "isOpen",
                              event.target.checked
                            )
                          }
                        />

                        <span>Open</span>
                      </label>
                    </div>

                    <div className="profile-hours-times">
                      <input
                        type="time"
                        value={hour.openTime}
                        disabled={!hour.isOpen}
                        onChange={(event) =>
                          updateHour(
                            index,
                            "openTime",
                            event.target.value
                          )
                        }
                      />

                      <span>to</span>

                      <input
                        type="time"
                        value={hour.closeTime}
                        disabled={!hour.isOpen}
                        onChange={(event) =>
                          updateHour(
                            index,
                            "closeTime",
                            event.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="profile-primary-button"
                onClick={saveHours}
                disabled={savingHours}
              >
                {savingHours
                  ? "Saving..."
                  : "Save business hours"}
              </button>
            </section>
          </div>

          <aside className="profile-sidebar">
            <section className="profile-card profile-rating-card">
              <div className="profile-rating-value">
                {formattedRating}
              </div>

              <div className="profile-rating-stars">
                ★★★★★
              </div>

              <p>
                Based on {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </p>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Profile status</h2>
                </div>
              </div>

              <div className="profile-status-list">
                <div className="profile-status-item">
                  <span>Visibility</span>
                  <strong>{profileStatus}</strong>
                </div>

                <div className="profile-status-item">
                  <span>Verification</span>
                  <strong>{verificationLabel}</strong>
                </div>

                <div className="profile-status-item">
                  <span>Featured</span>
                  <strong>
                    {business.is_featured
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Profile content</h2>
                </div>
              </div>

              <div className="profile-status-list">
                <div className="profile-status-item">
                  <span>Photos</span>
                  <strong>{media.length}</strong>
                </div>

                <div className="profile-status-item">
                  <span>Products</span>
                  <strong>{products.length}</strong>
                </div>

                <div className="profile-status-item">
                  <span>Services</span>
                  <strong>{services.length}</strong>
                </div>

                <div className="profile-status-item">
                  <span>Promotions</span>
                  <strong>{promotions.length}</strong>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="profile-section-header">
                <div>
                  <h2>Account contact</h2>
                </div>
              </div>

              <p className="profile-account-email">
                {accountEmail}
              </p>

              {country ? (
                <p className="profile-helper-text">
                  {firstValue(
                    country.name,
                    country.country_name
                  ) ?? business.country_code}
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
  }
