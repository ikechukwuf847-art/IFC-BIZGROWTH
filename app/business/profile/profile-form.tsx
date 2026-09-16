"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";

type Country = {
  code: string;
  name: string;
  official_name?: string | null;
  currency_code: string;
};

type Business = {
  id: string;
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

type ProfileFormProps = {
  business: Business;
  countries: Country[];
};

export default function ProfileForm({
  business,
  countries,
}: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(
    null,
  );

  const [name, setName] = useState(business.name);

  const [description, setDescription] = useState(
    business.description ?? "",
  );

  const [countryCode, setCountryCode] = useState(
    business.country_code,
  );

  const [phone, setPhone] = useState(
    business.phone ?? "",
  );

  const [email, setEmail] = useState(
    business.email ?? "",
  );

  const [websiteUrl, setWebsiteUrl] = useState(
    business.website_url ?? "",
  );

  const [isPublic, setIsPublic] = useState(
    business.is_public,
  );

  const [logoVersion, setLogoVersion] = useState(
    Date.now(),
  );

  const [logoUploading, setLogoUploading] =
    useState(false);

  const [logoRemoving, setLogoRemoving] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function handleLogoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, or WebP image.",
      );

      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Logo image must not be larger than 5 MB.",
      );

      event.target.value = "";
      return;
    }

    try {
      setLogoUploading(true);

      const formData = new FormData();

      formData.append("logo", file);

      const response = await fetch(
        "/api/businesses/logo",
        {
          method: "POST",
          body: formData,
        },
      );

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to upload your business logo.",
        );
      }

      setLogoVersion(Date.now());

      setSuccess(
        data.message ||
          "Business logo updated successfully.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading your logo.",
      );
    } finally {
      setLogoUploading(false);

      event.target.value = "";
    }
  }

  async function handleRemoveLogo() {
    const confirmed = window.confirm(
      "Are you sure you want to remove your business logo?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setLogoRemoving(true);

      const response = await fetch(
        "/api/businesses/logo",
        {
          method: "DELETE",
        },
      );

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to remove your business logo.",
        );
      }

      setLogoVersion(Date.now());

      setSuccess(
        data.message ||
          "Business logo removed successfully.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while removing your logo.",
      );
    } finally {
      setLogoRemoving(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanWebsite = websiteUrl.trim();

    if (cleanName.length < 2) {
      setError(
        "Business name must contain at least 2 characters.",
      );
      return;
    }

    if (cleanName.length > 150) {
      setError(
        "Business name must not exceed 150 characters.",
      );
      return;
    }

    if (cleanDescription.length > 5000) {
      setError(
        "Description must not exceed 5000 characters.",
      );
      return;
    }

    if (!countryCode) {
      setError(
        "Please select your business country.",
      );
      return;
    }

    if (cleanPhone.length > 50) {
      setError(
        "Phone number must not exceed 50 characters.",
      );
      return;
    }

    if (cleanEmail.length > 255) {
      setError(
        "Business email must not exceed 255 characters.",
      );
      return;
    }

    if (cleanEmail) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(cleanEmail)) {
        setError(
          "Please provide a valid business email.",
        );
        return;
      }
    }

    if (cleanWebsite.length > 500) {
      setError(
        "Website URL must not exceed 500 characters.",
      );
      return;
    }

    if (cleanWebsite) {
      try {
        const website = new URL(cleanWebsite);

        if (
          website.protocol !== "http:" &&
          website.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Please provide a valid website URL starting with http:// or https://.",
        );
        return;
      }
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/businesses",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            business_id: business.id,
            name: cleanName,
            description: cleanDescription,
            country_code: countryCode,
            phone: cleanPhone,
            email: cleanEmail,
            website_url: cleanWebsite,
            is_public: isPublic,
          }),
        },
      );

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
        business?: Business;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response.",
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to update your business profile.",
        );
      }

      if (data.business) {
        setName(data.business.name);

        setDescription(
          data.business.description ?? "",
        );

        setCountryCode(
          data.business.country_code,
        );

        setPhone(data.business.phone ?? "");

        setEmail(data.business.email ?? "");

        setWebsiteUrl(
          data.business.website_url ?? "",
        );

        setIsPublic(data.business.is_public);
      }

      setSuccess(
        data.message ||
          "Business profile updated successfully.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setName(business.name);

    setDescription(
      business.description ?? "",
    );

    setCountryCode(business.country_code);

    setPhone(business.phone ?? "");

    setEmail(business.email ?? "");

    setWebsiteUrl(
      business.website_url ?? "",
    );

    setIsPublic(business.is_public);

    setError("");
    setSuccess("");
  }

  const logoSrc = business.logo_url
    ? `/api/businesses/logo?v=${logoVersion}`
    : "";

  const logoBusy =
    logoUploading || logoRemoving;

  return (
    <form
      className="profile-form"
      onSubmit={handleSubmit}
    >
      {/* BUSINESS LOGO */}

      <div className="profile-form__section">
        <div className="profile-form__heading">
          <div>
            <h2>Business logo</h2>

            <p>
              Upload your real business logo so
              customers can easily recognize your
              business.
            </p>
          </div>
        </div>

        <div className="profile-logo">
          <div className="profile-logo__preview">
            {business.logo_url ? (
              <img
                key={logoSrc}
                src={logoSrc}
                alt={`${business.name} logo`}
              />
            ) : (
              <span>
                {business.name
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="profile-logo__content">
            <strong>
              {business.logo_url
                ? "Your business logo"
                : "Add your business logo"}
            </strong>

            <p>
              Use a clear square logo. JPG, PNG, or
              WebP up to 5 MB.
            </p>

            <div className="profile-logo__actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoChange}
                disabled={
                  saving || logoBusy
                }
                hidden
              />

              <button
                type="button"
                className="profile-button profile-button--primary"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  saving || logoBusy
                }
              >
                {logoUploading ? (
                  <>
                    <span className="button-spinner" />
                    Uploading...
                  </>
                ) : business.logo_url ? (
                  "Change logo"
                ) : (
                  "Upload logo"
                )}
              </button>

              {business.logo_url && (
                <button
                  type="button"
                  className="profile-button profile-button--secondary"
                  onClick={handleRemoveLogo}
                  disabled={
                    saving || logoBusy
                  }
                >
                  {logoRemoving ? (
                    <>
                      <span className="button-spinner" />
                      Removing...
                    </>
                  ) : (
                    "Remove"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BUSINESS INFORMATION */}

      <div className="profile-form__section">
        <div className="profile-form__heading">
          <div>
            <h2>Business information</h2>

            <p>
              Keep your business information accurate
              so customers know who they are dealing
              with.
            </p>
          </div>
        </div>

        <div className="profile-form__grid">
          <div className="profile-field profile-field--full">
            <label htmlFor="business-name">
              Business name
            </label>

            <input
              id="business-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your business name"
              maxLength={150}
              disabled={saving || logoBusy}
              required
            />

            <span className="profile-field__hint">
              This is the name customers will see.
            </span>
          </div>

          <div className="profile-field profile-field--full">
            <label htmlFor="business-description">
              Description
            </label>

            <textarea
              id="business-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Tell customers what your business does..."
              maxLength={5000}
              rows={6}
              disabled={saving || logoBusy}
            />

            <span className="profile-field__hint">
              {description.length}/5000 characters
            </span>
          </div>

          <div className="profile-field">
            <label htmlFor="business-country">
              Country
            </label>

            <select
              id="business-country"
              value={countryCode}
              onChange={(event) =>
                setCountryCode(
                  event.target.value,
                )
              }
              disabled={saving || logoBusy}
              required
            >
              <option value="">
                Select country
              </option>

              {countries.map((country) => (
                <option
                  key={country.code}
                  value={country.code}
                >
                  {country.name}
                </option>
              ))}
            </select>
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
              placeholder="+234..."
              maxLength={50}
              disabled={saving || logoBusy}
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
              placeholder="business@example.com"
              maxLength={255}
              disabled={saving || logoBusy}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="business-website">
              Website

              <span className="profile-field__optional">
                Optional
              </span>
            </label>

            <input
              id="business-website"
              type="url"
              value={websiteUrl}
              onChange={(event) =>
                setWebsiteUrl(
                  event.target.value,
                )
              }
              placeholder="https://example.com"
              maxLength={500}
              disabled={saving || logoBusy}
            />
          </div>
        </div>
      </div>

      {/* VISIBILITY */}

      <div className="profile-form__section">
        <div className="profile-form__heading">
          <div>
            <h2>Business visibility</h2>

            <p>
              Control whether customers can discover
              your business publicly.
            </p>
          </div>
        </div>

        <div className="visibility-card">
          <div className="visibility-card__content">
            <strong>
              Make my business visible
            </strong>

            <span>
              When enabled, your business can appear
              in the IFC BIZGROWTH business directory.
            </span>
          </div>

          <button
            type="button"
            className={`toggle ${
              isPublic ? "toggle--active" : ""
            }`}
            onClick={() =>
              setIsPublic(
                (current) => !current,
              )
            }
            disabled={saving || logoBusy}
            aria-label={
              isPublic
                ? "Hide business from public directory"
                : "Show business in public directory"
            }
            aria-pressed={isPublic}
          >
            <span className="toggle__track">
              <span className="toggle__thumb" />
            </span>

            <span className="toggle__text">
              {isPublic ? "Visible" : "Hidden"}
            </span>
          </button>
        </div>
      </div>

      {/* VERIFICATION */}

      <div className="profile-form__section">
        <div className="profile-form__heading">
          <div>
            <h2>Verification</h2>

            <p>
              Your verification status is controlled
              by IFC BIZGROWTH.
            </p>
          </div>
        </div>

        <div className="verification-status-card">
          <div className="verification-status-card__icon">
            ✓
          </div>

          <div>
            <strong>
              {formatVerificationStatus(
                business.verification_status,
              )}
            </strong>

            <span>
              Verification status cannot be changed
              from your profile.
            </span>
          </div>
        </div>
      </div>

      {/* MESSAGES */}

      {error && (
        <div
          className="profile-message profile-message--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="profile-message profile-message--success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* ACTIONS */}

      <div className="profile-form__actions">
        <button
          type="button"
          className="profile-button profile-button--secondary"
          onClick={handleCancel}
          disabled={saving || logoBusy}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="profile-button profile-button--primary"
          disabled={saving || logoBusy}
        >
          {saving ? (
            <>
              <span className="button-spinner" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </form>
  );
}

function formatVerificationStatus(
  status: string,
) {
  switch (status) {
    case "approved":
      return "Verified";

    case "pending":
      return "Verification pending";

    case "needs_more_information":
      return "More information required";

    case "rejected":
      return "Verification rejected";

    case "not_submitted":
    default:
      return "Not verified";
  }
    }
