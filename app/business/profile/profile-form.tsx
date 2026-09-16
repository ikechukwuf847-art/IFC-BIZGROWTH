"use client";

import {
  ChangeEvent,
  FormEvent,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/browser";

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
  country: Country | null;
  countries: Country[];
  logoSignedUrl: string | null;
};

export default function ProfileForm({
  business,
  country,
  countries,
  logoSignedUrl,
}: ProfileFormProps) {
  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(business.name || "");
  const [description, setDescription] = useState(
    business.description || ""
  );
  const [countryCode, setCountryCode] = useState(
    business.country_code || country?.code || ""
  );
  const [phone, setPhone] = useState(business.phone || "");
  const [email, setEmail] = useState(business.email || "");
  const [websiteUrl, setWebsiteUrl] = useState(
    business.website_url || ""
  );
  const [isPublic, setIsPublic] = useState(
    Boolean(business.is_public)
  );

  const [logoUrl, setLogoUrl] = useState(
    business.logo_url || ""
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(
    logoSignedUrl
  );

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [removingLogo, setRemovingLogo] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");

  const [selectedFileName, setSelectedFileName] = useState("");

  /*
   * Save normal business profile information
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

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
          country_code: countryCode,
          phone: phone.trim(),
          email: email.trim(),
          website_url: websiteUrl.trim(),
          is_public: isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Unable to update your business profile."
        );
      }

      setSuccess("Business profile updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating your business profile."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Select logo file
   */
  function handleLogoSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setLogoError("");
    setLogoSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setLogoError(
        "Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setLogoError(
        "Logo image must be 5 MB or smaller."
      );

      event.target.value = "";
      return;
    }

    setSelectedFileName(file.name);

    /*
     * Show an immediate local preview.
     */
    const previewUrl = URL.createObjectURL(file);

    setLogoPreview(previewUrl);
  }

  /*
   * Upload logo directly to Supabase Storage.
   */
  async function handleLogoUpload() {
    setLogoError("");
    setLogoSuccess("");

    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setLogoError("Please select a logo first.");
      return;
    }

    setUploadingLogo(true);

    try {
      /*
       * Make sure the user still has a valid session.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /*
       * Determine a safe file extension.
       */
      const extensionMap: Record<string, string> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };

      const extension = extensionMap[file.type];

      if (!extension) {
        throw new Error(
          "Unsupported image format."
        );
      }

      /*
       * Keep one predictable logo path.
       */
      const filePath =
        `${business.id}/logo.${extension}`;

      /*
       * Remove an old logo if its extension changed.
       */
      if (logoUrl) {
        const oldPath = logoUrl;

        if (oldPath !== filePath) {
          const { error: removeOldError } =
            await supabase.storage
              .from("business-logos")
              .remove([oldPath]);

          if (removeOldError) {
            console.warn(
              "Could not remove previous logo:",
              removeOldError
            );
          }
        }
      }

      /*
       * Upload the new logo.
       *
       * upsert allows replacing logo.png/logo.jpg/etc.
       */
      const { error: uploadError } =
        await supabase.storage
          .from("business-logos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true,
            contentType: file.type,
          });

      if (uploadError) {
        throw new Error(
          uploadError.message ||
            "Unable to upload your logo."
        );
      }

      /*
       * Save the STORAGE PATH in businesses.logo_url.
       */
      const { error: databaseError } =
        await supabase
          .from("businesses")
          .update({
            logo_url: filePath,
          })
          .eq("id", business.id)
          .eq("owner_id", user.id);

      if (databaseError) {
        /*
         * If database update fails, try to remove
         * the newly uploaded file so we don't leave
         * an orphaned logo.
         */
        await supabase.storage
          .from("business-logos")
          .remove([filePath]);

        throw new Error(
          databaseError.message ||
            "Unable to save your logo."
        );
      }

      /*
       * Generate a fresh signed URL immediately.
       */
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("business-logos")
          .createSignedUrl(filePath, 60 * 60);

      if (signedUrlError) {
        throw new Error(
          signedUrlError.message ||
            "Logo uploaded, but its preview could not be generated."
        );
      }

      setLogoUrl(filePath);

      setLogoPreview(
        signedUrlData?.signedUrl || null
      );

      setSelectedFileName("");

      /*
       * Clear the file input so selecting the same
       * file again will trigger onChange.
       */
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setLogoSuccess(
        "Business logo updated successfully."
      );
    } catch (err) {
      console.error("Logo upload error:", err);

      setLogoError(
        err instanceof Error
          ? err.message
          : "Something went wrong while uploading your logo."
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  /*
   * Remove current logo.
   */
  async function handleLogoRemove() {
    setLogoError("");
    setLogoSuccess("");

    if (!logoUrl) {
      setLogoPreview(null);
      return;
    }

    setRemovingLogo(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "Your session has expired. Please log in again."
        );
      }

      /*
       * Remove file from Storage.
       */
      const { error: removeError } =
        await supabase.storage
          .from("business-logos")
          .remove([logoUrl]);

      if (removeError) {
        throw new Error(
          removeError.message ||
            "Unable to remove your logo."
        );
      }

      /*
       * Clear logo path from business record.
       */
      const { error: databaseError } =
        await supabase
          .from("businesses")
          .update({
            logo_url: null,
          })
          .eq("id", business.id)
          .eq("owner_id", user.id);

      if (databaseError) {
        throw new Error(
          databaseError.message ||
            "Logo file was removed, but the business profile could not be updated."
        );
      }

      setLogoUrl("");
      setLogoPreview(null);
      setSelectedFileName("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setLogoSuccess(
        "Business logo removed successfully."
      );
    } catch (err) {
      console.error("Logo removal error:", err);

      setLogoError(
        err instanceof Error
          ? err.message
          : "Something went wrong while removing your logo."
      );
    } finally {
      setRemovingLogo(false);
    }
  }

  /*
   * Reset normal form fields.
   */
  function handleCancel() {
    setName(business.name || "");
    setDescription(business.description || "");
    setCountryCode(
      business.country_code || country?.code || ""
    );
    setPhone(business.phone || "");
    setEmail(business.email || "");
    setWebsiteUrl(business.website_url || "");
    setIsPublic(Boolean(business.is_public));

    setError("");
    setSuccess("");
  }

  return (
    <form
      className="profile-form"
      onSubmit={handleSubmit}
    >
      {/* Business information */}
      <section className="profile-form__section">
        <div className="profile-form__heading">
          <h2>Business information</h2>

          <p>
            Keep your business information accurate so
            customers can find and contact you.
          </p>
        </div>

        <div className="profile-form__grid">

          {/* Business name */}
          <div className="profile-field">
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
              required
              maxLength={150}
              autoComplete="organization"
            />
          </div>

          {/* Country */}
          <div className="profile-field">
            <label htmlFor="business-country">
              Country
            </label>

            <select
              id="business-country"
              value={countryCode}
              onChange={(event) =>
                setCountryCode(event.target.value)
              }
              required
            >
              <option value="">
                Select country
              </option>

              {countries.map((item) => (
                <option
                  key={item.code}
                  value={item.code}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="profile-field profile-field--full">
            <label htmlFor="business-description">
              Business description
            </label>

            <textarea
              id="business-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={6}
              maxLength={2000}
              placeholder="Tell customers what your business does..."
            />

            <span className="profile-field__hint">
              {description.length}/2000 characters
            </span>
          </div>

          {/* Phone */}
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
              maxLength={40}
              autoComplete="tel"
            />
          </div>

          {/* Email */}
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
              maxLength={254}
              autoComplete="email"
            />
          </div>

          {/* Website */}
          <div className="profile-field profile-field--full">
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
                setWebsiteUrl(event.target.value)
              }
              placeholder="https://example.com"
              maxLength={500}
              autoComplete="url"
            />

            <span className="profile-field__hint">
              Include https:// if your business has a
              website.
            </span>
          </div>

        </div>
      </section>

      {/* Business logo */}
      <section className="profile-form__section">
        <div className="profile-form__heading">
          <h2>Business logo</h2>

          <p>
            Add a clear logo to help customers recognize
            your business.
          </p>
        </div>

        <div className="profile-logo">

          <div className="profile-logo__preview">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt={`${business.name} logo`}
              />
            ) : (
              <span>
                {name?.charAt(0)?.toUpperCase() || "B"}
              </span>
            )}
          </div>

          <div className="profile-logo__content">

            <strong>
              {logoUrl
                ? "Your business logo"
                : "Add your business logo"}
            </strong>

            <p>
              JPG, PNG or WebP. Maximum file size: 5 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleLogoSelection}
              hidden
            />

            {selectedFileName && (
              <p className="profile-logo__filename">
                Selected: {selectedFileName}
              </p>
            )}

            <div className="profile-logo__actions">

              <button
                type="button"
                className="profile-button profile-button--secondary"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  uploadingLogo || removingLogo
                }
              >
                Choose image
              </button>

              {selectedFileName && (
                <button
                  type="button"
                  className="profile-button profile-button--primary"
                  onClick={handleLogoUpload}
                  disabled={
                    uploadingLogo || removingLogo
                  }
                >
                  {uploadingLogo ? (
                    <>
                      <span className="button-spinner" />
                      Uploading...
                    </>
                  ) : (
                    "Upload logo"
                  )}
                </button>
              )}

              {logoUrl && !selectedFileName && (
                <button
                  type="button"
                  className="profile-button profile-button--danger"
                  onClick={handleLogoRemove}
                  disabled={
                    uploadingLogo || removingLogo
                  }
                >
                  {removingLogo
                    ? "Removing..."
                    : "Remove logo"}
                </button>
              )}

            </div>

            {logoError && (
              <div className="profile-message profile-message--error">
                {logoError}
              </div>
            )}

            {logoSuccess && (
              <div className="profile-message profile-message--success">
                {logoSuccess}
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Visibility */}
      <section className="profile-form__section">
        <div className="profile-form__heading">
          <h2>Business visibility</h2>

          <p>
            Control whether customers can discover your
            business on IFC BIZGROWTH.
          </p>
        </div>

        <div className="visibility-card">
          <div className="visibility-card__content">
            <strong>
              {isPublic
                ? "Your business is public"
                : "Your business is private"}
            </strong>

            <p>
              {isPublic
                ? "Customers can discover your business in the public directory."
                : "Customers cannot discover your business in the public directory."}
            </p>
          </div>

          <button
            type="button"
            className={`toggle ${
              isPublic ? "toggle--active" : ""
            }`}
            onClick={() =>
              setIsPublic((current) => !current)
            }
            aria-pressed={isPublic}
            aria-label="Toggle business visibility"
          >
            <span className="toggle__track">
              <span className="toggle__thumb" />
            </span>

            <span className="toggle__text">
              {isPublic ? "Public" : "Private"}
            </span>
          </button>
        </div>
      </section>

      {/* Verification */}
      <section className="profile-form__section">
        <div className="profile-form__heading">
          <h2>Verification</h2>

          <p>
            Business verification helps customers know
            that your business has been reviewed.
          </p>
        </div>

        <div className="verification-status-card">

          <div className="verification-status-card__icon">
            {business.verification_status ===
            "approved"
              ? "✓"
              : "!"}
          </div>

          <div>
            <strong>
              {business.verification_status ===
              "approved"
                ? "Your business is verified"
                : business.verification_status ===
                  "pending"
                ? "Verification is pending"
                : business.verification_status ===
                  "rejected"
                ? "Verification was rejected"
                : business.verification_status ===
                  "needs_more_information"
                ? "More information is required"
                : "Your business is not verified"}
            </strong>

            <p>
              {business.verification_status ===
              "approved"
                ? "Your business has an approved verification status."
                : "Submit your verification information from the verification section of your business dashboard."}
            </p>
          </div>

        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="profile-message profile-message--error">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-message profile-message--success">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="profile-form__actions">

        <button
          type="button"
          className="profile-button profile-button--secondary"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="profile-button profile-button--primary"
          disabled={saving}
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
