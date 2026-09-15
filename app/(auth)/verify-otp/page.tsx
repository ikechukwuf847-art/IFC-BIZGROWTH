"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/lib/api/auth";

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email")?.trim().toLowerCase() ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [secondsLeft, setSecondsLeft] = useState(60);

  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * If someone opens /verify-otp without an email,
   * send them back to signup instead of allowing
   * an incomplete verification request.
   */
  useEffect(() => {
    if (!email) {
      router.replace("/signup");
    }
  }, [email, router]);

  /*
   * Resend cooldown.
   */
  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  function handleOtpChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    setOtp(value);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Your verification session is incomplete. Please sign up again.",
      );
      return;
    }

    if (otp.length !== OTP_LENGTH) {
      setError("Enter the 6-digit verification code.");
      inputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       *
       * This calls the real verify-otp Edge Function.
       *
       * The frontend NEVER decides whether the OTP is valid.
       */
      await verifyOtp(email, otp);

      /*
       * Verification succeeded on the backend.
       *
       * Send the user to login rather than pretending
       * that the browser has authenticated them.
       */
      router.replace(
        `/login?verified=1&email=${encodeURIComponent(email)}`,
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to verify your account. Please try again.",
        );
      }

      setOtp("");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email || secondsLeft > 0 || resending) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      /*
       * Real resend-otp Edge Function.
       */
      await resendOtp(email);

      setOtp("");
      setSecondsLeft(60);

      setSuccess(
        "A new verification code has been sent to your email.",
      );

      inputRef.current?.focus();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to resend the verification code. Please try again.",
        );
      }
    } finally {
      setResending(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <main className="auth-page">
      {/* HEADER */}
      <header className="auth-header">
        <div className="auth-header-inner">
          <Link href="/" className="site-logo">
            IFC <span>BIZGROWTH</span>
          </Link>

          <div className="auth-header-right">
            <span>Already have an account?</span>

            <Link
              href="/login"
              className="auth-login-link"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <section className="auth-section">
        <div className="otp-container">
          {/* INTRO */}
          <div className="otp-intro">
            <div className="otp-icon">
              ✉
            </div>

            <span className="auth-eyebrow">
              ACCOUNT VERIFICATION
            </span>

            <h1>
              Verify your
              <br />
              <span>email address.</span>
            </h1>

            <p>
              We sent a 6-digit verification code to the email
              address you used to create your IFC BIZGROWTH
              account.
            </p>

            <div className="otp-email">
              <span>Email</span>

              <strong>{email}</strong>
            </div>
          </div>

          {/* OTP CARD */}
          <div className="auth-card otp-card">
            <div className="auth-card-header">
              <h2>Enter verification code</h2>

              <p>
                Enter the 6-digit code sent to your email.
              </p>
            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
                aria-live="polite"
              >
                <span>!</span>

                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                className="auth-success"
                role="status"
                aria-live="polite"
              >
                <span>✓</span>

                <p>{success}</p>
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="form-field">
                <label htmlFor="otp">
                  Verification code
                </label>

                <input
                  ref={inputRef}
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={OTP_LENGTH}
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  disabled={loading}
                  autoFocus
                  required
                  aria-describedby="otp-help"
                  className="otp-input"
                />

                <small id="otp-help">
                  The code expires after the verification period.
                </small>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={
                  loading ||
                  resending ||
                  otp.length !== OTP_LENGTH
                }
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <span>→</span>
                  </>
                )}
              </button>
            </form>

            {/* RESEND */}
            <div className="otp-resend">
              <p>
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={
                  secondsLeft > 0 ||
                  resending ||
                  loading
                }
                className="otp-resend-button"
              >
                {resending
                  ? "Sending..."
                  : secondsLeft > 0
                    ? `Resend code in ${secondsLeft}s`
                    : "Resend code"}
              </button>
            </div>

            {/* CHANGE EMAIL */}
            <div className="auth-divider">
              <span>Wrong email?</span>
            </div>

            <Link
              href="/signup"
              className="auth-secondary-button"
            >
              Create an account with another email
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="auth-footer">
        <p>
          © {new Date().getFullYear()} IFC BIZGROWTH.
          All rights reserved.
        </p>

        <p>
          A product of IFC Bridge Lab
        </p>
      </footer>
    </main>
  );
}
