"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/business/dashboard";
  const verified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(
    verified
      ? "Your email has been verified. You can now log in."
      : ""
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(cleanEmail, password);

      if (!response) {
        throw new Error("Login failed. Please try again.");
      }

      router.replace(next);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to log in. Please check your details and try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card login-card">
            <div className="auth-card-header">
              <Link href="/" className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </Link>

              <div className="auth-heading">
                <h1>Welcome back</h1>
                <p>
                  Log in to manage your business and continue
                  growing with IFC BIZGROWTH.
                </p>
              </div>
            </div>

            {success && (
              <div className="auth-success" role="status">
                <span className="auth-message-icon">✓</span>
                <p>{success}</p>
              </div>
            )}

            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-message-icon">!</span>
                <p>{error}</p>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="form-link"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>New to IFC BIZGROWTH?</span>
            </div>

            <Link
              href="/signup"
              className="auth-secondary-button"
            >
              Create an account
            </Link>

            <p className="auth-security-note">
              Your account is protected by secure authentication.
            </p>
          </div>

          <div className="auth-bottom">
            <Link href="/">
              Back to IFC BIZGROWTH
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
