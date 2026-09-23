"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Business = {
  id: string;
  name: string;
  country_code: string;
  status: string;
  currency_code: string;
};

type MarketingPlan = {
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

type MarketingRequest = {
  id: string;
  business_id: string;
  plan_id: string | null;
  title: string;
  description: string | null;
  budget: number;
  currency_code: string;
  starts_at: string | null;
  ends_at: string | null;
  duration_days: number | null;
  daily_rate: number | null;
  status: string;
  created_at: string;
};

type Props = {
  business: Business;
  plans: MarketingPlan[];
  requests: MarketingRequest[];
};

const statusLabels: Record<string, string> = {
  new: "Awaiting payment",
  assigned: "Assigned",
  in_progress: "Campaign in progress",
  review: "Under review",
  revision: "Revision",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

function formatMoney(
  amount: number,
  currencyCode: string,
) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString()}`;
  }
}

function formatDate(value: string | null) {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function MarketingWorkspace({
  business,
  plans,
  requests: initialRequests,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [requests, setRequests] =
    useState(initialRequests);

  const [selectedPlanId, setSelectedPlanId] =
    useState<string>(
      plans[0]?.id ?? "",
    );

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [startsAt, setStartsAt] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [paymentLoadingId, setPaymentLoadingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const selectedPlan = useMemo(
    () =>
      plans.find(
        (plan) =>
          plan.id === selectedPlanId,
      ) ?? null,
    [plans, selectedPlanId],
  );

  const totalPrice = selectedPlan
    ? Number(selectedPlan.total_price)
    : 0;

  async function createCampaign(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!selectedPlan) {
      setError(
        "Please select a marketing campaign plan.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a campaign title.",
      );
      return;
    }

    if (!startsAt) {
      setError(
        "Please choose a campaign start date.",
      );
      return;
    }

    const selectedDate =
      new Date(`${startsAt}T00:00:00`);

    if (
      Number.isNaN(
        selectedDate.getTime(),
      )
    ) {
      setError(
        "Please enter a valid start date.",
      );
      return;
    }

    if (
      selectedDate.getTime() <=
      Date.now()
    ) {
      setError(
        "Campaign start date must be in the future.",
      );
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href =
          `/login?next=${encodeURIComponent(
            "/business/marketing",
          )}`;

        return;
      }

      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        throw new Error(
          "Supabase configuration is missing.",
        );
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-marketing-request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              process.env
                .NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            business_id:
              business.id,

            plan_id:
              selectedPlan.id,

            title:
              title.trim(),

            description:
              description.trim() || null,

            starts_at:
              selectedDate.toISOString(),
          }),
        },
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Unable to create marketing campaign.",
        );
      }

      const createdRequest =
        result?.request as
          | MarketingRequest
          | undefined;

      if (createdRequest) {
        setRequests((current) => [
          createdRequest,
          ...current,
        ]);
      }

      setTitle("");
      setDescription("");
      setStartsAt("");

      setMessage(
        "Campaign request created. Continue to payment to activate your campaign.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create marketing campaign.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function payForCampaign(
    request: MarketingRequest,
  ) {
    setError("");
    setMessage("");
    setPaymentLoadingId(request.id);

    try {
      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href =
          `/login?next=${encodeURIComponent(
            "/business/marketing",
          )}`;

        return;
      }

      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        throw new Error(
          "Supabase configuration is missing.",
        );
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              process.env
                .NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            business_id:
              business.id,

            order_type:
              "marketing_service",

            service_request_id:
              request.id,

            currency_code:
              request.currency_code,

            description:
              request.title,
          }),
        },
      );

      const result = await response.json();

if (!response.ok) {
  throw new Error(
    result?.error ||
      result?.message ||
      "Unable to initialize payment."
  );
}

const authorizationUrl =
  result?.payment?.authorization_url ||
  result?.data?.payment?.authorization_url ||
  result?.authorization_url ||
  result?.data?.authorization_url;

if (!authorizationUrl) {
  console.error("create-payment response:", result);
  throw new Error("Payment authorization URL was not returned.");
}

window.location.href = authorizationUrl;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to initialize payment.",
      );

      setPaymentLoadingId(null);
    }
  }

  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div>
          <span className="marketing-eyebrow">
            IFC BIZGROWTH MARKETING
          </span>

          <h1>
            Put your business in front of
            more customers.
          </h1>

          <p>
            Choose a campaign duration and
            let IFC BIZGROWTH handle the
            marketing campaign for your
            business.
          </p>
        </div>

        <div className="marketing-rate-card">
          <span>Campaign rate</span>

          <strong>
            {formatMoney(
              1750,
              business.currency_code,
            )}
          </strong>

          <small>per day</small>
        </div>
      </section>

      {error && (
        <div
          className="marketing-alert marketing-alert--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="marketing-alert marketing-alert--success"
          role="status"
        >
          {message}
        </div>
      )}

      <section className="marketing-section">
        <div className="marketing-section-heading">
          <div>
            <span className="marketing-label">
              CAMPAIGN PLANS
            </span>

            <h2>
              Choose how long you want
              your campaign to run
            </h2>

            <p>
              Every plan includes the complete
              IFC BIZGROWTH marketing campaign.
              You only choose the duration.
            </p>
          </div>
        </div>

        <div className="marketing-plans">
          {plans.map((plan) => {
            const selected =
              plan.id === selectedPlanId;

            return (
              <button
                key={plan.id}
                type="button"
                className={`marketing-plan ${
                  selected
                    ? "marketing-plan--selected"
                    : ""
                }`}
                onClick={() =>
                  setSelectedPlanId(plan.id)
                }
              >
                {selected && (
                  <span className="marketing-plan__selected">
                    Selected
                  </span>
                )}

                <span className="marketing-plan__duration">
                  {plan.duration_days} days
                </span>

                <strong className="marketing-plan__price">
                  {formatMoney(
                    Number(
                      plan.total_price,
                    ),
                    plan.currency_code,
                  )}
                </strong>

                <span className="marketing-plan__daily">
                  {formatMoney(
                    Number(
                      plan.daily_price,
                    ),
                    plan.currency_code,
                  )}
                  /day
                </span>

                <span className="marketing-plan__name">
                  {plan.name}
                </span>

                {plan.description && (
                  <span className="marketing-plan__description">
                    {plan.description}
                  </span>
                )}

                <span className="marketing-plan__features">
                  {(
                    plan.features ?? []
                  ).map((feature) => (
                    <span
                      key={feature}
                    >
                      <span aria-hidden="true">
                        ✓
                      </span>
                      {feature}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="marketing-create">
        <div className="marketing-create__intro">
          <span className="marketing-label">
            START A CAMPAIGN
          </span>

          <h2>
            Tell us what you want
            promoted
          </h2>

          <p>
            Your selected plan is{" "}
            <strong>
              {selectedPlan?.name ??
                "not selected"}
            </strong>
            .
          </p>
        </div>

        <form
          className="marketing-form"
          onSubmit={createCampaign}
        >
          <div className="marketing-form__field">
            <label htmlFor="campaign-title">
              Campaign title
            </label>

            <input
              id="campaign-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="e.g. Promote our new furniture collection"
              maxLength={150}
              required
            />
          </div>

          <div className="marketing-form__field">
            <label htmlFor="campaign-description">
              What should we promote?
            </label>

            <textarea
              id="campaign-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Tell us about the product, service, offer or business you want us to promote."
              maxLength={2000}
              rows={6}
            />
          </div>

          <div className="marketing-form__field">
            <label htmlFor="campaign-start">
              Campaign start date
            </label>

            <input
              id="campaign-start"
              type="date"
              value={startsAt}
              onChange={(event) =>
                setStartsAt(
                  event.target.value,
                )
              }
              min={
                new Date(
                  Date.now() +
                    24 * 60 * 60 * 1000,
                )
                  .toISOString()
                  .split("T")[0]
              }
              required
            />

            <span className="marketing-form__hint">
              Your campaign will run for{" "}
              {selectedPlan?.duration_days ??
                0}{" "}
              days.
            </span>
          </div>

          <div className="marketing-summary">
            <div>
              <span>
                Selected plan
              </span>

              <strong>
                {selectedPlan?.name ??
                  "Select a plan"}
              </strong>
            </div>

            <div>
              <span>
                Duration
              </span>

              <strong>
                {selectedPlan
                  ? `${selectedPlan.duration_days} days`
                  : "—"}
              </strong>
            </div>

            <div>
              <span>
                Daily rate
              </span>

              <strong>
                {selectedPlan
                  ? formatMoney(
                      Number(
                        selectedPlan.daily_price,
                      ),
                      selectedPlan.currency_code,
                    )
                  : "—"}
              </strong>
            </div>

            <div className="marketing-summary__total">
              <span>
                Total campaign price
              </span>

              <strong>
                {selectedPlan
                  ? formatMoney(
                      totalPrice,
                      selectedPlan.currency_code,
                    )
                  : "—"}
              </strong>
            </div>
          </div>

          <button
            type="submit"
            className="marketing-primary-button"
            disabled={
              submitting ||
              !selectedPlan
            }
          >
            {submitting
              ? "Creating campaign..."
              : "Create campaign request"}
          </button>
        </form>
      </section>

      <section className="marketing-section marketing-section--requests">
        <div className="marketing-section-heading">
          <div>
            <span className="marketing-label">
              YOUR CAMPAIGNS
            </span>

            <h2>
              Campaign requests
            </h2>

            <p>
              Track campaigns you have
              submitted to IFC BIZGROWTH.
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="marketing-empty">
            <div className="marketing-empty__icon">
              📣
            </div>

            <h3>
              No campaigns yet
            </h3>

            <p>
              Choose a campaign plan above
              to start promoting your
              business.
            </p>
          </div>
        ) : (
          <div className="marketing-requests">
            {requests.map((request) => (
              <article
                className="marketing-request"
                key={request.id}
              >
                <div className="marketing-request__top">
                  <div>
                    <span className="marketing-request__plan">
                      {request.duration_days
                        ? `${request.duration_days}-day campaign`
                        : "Marketing campaign"}
                    </span>

                    <h3>
                      {request.title}
                    </h3>
                  </div>

                  <span
                    className={`marketing-status marketing-status--${request.status}`}
                  >
                    {statusLabels[
                      request.status
                    ] ??
                      request.status}
                  </span>
                </div>

                {request.description && (
                  <p className="marketing-request__description">
                    {request.description}
                  </p>
                )}

                <div className="marketing-request__details">
                  <div>
                    <span>
                      Start
                    </span>

                    <strong>
                      {formatDate(
                        request.starts_at,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      End
                    </span>

                    <strong>
                      {formatDate(
                        request.ends_at,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Budget
                    </span>

                    <strong>
                      {formatMoney(
                        Number(
                          request.budget,
                        ),
                        request.currency_code,
                      )}
                    </strong>
                  </div>
                </div>

                {request.status ===
                  "new" && (
                  <div className="marketing-request__actions">
                    <button
                      type="button"
                      className="marketing-primary-button marketing-primary-button--small"
                      onClick={() =>
                        payForCampaign(
                          request,
                        )
                      }
                      disabled={
                        paymentLoadingId ===
                        request.id
                      }
                    >
                      {paymentLoadingId ===
                      request.id
                        ? "Opening payment..."
                        : "Pay now"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
    }
