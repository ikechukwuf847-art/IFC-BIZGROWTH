"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/api/auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const PENDING_REFERRAL_KEY =
  "ifc_bizgrowth_pending_agent_referral";

type PendingReferral = {
  email: string;
  code: string;
};

type ReferralIntent = {
  id: string;
  referral_code: string;
};

const supabase = createSupabaseBrowserClient();

async function getPendingReferralCode(
  email: string,
): Promise<string | null> {
  const stored = sessionStorage.getItem(PENDING_REFERRAL_KEY);

  if (!stored) return null;

  try {
    const pending: PendingReferral = JSON.parse(stored);

    if (
      pending.email !== email.trim().toLowerCase() ||
      !pending.code
    ) {
      return null;
    }

    return pending.code.trim().toUpperCase();
  } catch {
    return null;
  }
}

async function capturePendingReferralCode(
  email: string,
): Promise<void> {
  const referralCode = await getPendingReferralCode(email);

  if (!referralCode) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "Unable to verify your account before capturing the referral.",
    );
  }

  // Check whether this account already has a referral intent.
  const { data: existingIntent, error: intentError } =
    await supabase
      .from("agent_referral_intents")
      .select("id, referral_code")
      .eq("user_id", user.id)
      .maybeSingle();

  if (intentError) {
    throw new Error(
      "Unable to check your existing referral. Please try again.",
    );
  }

  if (existingIntent) {
    if (
      existingIntent.referral_code.trim().toUpperCase() ===
      referralCode
    ) {
      sessionStorage.removeItem(PENDING_REFERRAL_KEY);
      return;
    }

    throw new Error(
      "A different agent referral code has already been recorded for this account.",
    );
  }

  // Capture the referral against the authenticated account.
  const { error: captureError } = await supabase.rpc(
    "capture_agent_referral_code",
    {
      p_referral_code: referralCode,
    },
  );

  if (captureError) {
    // Check again in case another request captured it concurrently.
    const { data: confirmedIntent, error: confirmError } =
      await supabase
        .from("agent_referral_intents")
        .select("id, referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

    if (
      !confirmError &&
      confirmedIntent &&
      confirmedIntent.referral_code.trim().toUpperCase() ===
        referralCode
    ) {
      sessionStorage.removeItem(PENDING_REFERRAL_KEY);
      return;
    }

    if (confirmedIntent) {
      throw new Error(
        "A different agent referral code has already been recorded for this account.",
      );
    }

    throw new Error(
      captureError.message ||
        "Unable to capture your agent referral code. Please try again.",
    );
  }

  // Only clear after successful capture.
  sessionStorage.removeItem(PENDING_REFERRAL_KEY);
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next =
    searchParams.get("next") || "/business/dashboard";

  const verified =
    searchParams.get("verified") === "1";

  const reset =
    searchParams.get("reset") === "1";

  const emailFromUrl =
    searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState(
    verified
      ? "Your email has been verified. You can now log in."
      : reset
        ? "Your password has been reset. You can now log in."
        : "",
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(cleanEmail, password);

      const accessToken =
        response.session?.access_token;

      const refreshToken =
        response.session?.refresh_token;

      if (!accessToken || !refreshToken) {
        throw new Error(
          "Login succeeded, but a secure session could not be created.",
        );
      }

      // Establish the secure Supabase authentication cookies.
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
        }),
      });

      let sessionData: {
        success?: boolean;
        error?: string;
      } = {};

      try {
        sessionData = await sessionResponse.json();
      } catch {
        sessionData = {};
      }

      if (!sessionResponse.ok || !sessionData.success) {
        throw new Error(
          sessionData.error ||
            "Unable to create your secure session.",
        );
      }

      // Capture any pending agent referral after authentication.
      await capturePendingReferralCode(cleanEmail);

      // Preserve the existing destination and navigation behavior.
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-card-header">
              <div className="auth-brand">
                IFC BIZGROWTH
              </div>

              <h1>Welcome back</h1>

              <p>
                Log in to manage your
                business on IFC BIZGROWTH.
              </p>
            </div>

            {success && (
              <div className="auth-success">
                {success}
              </div>
            )}

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="password-input-wrap">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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
              <span>
                New to IFC BIZGROWTH?
              </span>
            </div>

            <Link
              href="/signup"
              className="auth-secondary-button"
            >
              Create a business account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
    }
