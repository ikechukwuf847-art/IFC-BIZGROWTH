"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./delete-account.css";

export default function DeleteAccountPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmation, setConfirmation] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);

async function handleDelete(event: FormEvent<HTMLFormElement>) {
event.preventDefault();
setError("");

if (confirmation !== "DELETE") {
  setError('Type DELETE exactly to confirm account deletion.');
  return;
}

if (!password) {
  setError("Enter your password to continue.");
  return;
}

const confirmed = window.confirm(
  "Are you absolutely sure? Your account deletion cannot be undone.",
);

if (!confirmed) return;

setLoading(true);

try {
  const supabase = createSupabaseBrowserClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setError("Please sign in before requesting account deletion.");
    setLoading(false);
    return;
  }

  if (email.trim().toLowerCase() !== user.email?.toLowerCase()) {
    setError("Enter the email address associated with your account.");
    setLoading(false);
    return;
  }

  const response = await fetch("/api/account/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      password,
      confirm: "DELETE",
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    setError(
      result?.error ||
        "We couldn't complete your account deletion. Please try again or contact support.",
    );
    setLoading(false);
    return;
  }

  setSuccess(true);
  setPassword("");

  // The account is permanently deleted. Clear the local session.
  await supabase.auth.signOut();

  router.replace("/account/deleted");
} catch {
  setError(
    "A connection error occurred. Check your internet connection and try again.",
  );
  setLoading(false);
}

}

if (success) {
return (
<main className="delete-account-page">
<section className="delete-account-card">
<div className="delete-account-success-icon" aria-hidden="true">
✓
</div>

      <h1>Account deletion completed</h1>

      <p>
        Your account has been permanently deleted from IFC BIZGROWTH.
      </p>
    </section>
  </main>
);

}

return (
<main className="delete-account-page">
<section className="delete-account-card">
<a className="delete-account-brand" href="/">
<span className="delete-account-brand-mark">IFC</span>
<span>
<strong>BIZGROWTH</strong>
<small>Building Digital Bridges</small>
</span>
</a>

    <div className="delete-account-warning-icon" aria-hidden="true">
      !
    </div>

    <p className="delete-account-eyebrow">ACCOUNT MANAGEMENT</p>

    <h1>Delete your account</h1>

    <p className="delete-account-description">
      We're sorry to see you go. You can request permanent deletion of
      your IFC BIZGROWTH account and associated personal information.
    </p>

    <div className="delete-account-warning">
      <strong>This action is permanent.</strong>
      <p>
        You may lose access to your profile, business information, and
        associated account data. Some financial or transaction records
        may need to be retained where legally required.
      </p>
    </div>

    <form onSubmit={handleDelete} className="delete-account-form">
      <label htmlFor="delete-account-email">
        Account email address
      </label>

      <input
        id="delete-account-email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Enter your account email"
        required
      />

      <label htmlFor="delete-account-password">
        Confirm your password
      </label>

      <div className="delete-account-password-field">
        <input
          id="delete-account-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
        />

        <button
          type="button"
          className="delete-account-show-password"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <label htmlFor="delete-account-confirmation">
        Type <strong>DELETE</strong> to confirm
      </label>

      <input
        id="delete-account-confirmation"
        type="text"
        autoComplete="off"
        value={confirmation}
        onChange={(event) => setConfirmation(event.target.value)}
        placeholder="Type DELETE"
        required
      />

      {error && (
        <div className="delete-account-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="delete-account-submit"
        disabled={loading}
      >
        {loading ? "Processing request..." : "Permanently delete account"}
      </button>
    </form>

    <a className="delete-account-cancel" href="/business/settings">
      Cancel and return to settings
    </a>

    <p className="delete-account-help">
      Need help? Contact{" "}
      <a href="mailto:contactus@ifcbridgelab.com">
        contactus@ifcbridgelab.com
      </a>
    </p>

    <p className="delete-account-footer">
      IFC BIZGROWTH · IFC Bridge Lab
    </p>
  </section>
</main>

);
}
