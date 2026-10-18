"use client";

import Link from "next/link";
import "./deleted.css";

export default function AccountDeletedPage() {
  return (
    <main className="account-deleted-page">
      <section
        className="account-deleted-card"
        aria-labelledby="account-deleted-title"
      >
        <div className="account-deleted-icon" aria-hidden="true">
          ✓
        </div>

        <p className="account-deleted-eyebrow">
          IFC BIZGROWTH
        </p>

        <h1 id="account-deleted-title">
          Account deletion submitted
        </h1>

        <p className="account-deleted-description">
          Your account-deletion request has been processed successfully.
          You have been signed out.
        </p>

        <div className="account-deleted-notice">
          If you need assistance with retained financial records or
          other information, please contact our support team.
        </div>

        <Link
          href="/"
          className="account-deleted-home-button"
        >
          Return to homepage
        </Link>
      </section>
    </main>
  );
        }
