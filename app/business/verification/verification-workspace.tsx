"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Business = {
  id: string;
  name: string;
  status: string;
  verification_status: string | null;
};

type Verification = {
  id: string;
  business_id: string;
  submitted_by: string | null;
  business_name: string | null;
  registration_number: string | null;
  registration_country: string | null;
  verification_type: string | null;
  document_urls: string[] | null;
  notes: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  business: Business;
  initialVerification: Verification | null;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return "Verified";
    case "pending":
      return "Pending review";
    case "under_review":
      return "Under review";
    case "rejected":
      return "Rejected";
    case "needs_more_information":
      return "More information required";
    default:
      return "Not submitted";
  }
}

function statusClass(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return "is-approved";
    case "pending":
    case "under_review":
      return "is-pending";
    case "rejected":
    case "needs_more_information":
      return "is-rejected";
    default:
      return "is-neutral";
  }
}

export default function VerificationWorkspace({
  business,
  initialVerification,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [verification, setVerification] =
    useState<Verification | null>(initialVerification);

  const [businessName, setBusinessName] = useState(
    initialVerification?.business_name || business.name
  );
  const [registrationNumber, setRegistrationNumber] = useState(
    initialVerification?.registration_number || ""
  );
  const [registrationCountry, setRegistrationCountry] = useState(
    initialVerification?.registration_country || "NG"
  );
  const [verificationType, setVerificationType] = useState(
    initialVerification?.verification_type || "business_registration"
  );
  const [notes, setNotes] = useState(
    initialVerification?.notes || ""
  );

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const status = verification?.status || business.verification_status;

  const locked = useMemo(
    () =>
      status === "approved" ||
      status === "pending" ||
      status === "under_review",
    [status]
  );

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    setError("");
    setMessage("");

    const selected = Array.from(event.target.files || []);

    if (!selected.length) return;

    if (selected.some((file) => file.size > MAX_FILE_SIZE)) {
      setError("Each document must be 10MB or smaller.");
      event.target.value = "";
      return;
    }

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (selected.some((file) => !allowed.includes(file.type))) {
      setError("Upload PDF, JPG, PNG, or WebP documents only.");
      event.target.value = "";
      return;
    }

    setFiles(selected);
  }

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!businessName.trim()) {
      setError("Business name is required.");
      return;
    }

    if (!registrationNumber.trim()) {
      setError("Registration number is required.");
      return;
    }

    if (!files.length && !verification?.document_urls?.length) {
      setError("Please upload at least one verification document.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const documentPaths: string[] = [];

      for (const file of files) {
        const extension =
          file.name.split(".").pop()?.toLowerCase() || "file";

        const safeName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9-_]/g, "-")
          .slice(0, 80);

        const path = `${business.id}/${Date.now()}-${safeName}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("business-verification")
          .upload(path, file, {
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) {
          throw uploadError;
        }

        documentPaths.push(path);
      }

      const {
        data: sessionData,
      } = await supabase.auth.getSession();

      const accessToken =
        sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const functionUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/submit-business-verification`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          business_id: business.id,
          business_name: businessName.trim(),
          registration_number: registrationNumber.trim(),
          registration_country: registrationCountry,
          verification_type: verificationType,
          document_urls: documentPaths,
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            result?.message ||
            "Verification submission failed."
        );
      }

      const returnedVerification =
        result?.verification || result?.data || null;

      if (returnedVerification) {
        setVerification(returnedVerification);
      }

      setFiles([]);
      setMessage(
        "Your verification request has been submitted successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit verification."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="verification-container">
      <header className="verification-header">
        <div>
          <span className="verification-eyebrow">
            Business verification
          </span>

          <h1>Verify your business</h1>

          <p>
            Submit your business registration details and supporting
            documents for review.
          </p>
        </div>

        <span
          className={`verification-status ${statusClass(status)}`}
        >
          <span className="verification-status-dot" />
          {statusLabel(status)}
        </span>
      </header>

      {message && (
        <div className="verification-alert success">
          <span>✓</span>
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="verification-alert error">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {status === "approved" && (
        <section className="verification-success-card">
          <div className="verification-success-icon">✓</div>

          <div>
            <h2>Your business is verified</h2>
            <p>
              Your verification has been approved. Your business can
              display its verified status where applicable on IFC
              BIZGROWTH.
            </p>
          </div>
        </section>
      )}

      {status === "rejected" &&
        verification?.rejection_reason && (
          <section className="verification-review-card rejection">
            <span className="review-card-icon">!</span>

            <div>
              <h2>Verification was not approved</h2>
              <p>{verification.rejection_reason}</p>
              <small>
                You can review your information and submit again.
              </small>
            </div>
          </section>
        )}

      {status === "needs_more_information" && (
        <section className="verification-review-card">
          <span className="review-card-icon">i</span>

          <div>
            <h2>More information is required</h2>
            <p>
              Please update the information below and provide the
              requested documents before submitting again.
            </p>
          </div>
        </section>
      )}

      <div className="verification-grid">
        <section className="verification-card verification-form-card">
          <div className="card-heading">
            <div>
              <span className="card-number">01</span>
              <h2>Business information</h2>
            </div>

            <p>
              Use the information shown on your official business
              registration documents.
            </p>
          </div>

          <form onSubmit={submitVerification}>
            <div className="form-grid">
              <label className="form-field full">
                <span>Business name</span>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={locked || submitting}
                  placeholder="Registered business name"
                />
              </label>

              <label className="form-field">
                <span>Registration number</span>
                <input
                  value={registrationNumber}
                  onChange={(e) =>
                    setRegistrationNumber(e.target.value)
                  }
                  disabled={locked || submitting}
                  placeholder="e.g. RC123456"
                />
              </label>

              <label className="form-field">
                <span>Registration country</span>
                <select
                  value={registrationCountry}
                  onChange={(e) =>
                    setRegistrationCountry(e.target.value)
                  }
                  disabled={locked || submitting}
                >
                  <option value="NG">Nigeria</option>
                  <option value="GH">Ghana</option>
                  <option value="ZA">South Africa</option>
                  <option value="CI">Côte d’Ivoire</option>
                  <option value="KE">Kenya</option>
                  <option value="EG">Egypt</option>
                  <option value="TZ">Tanzania</option>
                  <option value="UG">Uganda</option>
                  <option value="RW">Rwanda</option>
                </select>
              </label>

              <label className="form-field full">
                <span>Verification type</span>
                <select
                  value={verificationType}
                  onChange={(e) =>
                    setVerificationType(e.target.value)
                  }
                  disabled={locked || submitting}
                >
                  <option value="business_registration">
                    Business registration
                  </option>
                  <option value="company_registration">
                    Company registration
                  </option>
                  <option value="other">
                    Other official business verification
                  </option>
                </select>
              </label>

              <label className="form-field full">
                <span>Additional information</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={locked || submitting}
                  placeholder="Add any information that may help our verification team."
                  rows={5}
                />
              </label>
            </div>

            <div className="document-section">
              <div className="document-heading">
                <div>
                  <span className="card-number">02</span>
                  <h2>Verification documents</h2>
                </div>

                <p>
                  Upload official documents that support your business
                  registration details.
                </p>
              </div>

              <label
                className={`upload-box ${
                  locked ? "is-disabled" : ""
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  multiple
                  onChange={handleFiles}
                  disabled={locked || submitting}
                />

                <span className="upload-icon">↑</span>

                <strong>
                  {files.length
                    ? `${files.length} file${
                        files.length > 1 ? "s" : ""
                      } selected`
                    : "Choose verification documents"}
                </strong>

                <small>
                  PDF, JPG, PNG or WebP · Maximum 10MB per file
                </small>
              </label>

              {files.length > 0 && (
                <div className="selected-files">
                  {files.map((file) => (
                    <div
                      className="selected-file"
                      key={`${file.name}-${file.size}`}
                    >
                      <span className="file-icon">DOC</span>

                      <div>
                        <strong>{file.name}</strong>
                        <small>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {verification?.document_urls?.length ? (
                <div className="existing-documents">
                  <span>
                    Previously submitted documents:{" "}
                    {verification.document_urls.length}
                  </span>
                </div>
              ) : null}
            </div>

            {!locked && (
              <button
                className="verification-submit"
                type="submit"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit for verification"}
              </button>
            )}
          </form>
        </section>

        <aside className="verification-side">
          <section className="verification-card requirements-card">
            <span className="side-icon">✓</span>
            <h2>Before you submit</h2>

            <ul>
              <li>
                Make sure the business name matches your official
                registration document.
              </li>
              <li>
                Enter the correct registration number.
              </li>
              <li>
                Upload a clear, readable official document.
              </li>
              <li>
                Make sure the information you provide is accurate.
              </li>
            </ul>
          </section>

          <section className="verification-card process-card">
            <span className="side-icon">01</span>

            <h2>What happens next?</h2>

            <div className="process-step">
              <span>1</span>
              <div>
                <strong>Submission</strong>
                <p>
                  Your information and documents are securely
                  submitted.
                </p>
              </div>
            </div>

            <div className="process-step">
              <span>2</span>
              <div>
                <strong>Review</strong>
                <p>
                  Our verification team reviews the submitted
                  information.
                </p>
              </div>
            </div>

            <div className="process-step">
              <span>3</span>
              <div>
                <strong>Decision</strong>
                <p>
                  Your verification status is updated after review.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
  }
