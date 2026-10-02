"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./marketing.css";

type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_days: number;
  daily_price: number;
  total_price: number;
  currency_code: string;
  features: string[] | null;
  is_active: boolean;
};

type Service = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service_type: string;
  starting_price: number | null;
  currency_code: string | null;
  is_active: boolean;
  sort_order: number;
};

type RequestItem = {
  id: string;
  business_id: string;
  service_id: string | null;
  title: string;
  description: string | null;
  budget: number;
  currency_code: string;
  requested_start_at: string | null;
  requested_deadline: string | null;
  status: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  plan_id: string | null;
  duration_days: number | null;
  daily_rate: number | null;
  starts_at: string | null;
  ends_at: string | null;
};

type LocalizedPlan = Plan & {
  local_price: number;
  local_currency: string;
};

const supabase = createSupabaseBrowserClient();

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<
    "plans" | "pending" | "active"
  >("plans");

  const [businessId, setBusinessId] = useState<string | null>(null);

  const [plans, setPlans] = useState<LocalizedPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);

  const [selectedPlan, setSelectedPlan] =
    useState<LocalizedPlan | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [selectedServiceId, setSelectedServiceId] =
    useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pendingRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "pending_review" ||
          request.status === "pending_payment",
      ),
    [requests],
  );

  const activeCampaigns = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === "active",
      ),
    [requests],
  );

  useEffect(() => {
    loadPage();
  }, []);

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return session.access_token;
  }

  async function loadPage() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { data: membership, error: membershipError } =
        await supabase
          .from("business_members")
          .select("business_id")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (!membership?.business_id) {
        throw new Error(
          "No business account was found for your account.",
        );
      }

      setBusinessId(membership.business_id);

      const [
        plansResult,
        servicesResult,
        requestsResult,
      ] = await Promise.all([
        supabase
          .from("marketing_campaign_plans")
          .select(
            `
            id,
            name,
            slug,
            description,
            duration_days,
            daily_price,
            total_price,
            currency_code,
            features,
            is_active
          `,
          )
          .eq("is_active", true)
          .order("duration_days", {
            ascending: true,
          }),

        supabase
          .from("marketing_services")
          .select(
            `
            id,
            name,
            slug,
            description,
            service_type,
            starting_price,
            currency_code,
            is_active,
            sort_order
          `,
          )
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          }),

        supabase
          .from("marketing_service_requests")
          .select("*")
          .eq("business_id", membership.business_id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (plansResult.error) {
        throw plansResult.error;
      }

      if (servicesResult.error) {
        throw servicesResult.error;
      }

      if (requestsResult.error) {
        throw requestsResult.error;
      }

      const rawPlans = (plansResult.data || []) as Plan[];

      const localizedPlans =
        await getLocalizedPlans(
          membership.business_id,
          rawPlans,
        );

      setPlans(localizedPlans);
      setServices(
        (servicesResult.data || []) as Service[],
      );
      setRequests(
        (requestsResult.data || []) as RequestItem[],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load marketing.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function getLocalizedPlans(
    id: string,
    rawPlans: Plan[],
  ): Promise<LocalizedPlan[]> {
    try {
      const token = await getAccessToken();

      const { data, error: functionError } =
        await supabase.functions.invoke(
          "get-localized-pricing",
          {
            body: {
              business_id: id,
              type: "marketing",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (!functionError && data?.plans) {
        return data.plans;
      }
    } catch {
      // Fall back to the database currency.
    }

    return rawPlans.map((plan) => ({
      ...plan,
      local_price: Number(plan.total_price),
      local_currency: plan.currency_code,
    }));
  }

  function selectPlan(plan: LocalizedPlan) {
    setSelectedPlan(plan);
    setShowForm(false);
    setSuccess("");
    setError("");
  }

  function continueToForm() {
    if (!selectedPlan) {
      setError("Please select a campaign plan first.");
      return;
    }

    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function submitRequest() {
    if (!businessId) {
      setError("Business account not found.");
      return;
    }

    if (!selectedPlan) {
      setError("Please select a campaign plan.");
      return;
    }

    if (!selectedServiceId) {
      setError("Please select a marketing service.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a campaign title.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe what you want to achieve.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const selectedService = services.find(
        (service) => service.id === selectedServiceId,
      );

      if (!selectedService) {
        throw new Error("Selected service was not found.");
      }

      /*
       * The frontend does not trust its own price.
       * The database plan is used as the source of truth.
       */
      const startsAt = new Date();

      const endsAt = new Date(
        startsAt.getTime() +
          selectedPlan.duration_days *
            24 *
            60 *
            60 *
            1000,
      );

      const { data: request, error: requestError } =
        await supabase
          .from("marketing_service_requests")
          .insert({
            business_id: businessId,
            service_id: selectedService.id,
            title: title.trim(),
            description: description.trim(),
            budget: selectedPlan.local_price,
            currency_code: selectedPlan.local_currency,
            requested_start_at: startsAt.toISOString(),
            requested_deadline: endsAt.toISOString(),
            status: "pending_payment",
            plan_id: selectedPlan.id,
            duration_days: selectedPlan.duration_days,
            daily_rate: selectedPlan.daily_price,
            starts_at: startsAt.toISOString(),
            ends_at: endsAt.toISOString(),
          })
          .select("*")
          .single();

      if (requestError) {
        throw requestError;
      }

      if (!request) {
        throw new Error(
          "Marketing request could not be created.",
        );
      }

      /*
       * Payment is handed to the existing payment system.
       * No new payment backend is created here.
       */
      const token = await getAccessToken();

      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke(
          "create-payment",
          {
            body: {
              type: "marketing",
              business_id: businessId,
              marketing_request_id: request.id,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (paymentError) {
        throw paymentError;
      }

      if (!paymentData?.authorization_url) {
        throw new Error(
          "Payment could not be initialized.",
        );
      }

      window.location.href =
        paymentData.authorization_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit marketing request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatMoney(
    amount: number,
    currency: string,
  ) {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function formatDate(date: string | null) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function getServiceName(serviceId: string | null) {
    if (!serviceId) return "Marketing Campaign";

    return (
      services.find(
        (service) => service.id === serviceId,
      )?.name || "Marketing Campaign"
    );
  }

  function getPlanName(planId: string | null) {
    if (!planId) return "Campaign Plan";

    return (
      plans.find(
        (plan) => plan.id === planId,
      )?.name || "Campaign Plan"
    );
  }

  if (loading) {
    return (
      <main className="marketing-page">
        <div className="marketing-loading">
          <div className="marketing-spinner" />
          <p>Loading marketing...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="marketing-page">
      <div className="marketing-container">
        <header className="marketing-header">
          <div>
            <span className="marketing-eyebrow">
              BUSINESS MARKETING
            </span>

            <h1>Marketing</h1>

            <p>
              Promote your business, reach more customers,
              and build your brand.
            </p>
          </div>

          {selectedPlan && showForm && (
            <button
              type="button"
              className="marketing-back-button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
            >
              ← Back to plans
            </button>
          )}
        </header>

        <nav className="marketing-tabs">
          <button
            type="button"
            className={
              activeTab === "plans"
                ? "marketing-tab active"
                : "marketing-tab"
            }
            onClick={() => {
              setActiveTab("plans");
              setShowForm(false);
              setSelectedPlan(null);
              setError("");
            }}
          >
            Campaign Plans
          </button>

          <button
            type="button"
            className={
              activeTab === "pending"
                ? "marketing-tab active"
                : "marketing-tab"
            }
            onClick={() => {
              setActiveTab("pending");
              setShowForm(false);
              setError("");
            }}
          >
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="marketing-count">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={
              activeTab === "active"
                ? "marketing-tab active"
                : "marketing-tab"
            }
            onClick={() => {
              setActiveTab("active");
              setShowForm(false);
              setError("");
            }}
          >
            Active Campaigns
            {activeCampaigns.length > 0 && (
              <span className="marketing-count">
                {activeCampaigns.length}
              </span>
            )}
          </button>
        </nav>

        {error && (
          <div className="marketing-alert error">
            {error}
          </div>
        )}

        {success && (
          <div className="marketing-alert success">
            {success}
          </div>
        )}

        {activeTab === "plans" && !showForm && (
          <>
            <section className="marketing-section-heading">
              <div>
                <h2>Campaign Plans</h2>
                <p>
                  Choose how long you want your marketing
                  campaign to run.
                </p>
              </div>
            </section>

            <section className="marketing-plans">
              {plans.length === 0 ? (
                <div className="marketing-empty">
                  <h3>No campaign plans available</h3>
                  <p>
                    Marketing campaign plans are currently
                    unavailable.
                  </p>
                </div>
              ) : (
                plans.map((plan) => (
                  <article
                    key={plan.id}
                    className={
                      selectedPlan?.id === plan.id
                        ? "marketing-plan selected"
                        : "marketing-plan"
                    }
                    onClick={() => selectPlan(plan)}
                  >
                    <div className="marketing-plan-top">
                      <span className="marketing-plan-duration">
                        {plan.duration_days}{" "}
                        {plan.duration_days === 1
                          ? "Day"
                          : "Days"}
                      </span>

                      {selectedPlan?.id ===
                        plan.id && (
                        <span className="marketing-selected">
                          Selected
                        </span>
                      )}
                    </div>

                    <h3>{plan.name}</h3>

                    <div className="marketing-price">
                      {formatMoney(
                        plan.local_price,
                        plan.local_currency,
                      )}
                    </div>

                    <p>{plan.description}</p>

                    {plan.features &&
                      plan.features.length > 0 && (
                        <ul className="marketing-features">
                          {plan.features.map(
                            (feature) => (
                              <li key={feature}>
                                <span>✓</span>
                                {feature}
                              </li>
                            ),
                          )}
                        </ul>
                      )}

                    <button
                      type="button"
                      className="marketing-plan-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        selectPlan(plan);
                      }}
                    >
                      {selectedPlan?.id === plan.id
                        ? "Selected"
                        : "Select Plan"}
                    </button>
                  </article>
                ))
              )}
            </section>

            {selectedPlan && (
              <section className="marketing-selected-bar">
                <div>
                  <span>Selected plan</span>
                  <strong>
                    {selectedPlan.name}
                  </strong>
                </div>

                <div className="marketing-selected-price">
                  {formatMoney(
                    selectedPlan.local_price,
                    selectedPlan.local_currency,
                  )}
                </div>

                <button
                  type="button"
                  onClick={continueToForm}
                  className="marketing-primary-button"
                >
                  Continue
                </button>
              </section>
            )}
          </>
        )}

        {activeTab === "plans" && showForm && (
          <section className="marketing-form-section">
            <div className="marketing-form-card">
              <div className="marketing-form-heading">
                <span>CREATE CAMPAIGN</span>

                <h2>
                  Tell us about your campaign
                </h2>

                <p>
                  Provide the details we need to process
                  your marketing request.
                </p>
              </div>

              <div className="marketing-selected-plan">
                <div>
                  <span>Selected plan</span>
                  <strong>
                    {selectedPlan?.name}
                  </strong>
                </div>

                <strong>
                  {selectedPlan &&
                    formatMoney(
                      selectedPlan.local_price,
                      selectedPlan.local_currency,
                    )}
                </strong>
              </div>

              <div className="marketing-form">
                <label>
                  Marketing Service
                  <select
                    value={selectedServiceId}
                    onChange={(event) =>
                      setSelectedServiceId(
                        event.target.value,
                      )
                    }
                  >
                    <option value="">
                      Select a marketing service
                    </option>

                    {services.map((service) => (
                      <option
                        key={service.id}
                        value={service.id}
                      >
                        {service.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Campaign Title
                  <input
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Promote my restaurant"
                    maxLength={150}
                  />
                </label>

                <label>
                  Campaign Description
                  <textarea
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Tell us what you want your campaign to achieve..."
                    rows={6}
                    maxLength={2000}
                  />
                </label>

                <div className="marketing-form-summary">
                  <div>
                    <span>Campaign duration</span>
                    <strong>
                      {selectedPlan?.duration_days} days
                    </strong>
                  </div>

                  <div>
                    <span>Total</span>
                    <strong>
                      {selectedPlan &&
                        formatMoney(
                          selectedPlan.local_price,
                          selectedPlan.local_currency,
                        )}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="marketing-submit-button"
                  disabled={submitting}
                  onClick={submitRequest}
                >
                  {submitting
                    ? "Processing..."
                    : "Continue to Payment"}
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "pending" && (
          <section className="marketing-requests-section">
            <div className="marketing-section-heading">
              <div>
                <h2>Pending Requests</h2>
                <p>
                  Marketing requests currently waiting
                  for processing.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="marketing-empty">
                <div className="marketing-empty-icon">
                  ✓
                </div>
                <h3>No pending requests</h3>
                <p>
                  You don't have any pending marketing
                  requests.
                </p>
              </div>
            ) : (
              <div className="marketing-request-list">
                {pendingRequests.map((request) => (
                  <article
                    key={request.id}
                    className="marketing-request-card"
                  >
                    <div className="marketing-request-main">
                      <span className="marketing-request-label">
                        {getServiceName(
                          request.service_id,
                        )}
                      </span>

                      <h3>{request.title}</h3>

                      <p>
                        {request.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="marketing-request-meta">
                      <div>
                        <span>Plan</span>
                        <strong>
                          {getPlanName(
                            request.plan_id,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Budget</span>
                        <strong>
                          {formatMoney(
                            Number(request.budget),
                            request.currency_code,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong className="status pending">
                          {request.status.replace(
                            /_/g,
                            " ",
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Submitted</span>
                        <strong>
                          {formatDate(
                            request.created_at,
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "active" && (
          <section className="marketing-requests-section">
            <div className="marketing-section-heading">
              <div>
                <h2>Active Campaigns</h2>
                <p>
                  Marketing campaigns currently running
                  for your business.
                </p>
              </div>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="marketing-empty">
                <div className="marketing-empty-icon">
                  —
                </div>
                <h3>No active campaigns</h3>
                <p>
                  You don't have any active marketing
                  campaigns yet.
                </p>
              </div>
            ) : (
              <div className="marketing-request-list">
                {activeCampaigns.map((campaign) => (
                  <article
                    key={campaign.id}
                    className="marketing-request-card active-card"
                  >
                    <div className="marketing-request-main">
                      <span className="marketing-request-label">
                        {getServiceName(
                          campaign.service_id,
                        )}
                      </span>

                      <h3>{campaign.title}</h3>

                      <p>
                        {campaign.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="marketing-request-meta">
                      <div>
                        <span>Plan</span>
                        <strong>
                          {getPlanName(
                            campaign.plan_id,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Started</span>
                        <strong>
                          {formatDate(
                            campaign.starts_at,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Ends</span>
                        <strong>
                          {formatDate(
                            campaign.ends_at,
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Status</span>
                        <strong className="status active">
                          Active
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
  }
