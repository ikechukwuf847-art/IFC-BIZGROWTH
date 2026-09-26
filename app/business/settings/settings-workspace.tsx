"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./settings.css";

type Business = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  country_code: string;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  status: string;
  verification_status: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

type Props = {
  business: Business;
  accountEmail: string;
};

type Section = "business" | "account" | "security";

export default function SettingsWorkspace({
  business,
  accountEmail,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [activeSection, setActiveSection] =
    useState<Section>("business");

  const [businessName, setBusinessName] = useState(business.name);
  const [businessEmail, setBusinessEmail] = useState(business.email ?? "");
  const [phone, setPhone] = useState(business.phone ?? "");
  const [website, setWebsite] = useState(business.website_url ?? "");
  const [description, setDescription] = useState(
    business.description ?? ""
  );
  const [isPublic, setIsPublic] = useState(business.is_public);

  const [savingBusiness, setSavingBusiness] = useState(false);
  const [businessMessage, setBusinessMessage] = useState("");
  const [businessError, setBusinessError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [signingOut, setSigningOut] = useState(false);

  async function saveBusinessSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSavingBusiness(true);
    setBusinessMessage("");
    setBusinessError("");

    const trimmedName = businessName.trim();

    if (!trimmedName) {
      setBusinessError("Business name is required.");
      setSavingBusiness(false);
      return;
    }

    const { error } = await supabase
      .from("businesses")
      .update({
        name: trimmedName,
        email: businessEmail.trim() || null,
        phone: phone.trim() || null,
        website_url: website.trim() || null,
        description: description.trim() || null,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq("id", business.id)
      .eq("owner_id", business.owner_id);

    if (error) {
      setBusinessError(
        error.message || "Unable to save your business settings."
      );
      setSavingBusiness(false);
      return;
    }

    setBusinessMessage("Business settings saved successfully.");
    setSavingBusiness(false);
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      setChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("The passwords do not match.");
      setChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(
        error.message || "Unable to change your password."
      );
      setChangingPassword(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
    setChangingPassword(false);
  }

  async function signOut() {
    setSigningOut(true);

    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  function statusLabel(value: string) {
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  return (
    <main className="settings-page">
      <div className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your business account, visibility, and security.
          </p>
        </div>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "business" ? "active" : ""
            }`}
            onClick={() => setActiveSection("business")}
          >
            <span className="settings-nav-icon">▣</span>
            <span>
              <strong>Business</strong>
              <small>Business information</small>
            </span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "account" ? "active" : ""
            }`}
            onClick={() => setActiveSection("account")}
          >
            <span className="settings-nav-icon">◎</span>
            <span>
              <strong>Account</strong>
              <small>Account details</small>
            </span>
          </button>

          <button
            type="button"
            className={`settings-nav-item ${
              activeSection === "security" ? "active" : ""
            }`}
            onClick={() => setActiveSection("security")}
          >
            <span className="settings-nav-icon">⌑</span>
            <span>
              <strong>Security</strong>
              <small>Password and access</small>
            </span>
          </button>
        </aside>

        <section className="settings-content">
          {activeSection === "business" && (
            <div className="settings-section">
              <div className="settings-section-heading">
                <div>
                  <h2>Business information</h2>
                  <p>
                    Update the information customers see on your
                    business profile.
                  </p>
                </div>
              </div>

              <form
                className="settings-form"
                onSubmit={saveBusinessSettings}
              >
                <div className="settings-field-grid">
                  <label className="settings-field">
                    <span>Business name</span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(event) =>
                        setBusinessName(event.target.value)
                      }
                      maxLength={150}
                      required
                    />
                  </label>

                  <label className="settings-field">
                    <span>Business email</span>
                    <input
                      type="email"
                      value={businessEmail}
                      onChange={(event) =>
                        setBusinessEmail(event.target.value)
                      }
                      maxLength={254}
                    />
                  </label>

                  <label className="settings-field">
                    <span>Business phone</span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      maxLength={40}
                    />
                  </label>

                  <label className="settings-field">
                    <span>Website</span>
                    <input
                      type="url"
                      value={website}
                      onChange={(event) =>
                        setWebsite(event.target.value)
                      }
                      placeholder="https://example.com"
                      maxLength={500}
                    />
                  </label>
                </div>

                <label className="settings-field">
                  <span>Description</span>
                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    rows={6}
                    maxLength={2000}
                    placeholder="Describe your business."
                  />
                  <small className="field-hint">
                    {description.length}/2000 characters
                  </small>
                </label>

                <div className="settings-divider" />

                <div className="visibility-setting">
                  <div>
                    <strong>Public business profile</strong>
                    <p>
                      Allow customers to discover your business
                      through the public IFC BIZGROWTH directory.
                    </p>
                  </div>

                  <button
                    type="button"
                    className={`settings-switch ${
                      isPublic ? "on" : ""
                    }`}
                    aria-pressed={isPublic}
                    onClick={() => setIsPublic((current) => !current)}
                  >
                    <span />
                  </button>
                </div>

                {businessError && (
                  <div className="settings-alert error">
                    {businessError}
                  </div>
                )}

                {businessMessage && (
                  <div className="settings-alert success">
                    {businessMessage}
                  </div>
                )}

                <div className="settings-actions">
                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={savingBusiness}
                  >
                    {savingBusiness ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeSection === "account" && (
            <div className="settings-section">
              <div className="settings-section-heading">
                <div>
                  <h2>Account</h2>
                  <p>
                    Information connected to your IFC BIZGROWTH
                    account.
                  </p>
                </div>
              </div>

              <div className="account-details">
                <div className="account-row">
                  <div>
                    <span className="account-label">
                      Account email
                    </span>
                    <strong>{accountEmail || "Not available"}</strong>
                  </div>
                </div>

                <div className="account-row">
                  <div>
                    <span className="account-label">
                      Business status
                    </span>
                    <strong>{statusLabel(business.status)}</strong>
                  </div>

                  <span className="status-badge">
                    {statusLabel(business.status)}
                  </span>
                </div>

                <div className="account-row">
                  <div>
                    <span className="account-label">
                      Verification status
                    </span>
                    <strong>
                      {statusLabel(business.verification_status)}
                    </strong>
                  </div>

                  <span className="status-badge">
                    {statusLabel(business.verification_status)}
                  </span>
                </div>

                <div className="account-row">
                  <div>
                    <span className="account-label">
                      Country
                    </span>
                    <strong>{business.country_code}</strong>
                  </div>
                </div>
              </div>

              <div className="settings-divider" />

              <div className="signout-box">
                <div>
                  <h3>Sign out</h3>
                  <p>
                    Sign out of your IFC BIZGROWTH business account
                    on this device.
                  </p>
                </div>

                <button
                  type="button"
                  className="settings-secondary-button"
                  onClick={signOut}
                  disabled={signingOut}
                >
                  {signingOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="settings-section">
              <div className="settings-section-heading">
                <div>
                  <h2>Security</h2>
                  <p>
                    Keep your business account protected with a
                    strong password.
                  </p>
                </div>
              </div>

              <form
                className="settings-form security-form"
                onSubmit={changePassword}
              >
                <label className="settings-field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    required
                  />
                </label>

                <label className="settings-field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Enter the password again"
                    required
                  />
                </label>

                {passwordError && (
                  <div className="settings-alert error">
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="settings-alert success">
                    {passwordMessage}
                  </div>
                )}

                <div className="settings-actions">
                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={changingPassword}
                  >
                    {changingPassword
                      ? "Changing password..."
                      : "Change password"}
                  </button>
                </div>
              </form>

              <div className="security-note">
                <strong>Security note</strong>
                <p>
                  Never share your password or verification codes
                  with anyone. IFC BIZGROWTH support will not ask you
                  for your password.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
        }
