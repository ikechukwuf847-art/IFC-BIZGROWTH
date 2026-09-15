"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { forgotPassword } from "@/lib/api/auth";

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(cleanEmail);

      if (!response) {
        throw new Error(
          "Unable to process your request. Please try again."
        );
      }

      /*
       * The backend intentionally uses a generic response
       * so that users cannot discover whether an email belongs
       * to an IFC BIZGROWTH account.
       */

      setSuccess(
        "If an account exists with this email, we have sent a verification code. Check your inbox and continue to reset your password."
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to process your request. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card forgot-password-card">
            <div className="auth-card-header">
              <Link href="/" className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </Link>

              <div className="auth-heading">
                <h1>Forgot your password?</h1>

                <p>
                  Enter the email address connected to your
                  account and we&apos;ll help you reset your
                  password.
                </p>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-message-icon">!</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="auth-success" role="status">
                <span className="auth-message-icon">✓</span>
                <p>{success}</p>
              </div>
            )}

            {!success && (
              <form
                className="auth-form"
                onSubmit={handleSubmit}
              >
                <div className="form-group">
                  <label htmlFor="forgot-email">
                    Email address
                  </label>

                  <input
                    id="forgot-email"
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

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="auth-spinner" />
                      Sending code...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </button>
              </form>
            )}

            {success && (
              <Link
                href={`/reset-password?email=${encodeURIComponent(
                  email.trim().toLowerCase()
                )}`}
                className="auth-submit auth-submit-link"
              >
                Continue to password reset
              </Link>
            )}

            <div className="auth-divider">
              <span>Remember your password?</span>
            </div>

            <Link
              href="/login"
              className="auth-secondary-button"
            >
              Back to login
            </Link>

            <p className="auth-security-note">
              For your security, we never reveal whether an
              email address is registered with IFC BIZGROWTH.
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
