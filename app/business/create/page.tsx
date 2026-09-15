"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBusinessPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [countryCode, setCountryCode] =
    useState("NG");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [websiteUrl, setWebsiteUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError(
        "Business name must be at least 2 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      const response =
        await fetch("/api/businesses", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,

            description:
              description.trim() || null,

            country_code:
              countryCode.trim().toUpperCase(),

            email:
              email.trim() || null,

            phone:
              phone.trim() || null,

            website_url:
              websiteUrl.trim() || null,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create your business.",
        );
      }

      router.replace(
        "/business/dashboard",
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your business.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="business-create-page">
      <section className="business-create-section">
        <div className="business-create-container">
          <div className="business-create-header">
            <span className="business-create-eyebrow">
              IFC BIZGROWTH
            </span>

            <h1>
              Create your business profile
            </h1>

            <p>
              Start building your business
              presence on IFC BIZGROWTH.
            </p>
          </div>

          <form
            className="business-create-card"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="business-name">
                Business name
              </label>

              <input
                id="business-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Your business name"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Business description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Tell customers what your business does"
                rows={5}
                disabled={loading}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="country">
                  Country
                </label>

                <select
                  id="country"
                  value={countryCode}
                  onChange={(event) =>
                    setCountryCode(
                      event.target.value,
                    )
                  }
                  disabled={loading}
                >
                  <option value="NG">
                    Nigeria
                  </option>

                  <option value="GH">
                    Ghana
                  </option>

                  <option value="ZA">
                    South Africa
                  </option>

                  <option value="KE">
                    Kenya
                  </option>

                  <option value="CI">
                    Côte d&apos;Ivoire
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+234..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
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
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="website">
                Website
              </label>

              <input
                id="website"
                type="url"
                value={websiteUrl}
                onChange={(event) =>
                  setWebsiteUrl(
                    event.target.value,
                  )
                }
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating business..."
                : "Create business"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
