"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AdPackage = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency_code: string;
  duration_days: number;
  is_active: boolean;
};

type AdPlacement = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  placement_type: string;
  is_active: boolean;
};

type Campaign = {
  id: string;
  package_id: string | null;
  name: string;
  objective: string;
  budget: number;
  currency_code: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Props = {
  businessId: string;
  businessName: string;
  businessStatus: string;
  packages: AdPackage[];
  placements: AdPlacement[];
  campaigns: Campaign[];
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDateTimeValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);

  return local.toISOString().slice(0, 16);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export default function AdvertisingWorkspace({
  businessId,
  businessName,
  businessStatus,
  packages,
  placements,
  campaigns,
}: Props) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [selectedPackageId, setSelectedPackageId] = useState(
    packages[0]?.id ?? "",
  );

  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("visibility");
  const [startsAt, setStartsAt] = useState(() => {
    const start = new Date();
    start.setMinutes(start.getMinutes() + 30);
    return toLocalDateTimeValue(start);
  });

  const selectedPackage = useMemo(
    () =>
      packages.find(
        (item) => item.id === selectedPackageId,
      ) ?? null,
    [packages, selectedPackageId],
  );

  const calculatedEnd = useMemo(() => {
    if (!selectedPackage || !startsAt) return "";

    const start = new Date(startsAt);

    if (Number.isNaN(start.getTime())) return "";

    return toLocalDateTimeValue(
      addDays(start, selectedPackage.duration_days),
    );
  }, [selectedPackage, startsAt]);

  const [endsAt, setEndsAt] = useState("");

  const effectiveEndsAt = endsAt || calculatedEnd;

  const [activeSection, setActiveSection] =
    useState<"plans" | "campaigns">("plans");

  const [showCampaignForm, setShowCampaignForm] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [payingCampaignId, setPayingCampaignId] =
    useState<string | null>(null);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function choosePackage(packageId: string) {
    setSelectedPackageId(packageId);
    setEndsAt("");
    setShowCampaignForm(true);

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  async function createCampaign(event: React.FormEvent) {
    event.preventDefault();

    setMessage(null);

    if (businessStatus !== "active") {
      setMessage({
        type: "error",
        text: "Your business must be active before you can create an advertising campaign.",
      });
      return;
    }

    if (!selectedPackage) {
      setMessage({
        type: "error",
        text: "Please select an advertising package.",
      });
      return;
    }

    if (!campaignName.trim()) {
      setMessage({
        type: "error",
        text: "Enter a campaign name.",
      });
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(effectiveEndsAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setMessage({
        type: "error",
        text: "Please select valid campaign dates.",
      });
      return;
    }

    if (start <= new Date()) {
      setMessage({
        type: "error",
        text: "Campaign start time must be in the future.",
      });
      return;
    }

    if (end <= start) {
      setMessage({
        type: "error",
        text: "Campaign end time must be after the start time.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      const { data, error } =
        await supabase.functions.invoke(
          "create-ad-campaign",
          {
            body: {
              business_id: businessId,
              package_id: selectedPackage.id,
              name: campaignName.trim(),
              objective,
              budget: Number(selectedPackage.price),
              currency_code:
                selectedPackage.currency_code.toUpperCase(),
              starts_at: start.toISOString(),
              ends_at: end.toISOString(),
            },
          },
        );

      if (error) {
        throw new Error(
          error.message ||
            "Unable to create advertising campaign.",
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to create advertising campaign.",
        );
      }

      const campaign = data.campaign;

      if (!campaign?.id) {
        throw new Error(
          "Campaign was created but no campaign ID was returned.",
        );
      }

      setMessage({
        type: "success",
        text: "Campaign created. Continue to payment to send it for review.",
      });

      setCampaignName("");
      setShowCampaignForm(false);

      router.refresh();

      await startPayment(
        selectedPackage,
        campaign.id,
      );
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the campaign.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function startPayment(
    packageData: AdPackage,
    campaignId: string,
  ) {
    setMessage(null);
    setPayingCampaignId(campaignId);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        router.push("/login");
        return;
      }

      const { data, error } =
        await supabase.functions.invoke(
          "create-payment",
          {
            body: {
              business_id: businessId,
              order_type: "ad_campaign",
              package_id: packageData.id,
              currency_code:
                packageData.currency_code.toUpperCase(),
              description:
                `Advertising campaign payment: ${campaignId}`,
              metadata: {
                campaign_id: campaignId,
                business_name: businessName,
              },
            },
          },
        );

      if (error) {
        throw new Error(
          error.message ||
            "Unable to initialize payment.",
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to initialize payment.",
        );
      }

      const authorizationUrl =
        data?.payment?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Payment was initialized but no checkout URL was returned.",
        );
      }

      window.location.assign(authorizationUrl);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to start payment.",
      });
    } finally {
      setPayingCampaignId(null);
    }
  }

  return (
    <div className="advertising-workspace">
      <div className="advertising-tabs">
        <button
          type="button"
          className={
            activeSection === "plans"
              ? "advertising-tab advertising-tab--active"
              : "advertising-tab"
          }
          onClick={() => setActiveSection("plans")}
        >
          Advertising plans
        </button>

        <button
          type="button"
          className={
            activeSection === "campaigns"
              ? "advertising-tab advertising-tab--active"
              : "advertising-tab"
          }
          onClick={() => setActiveSection("campaigns")}
        >
          My campaigns
          <span>{campaigns.length}</span>
        </button>
      </div>

      {message && (
        <div
          className={`advertising-message advertising-message--${message.type}`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {activeSection === "plans" && (
        <>
          <section className="advertising-section">
            <div className="advertising-section-heading">
              <div>
                <span className="advertising-kicker">
                  PRICING
                </span>
                <h2>Choose your advertising plan</h2>
                <p>
                  Prices, currencies and campaign duration are
                  loaded directly from your advertising packages.
                </p>
              </div>
            </div>

            {packages.length === 0 ? (
              <div className="advertising-empty">
                <div className="advertising-empty-icon">!</div>
                <h3>No advertising plans are available</h3>
                <p>
                  There are currently no active advertising
                  packages configured for your account.
                </p>
              </div>
            ) : (
              <div className="advertising-plans">
                {packages.map((plan, index) => (
                  <article
                    className={`advertising-plan-card ${
                      selectedPackageId === plan.id
                        ? "advertising-plan-card--selected"
                        : ""
                    } ${
                      index === 1
                        ? "advertising-plan-card--featured"
                        : ""
                    }`}
                    key={plan.id}
                  >
                    {index === 1 && (
                      <div className="advertising-plan-badge">
                        Popular
                      </div>
                    )}

                    <div className="advertising-plan-top">
                      <div>
                        <span className="advertising-plan-label">
                          {plan.name}
                        </span>

                        <h3>
                          {formatMoney(
                            Number(plan.price),
                            plan.currency_code,
                          )}
                        </h3>
                      </div>

                      <div className="advertising-plan-duration">
                        {plan.duration_days}
                        <small>days</small>
                      </div>
                    </div>

                    <p className="advertising-plan-description">
                      {plan.description ||
                        `Run an advertising campaign for ${plan.duration_days} days.`}
                    </p>

                    <div className="advertising-plan-details">
                      <div>
                        <span>Budget</span>
                        <strong>
                          {formatMoney(
                            Number(plan.price),
                            plan.currency_code,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Duration</span>
                        <strong>
                          {plan.duration_days} days
                        </strong>
                      </div>

                      <div>
                        <span>Currency</span>
                        <strong>
                          {plan.currency_code}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={
                        selectedPackageId === plan.id
                          ? "advertising-button advertising-button--primary"
                          : "advertising-button advertising-button--secondary"
                      }
                      onClick={() => choosePackage(plan.id)}
                    >
                      {selectedPackageId === plan.id
                        ? "Selected plan"
                        : "Choose this plan"}
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="advertising-section advertising-section--light">
            <div className="advertising-section-heading">
              <div>
                <span className="advertising-kicker">
                  WHERE YOUR AD CAN APPEAR
                </span>
                <h2>Available ad placements</h2>
                <p>
                  These placements are managed from your IFC
                  BIZGROWTH advertising system.
                </p>
              </div>
            </div>

            {placements.length === 0 ? (
              <div className="advertising-empty advertising-empty--small">
                <h3>No placements available</h3>
                <p>
                  Advertising placements have not been activated
                  yet.
                </p>
              </div>
            ) : (
              <div className="advertising-placement-grid">
                {placements.map((placement) => (
                  <div
                    className="advertising-placement-card"
                    key={placement.id}
                  >
                    <div className="advertising-placement-icon">
                      AD
                    </div>

                    <div>
                      <h3>{placement.name}</h3>

                      <span>
                        {placement.placement_type}
                      </span>

                      {placement.description && (
                        <p>{placement.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {showCampaignForm && selectedPackage && (
            <section className="advertising-section advertising-create-section">
              <div className="advertising-section-heading">
                <div>
                  <span className="advertising-kicker">
                    CREATE CAMPAIGN
                  </span>

                  <h2>
                    Set up your{" "}
                    {selectedPackage.name} campaign
                  </h2>

                  <p>
                    Your package price is locked to the amount
                    configured in the backend.
                  </p>
                </div>

                <button
                  type="button"
                  className="advertising-close-button"
                  onClick={() =>
                    setShowCampaignForm(false)
                  }
                >
                  Close
                </button>
              </div>

              <form
                className="advertising-form"
                onSubmit={createCampaign}
              >
                <div className="advertising-form-grid">
                  <label>
                    <span>Campaign name</span>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(event) =>
                        setCampaignName(event.target.value)
                      }
                      placeholder="e.g. Summer business campaign"
                      maxLength={150}
                      required
                    />
                  </label>

                  <label>
                    <span>Campaign objective</span>

                    <select
                      value={objective}
                      onChange={(event) =>
                        setObjective(event.target.value)
                      }
                    >
                      <option value="visibility">
                        Increase visibility
                      </option>

                      <option value="website_traffic">
                        Drive website traffic
                      </option>

                      <option value="product_awareness">
                        Promote products
                      </option>

                      <option value="service_awareness">
                        Promote services
                      </option>

                      <option value="brand_awareness">
                        Build brand awareness
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Start date and time</span>

                    <input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(event) => {
                        setStartsAt(event.target.value);
                        setEndsAt("");
                      }}
                      required
                    />
                  </label>

                  <label>
                    <span>End date and time</span>

                    <input
                      type="datetime-local"
                      value={effectiveEndsAt}
                      onChange={(event) =>
                        setEndsAt(event.target.value)
                      }
                      min={startsAt}
                      required
                    />

                    <small>
                      Default: {selectedPackage.duration_days}{" "}
                      days after the campaign starts.
                    </small>
                  </label>
                </div>

                <div className="advertising-campaign-summary">
                  <div>
                    <span>Selected plan</span>
                    <strong>
                      {selectedPackage.name}
                    </strong>
                  </div>

                  <div>
                    <span>Campaign budget</span>
                    <strong>
                      {formatMoney(
                        Number(selectedPackage.price),
                        selectedPackage.currency_code,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {selectedPackage.duration_days} days
                    </strong>
                  </div>
                </div>

                <div className="advertising-form-note">
                  <strong>What happens next?</strong>
                  <p>
                    Your campaign is created as pending payment.
                    After successful payment, the payment webhook
                    moves it to review. IFC BIZGROWTH then reviews
                    the campaign before it can become active.
                  </p>
                </div>

                <div className="advertising-form-actions">
                  <button
                    type="button"
                    className="advertising-button advertising-button--secondary"
                    onClick={() =>
                      setShowCampaignForm(false)
                    }
                    disabled={submitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="advertising-button advertising-button--primary"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Creating campaign..."
                      : "Create & continue to payment"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {activeSection === "campaigns" && (
        <section className="advertising-section">
          <div className="advertising-section-heading advertising-section-heading--campaigns">
            <div>
              <span className="advertising-kicker">
                CAMPAIGNS
              </span>

              <h2>Your advertising campaigns</h2>

              <p>
                Manage campaigns created for {businessName}.
              </p>
            </div>

            <button
              type="button"
              className="advertising-button advertising-button--primary"
              onClick={() => {
                setActiveSection("plans");
                setShowCampaignForm(true);
              }}
              disabled={packages.length === 0}
            >
              Create campaign
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="advertising-empty">
              <div className="advertising-empty-icon">
                AD
              </div>

              <h3>No campaigns yet</h3>

              <p>
                Choose an advertising plan to create your first
                campaign.
              </p>

              {packages.length > 0 && (
                <button
                  type="button"
                  className="advertising-button advertising-button--primary"
                  onClick={() => {
                    setActiveSection("plans");
                    setShowCampaignForm(true);
                  }}
                >
                  View advertising plans
                </button>
              )}
            </div>
          ) : (
            <div className="advertising-campaign-list">
              {campaigns.map((campaign) => (
                <article
                  className="advertising-campaign-card"
                  key={campaign.id}
                >
                  <div className="advertising-campaign-main">
                    <div className="advertising-campaign-icon">
                      AD
                    </div>

                    <div>
                      <div className="advertising-campaign-title-row">
                        <h3>{campaign.name}</h3>

                        <span
                          className={`advertising-campaign-status advertising-campaign-status--${campaign.status}`}
                        >
                          {getStatusLabel(
                            campaign.status,
                          )}
                        </span>
                      </div>

                      <p>
                        Objective:{" "}
                        {campaign.objective.replaceAll(
                          "_",
                          " ",
                        )}
                      </p>

                      <div className="advertising-campaign-meta">
                        <span>
                          {formatMoney(
                            Number(campaign.budget),
                            campaign.currency_code,
                          )}
                        </span>

                        <span>
                          {formatDate(campaign.starts_at)}
                        </span>

                        <span>
                          → {formatDate(campaign.ends_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="advertising-campaign-actions">
                    {campaign.status ===
                      "pending_payment" &&
                      campaign.package_id && (
                        <button
                          type="button"
                          className="advertising-button advertising-button--primary advertising-button--small"
                          disabled={
                            payingCampaignId ===
                            campaign.id
                          }
                          onClick={() => {
                            const campaignPackage =
                              packages.find(
                                (item) =>
                                  item.id ===
                                  campaign.package_id,
                              );

                            if (!campaignPackage) {
                              setMessage({
                                type: "error",
                                text: "The advertising package for this campaign is no longer available.",
                              });
                              return;
                            }

                            startPayment(
                              campaignPackage,
                              campaign.id,
                            );
                          }}
                        >
                          {payingCampaignId ===
                          campaign.id
                            ? "Opening payment..."
                            : "Pay now"}
                        </button>
                      )}

                    {campaign.status ===
                      "pending_review" && (
                      <span className="advertising-review-note">
                        Payment received — awaiting review
                      </span>
                    )}

                    {campaign.status === "active" && (
                      <span className="advertising-active-note">
                        Campaign is active
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
  }
