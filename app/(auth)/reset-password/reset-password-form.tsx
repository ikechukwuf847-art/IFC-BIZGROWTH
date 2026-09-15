"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        cleanEmail,
        cleanOtp,
        password
      );

      if (!response) {
        throw new Error(
          "Unable to reset your password. Please try again."
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.replace(
          `/login?reset=1&email=${encodeURIComponent(cleanEmail)}`
        );
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to reset your password. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="auth-page">
        <section className="auth-section">
          <div className="auth-container">
            <div className="auth-card reset-password-card">
              <div className="auth-card-header">
                <Link href="/" className="auth-brand">
                  IFC <span>BIZGROWTH</span>
                </Link>
              </div>

              <div className="reset-success">
                <div className="reset-success-icon">
                  ✓
                </div>

                <h1>Password reset successful</h1>

                <p>
                  Your password has been changed successfully.
                  Redirecting you to login...
                </p>

                <span className="auth-spinner auth-spinner-blue" />
              </div>
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

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card reset-password-card">
            <div className="auth-card-header">
              <Link href="/" className="auth-brand">
                IFC <span>BIZGROWTH</span>
              </Link>

              <div className="auth-heading">
                <h1>Reset your password</h1>

                <p>
                  Enter the verification code sent to your
                  email and choose a new password.
                </p>
              </div>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                <span className="auth-message-icon">!</span>
                <p>{error}</p>
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="reset-email">
                  Email address
                </label>

                <input
                  id="reset-email"
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
                <label htmlFor="reset-otp">
                  Verification code
                </label>

                <input
                  id="reset-otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6);

                    setOtp(value);
                  }}
                  disabled={loading}
                  required
                />

                <span className="form-help">
                  Enter the 6-digit code sent to your email.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="new-password">
                  New password
                </label>

                <div className="password-field">
                  <input
                    id="new-password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Create a new password"
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
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm-new-password">
                  Confirm new password
                </label>

                <div className="password-field">
                  <input
                    id="confirm-new-password"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    disabled={loading}
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
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
                    Resetting password...
                  </>
                ) : (
                  "Reset password"
                )}
              </button>
            </form>

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
              Your verification code can only be used within
              its valid security period.
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
