"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Country = {
  code: string;
  name: string;
  official_name: string | null;
  currency_code: string;
};

type FormData = {
  name: string;
  description: string;
  country_code: string;
  phone: string;
  email: string;
  website_url: string;
};

export default function CreateBusinessPage() {
  const router = useRouter();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    description: "",
    country_code: "",
    phone: "",
    email: "",
    website_url: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCountries() {
      try {
        const response = await fetch("/api/countries", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load countries.",
          );
        }

        if (!cancelled) {
          setCountries(data.countries ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load countries.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCountries(false);
        }
      }
    }

    loadCountries();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(
    field: keyof FormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const description = form.description.trim();
    const countryCode = form.country_code.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const websiteUrl = form.website_url.trim();

    if (name.length < 2) {
      setError(
        "Please enter your business name.",
      );
      return;
    }

    if (name.length > 150) {
      setError(
        "Business name is too long.",
      );
      return;
    }

    if (!countryCode) {
      setError(
        "Please select your business country.",
      );
      return;
    }

    if (description.length > 5000) {
      setError(
        "Business description is too long.",
      );
      return;
    }

    if (phone.length > 50) {
      setError(
        "Phone number is too long.",
      );
      return;
    }

    if (email.length > 255) {
      setError(
        "Email address is too long.",
      );
      return;
    }

    if (websiteUrl.length > 500) {
      setError(
        "Website URL is too long.",
      );
      return;
    }

    if (websiteUrl) {
      try {
        const url = new URL(websiteUrl);

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Please enter a valid website URL, including https://.",
        );
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/businesses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            country_code: countryCode,
            phone,
            email,
            website_url: websiteUrl || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to create your business.",
        );
      }

      setSuccess(
        "Your business has been created successfully.",
      );

      router.replace("/business/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your business.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="create-business-page">
      <section className="create-business-card">
        <div className="create-business-header">
          <span className="create-business-badge">
            IFC BIZGROWTH
          </span>

          <h1>Create your business</h1>

          <p>
            Add your business to IFC BIZGROWTH and
            start building your presence across Africa.
          </p>
        </div>

        {error && (
          <div
            className="create-business-message create-business-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="create-business-message create-business-success"
            role="status"
          >
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="create-business-form"
        >
          <div className="create-business-field">
            <label htmlFor="business-name">
              Business name
            </label>

            <input
              id="business-name"
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              placeholder="Enter your business name"
              autoComplete="organization"
              maxLength={150}
              required
            />
          </div>

          <div className="create-business-field">
            <label htmlFor="business-description">
              Business description
            </label>

            <textarea
              id="business-description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Tell customers what your business does"
              maxLength={5000}
              rows={5}
            />

            <span className="create-business-help">
              A clear description helps customers
              understand your business.
            </span>
          </div>

          <div className="create-business-field">
            <label htmlFor="business-country">
              Business country
            </label>

            <select
              id="business-country"
              value={form.country_code}
              onChange={(event) =>
                updateField(
                  "country_code",
                  event.target.value,
                )
              }
              disabled={loadingCountries}
              required
            >
              <option value="">
                {loadingCountries
                  ? "Loading countries..."
                  : "Select your country"}
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

            <span className="create-business-help">
              Countries are loaded from the IFC
              BIZGROWTH database.
            </span>
          </div>

          <div className="create-business-grid">
            <div className="create-business-field">
              <label htmlFor="business-phone">
                Phone number
              </label>

              <input
                id="business-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value,
                  )
                }
                placeholder="Business phone number"
                autoComplete="tel"
                maxLength={50}
              />
            </div>

            <div className="create-business-field">
              <label htmlFor="business-email">
                Business email
              </label>

              <input
                id="business-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value,
                  )
                }
                placeholder="Business email"
                autoComplete="email"
                maxLength={255}
              />
            </div>
          </div>

          <div className="create-business-field">
            <label htmlFor="business-website">
              Website
              <span className="optional-label">
                Optional
              </span>
            </label>

            <input
              id="business-website"
              type="url"
              value={form.website_url}
              onChange={(event) =>
                updateField(
                  "website_url",
                  event.target.value,
                )
              }
              placeholder="https://example.com"
              autoComplete="url"
              maxLength={500}
            />

            <span className="create-business-help">
              Don't have a website? That's completely
              fine. You can leave this empty.
            </span>
          </div>

          <button
            type="submit"
            className="create-business-submit"
            disabled={
              submitting ||
              loadingCountries ||
              countries.length === 0
            }
          >
            {submitting
              ? "Creating business..."
              : "Create business"}
          </button>
        </form>

        <div className="create-business-footer">
          <p>
            You can add products, services, social
            links, locations and more after creating
            your business.
          </p>
        </div>
      </section>
    </main>
  );
  }
