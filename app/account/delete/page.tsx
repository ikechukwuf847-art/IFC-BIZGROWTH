"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "./delete-account.css";

type DeletionStep = "password" | "otp";

export default function DeleteAccountPage() {
  const router = useRouter();

  const [step, setStep] = useState<DeletionStep>("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();

  async function callDeletionFunction(
    body: Record<string, string>,
  ): Promise<{ success?: boolean; message?: string; error?: string }> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error(
        "Your session has expired. Please sign in again.",
      );
    }

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!projectUrl || !publishableKey) {
      throw new Error(
        "The account deletion service is not configured.",
      );
    }

    const response = await fetch(
      `${projectUrl}/functions/v1/delete-account`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: publishableKey,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.error ||
          result?.message ||
          "The request could not be completed. Please try again.",
      );
    }

    return result;
  }

  async function handleRequestOtp(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!password) {
      setErrorMessage("Enter your current password.");
      return;
    }

    if (!confirmed) {
      setErrorMessage(
        "Please confirm that you understand the consequences of deleting your account.",
      );
      return;
    }

    setLoading(true);

    try {
      const result = await callDeletionFunction({
        action: "request",
        password,
      });

      setStep("otp");

      setSuccessMessage(
        result.message ||
          "A verification code has been sent to your email.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to request the verification code.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDeletion(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setErrorMessage("Enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const result = await callDeletionFunction({
        action: "confirm",
        otp,
      });

      if (!result.success) {
        throw new Error(
          result.error || "Account deletion was not completed.",
        );
      }

      /*
       * The backend has deleted the account.
       * Clear the browser's local Supabase session.
       * Do not prevent navigation if signOut returns an error because
       * the account has already been deleted on the server.
       */
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        // Continue to the completion page.
      }

      router.replace("/account/deleted");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete account deletion.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setErrorMessage("");
    setSuccessMessage("");
    setResending(true);

    try {
      const result = await callDeletionFunction({
        action: "request",
        password,
      });

      setOtp("");

      setSuccessMessage(
        result.message ||
          "A new verification code has been sent. Your previous code is no longer valid.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend the verification code.",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="delete-account-page">
      <div className="delete-account-container">
        <Link href="/" className="delete-account-brand">
          <span className="delete-account-brand-mark">IFC</span>

          <span>
            <strong>BIZGROWTH</strong>
            <small>Account security</small>
          </span>
        </Link>

        <section className="delete-account-card">
          <div className="delete-account-warning-icon" aria-hidden="true">
            !
          </div>

          <div className="delete-account-heading">
            <p className="delete-account-eyebrow">
              ACCOUNT MANAGEMENT
            </p>

            <h1>Delete your account</h1>

            <p>
              We&apos;re sorry to see you go. Please review the
              information below before continuing.
            </p>
          </div>

          <div className="delete-account-consequences">
            <h2>What happens when you delete your account?</h2>

            <ul>
              <li>
                Your IFC BIZGROWTH account will be permanently deleted.
              </li>

              <li>
                Businesses you own and their associated products,
                services, promotions, and analytics will be deleted.
              </li>

              <li>
                Other businesses where you are only a member will not
                be deleted by this request.
              </li>

              <li>
                Certain financial and other records may be retained
                where required or permitted.
              </li>

              <li>
                This action cannot be undone.
              </li>
            </ul>
          </div>

          {errorMessage && (
            <div className="delete-account-alert delete-account-alert-error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div
              className="delete-account-alert delete-account-alert-success"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {step === "password" ? (
            <form
              className="delete-account-form"
              onSubmit={handleRequestOtp}
            >
              <div className="delete-account-field">
                <label htmlFor="current-password">
                  Current password
                </label>

                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your current password"
                  required
                  disabled={loading}
                />
              </div>

              <label className="delete-account-checkbox">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) =>
                    setConfirmed(event.target.checked)
                  }
                  disabled={loading}
                />

                <span>
                  I understand that deleting my account and owned
                  businesses is permanent.
                </span>
              </label>

              <button
                type="submit"
                className="delete-account-button delete-account-button-danger"
                disabled={loading || !confirmed}
              >
                {loading
                  ? "Verifying password..."
                  : "Continue to verification"}
              </button>
            </form>
          ) : (
            <form
              className="delete-account-form"
              onSubmit={handleConfirmDeletion}
            >
              <div className="delete-account-otp-heading">
                <h2>Verify your email</h2>

                <p>
                  Enter the six-digit verification code sent to your
                  account email. The code expires after 10 minutes.
                </p>
              </div>

              <div className="delete-account-field">
                <label htmlFor="deletion-otp">
                  Verification code
                </label>

                <input
                  id="deletion-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6),
                    )
                  }
                  placeholder="000000"
                  required
                  disabled={loading}
                  aria-describedby="deletion-otp-help"
                />

                <small id="deletion-otp-help">
                  You have a maximum of five incorrect attempts.
                </small>
              </div>

              <button
                type="submit"
                className="delete-account-button delete-account-button-danger"
                disabled={loading || otp.length !== 6}
              >
                {loading
                  ? "Deleting account..."
                  : "Permanently delete my account"}
              </button>

              <button
                type="button"
                className="delete-account-button delete-account-button-secondary"
                onClick={handleResendOtp}
                disabled={loading || resending || !password}
              >
                {resending
                  ? "Sending new code..."
                  : "Resend verification code"}
              </button>

              <button
                type="button"
                className="delete-account-back-button"
                onClick={() => {
                  setStep("password");
                  setOtp("");
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={loading || resending}
              >
                Back
              </button>
            </form>
          )}

          <div className="delete-account-footer">
            <Link href="/business/settings">
              Return to settings
            </Link>

            <span aria-hidden="true">·</span>

            <Link href="/contact">Contact support</Link>
          </div>
        </section>

        <p className="delete-account-security-note">
          Your account security matters to us. Your password and
          verification code are sent only to the account-deletion
          endpoint for verification.
        </p>
      </div>
    </main>
  );
}
