"use client";

import { FormEvent, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type MarketingService = {
  id: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  starting_price?: number | null;
  price?: number | null;
  currency_code?: string | null;
  is_active?: boolean | null;
};

type MarketingRequest = {
  id: string;
  service_id?: string | null;
  title?: string | null;
  description?: string | null;
  budget?: number | null;
  currency_code?: string | null;
  status?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string | null;
};

type Business = {
  id: string;
  name: string;
  status: string;
  currency_code?: string | null;
};

type Props = {
  business: Business;
  services: MarketingService[];
  requests: MarketingRequest[];
};

const FALLBACK_CURRENCY = "NGN";

function formatMoney(
  amount: number | null | undefined,
  currency = FALLBACK_CURRENCY,
) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return "Price on request";
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "completed":
      return "marketing-status marketing-status--success";

    case "in_progress":
      return "marketing-status marketing-status--info";

    case "review":
      return "marketing-status marketing-status--warning";

    case "revision":
      return "marketing-status marketing-status--revision";

    case "cancelled":
    case "rejected":
      return "marketing-status marketing-status--danger";

    default:
      return "marketing-status marketing-status--neutral";
  }
}

function formatStatus(status?: string | null) {
  if (!status) return "New";

  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function MarketingWorkspace({
  business,
  services,
  requests,
}: Props) {
  const supabase = createSupabaseBrowserClient();

  const [selectedService, setSelectedService] =
    useState<MarketingService | null>(null);

  const [showRequestForm, setShowRequestForm] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currency =
    business.currency_code ||
    selectedService?.currency_code ||
    FALLBACK_CURRENCY;

  const activeRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          !["completed", "cancelled", "rejected"].includes(
            request.status ?? "",
          ),
      ).length,
    [requests],
  );

  function openRequest(service: MarketingService) {
    setSelectedService(service);
    setTitle(`${service.name ?? "Marketing"} request`);
    setDescription("");
    setBudget(
      service.starting_price != null
        ? String(service.starting_price)
        : service.price != null
          ? String(service.price)
          : "",
    );
    setStartsAt("");
    setEndsAt("");
    setMessage("");
    setError("");
    setShowRequestForm(true);
  }

  function closeRequest() {
    if (submitting) return;

    setShowRequestForm(false);
    setSelectedService(null);
    setMessage("");
    setError("");
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedService) {
      setError("Please select a marketing service.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const numericBudget = Number(budget);

      if (
        !Number.isFinite(numericBudget) ||
        numericBudget <= 0
      ) {
        throw new Error("Please enter a valid budget.");
      }

      if (!startsAt || !endsAt) {
        throw new Error(
          "Please provide both a start date and an end date.",
        );
      }

      const startDate = new Date(startsAt);
      const endDate = new Date(endsAt);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        throw new Error("Please enter valid dates.");
      }

      if (endDate <= startDate) {
        throw new Error(
          "The end date must be after the start date.",
        );
      }

      const {
        data: {
          session,
        },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        window.location.href = "/login";
        return;
      }

      const { data, error: functionError } =
        await supabase.functions.invoke(
          "create-marketing-request",
          {
            body: {
              business_id: business.id,
              service_id: selectedService.id,
              title: title.trim(),
              description: description.trim(),
              budget: numericBudget,
              currency_code: currency.toUpperCase(),
              starts_at: startDate.toISOString(),
              ends_at: endDate.toISOString(),
            },
          },
        );

      if (functionError) {
        throw new Error(
          functionError.message ||
            "Unable to submit marketing request.",
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to submit marketing request.",
        );
      }

      setMessage(
        "Your marketing request has been submitted successfully. IFC BIZGROWTH will review it before work begins.",
      );

      setTitle("");
      setDescription("");
      setBudget("");
      setStartsAt("");
      setEndsAt("");

      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong while submitting your request.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="marketing-page">
      <div className="marketing-shell">
        <header className="marketing-header">
          <div>
            <div className="marketing-eyebrow">
              IFC BIZGROWTH SERVICES
            </div>

            <h1>Marketing & growth</h1>

            <p>
              Get professional marketing support from the
              IFC BIZGROWTH team to help your business build
              its brand and reach more customers.
            </p>
          </div>

          <div className="marketing-header-business">
            <span>Business</span>
            <strong>{business.name}</strong>
          </div>
        </header>

        <section className="marketing-overview">
          <div className="marketing-overview-card">
            <div className="marketing-overview-icon">
              <i className="fa-solid fa-bullhorn" />
            </div>

            <div>
              <strong>{services.length}</strong>
              <span>Available services</span>
            </div>
          </div>

          <div className="marketing-overview-card">
            <div className="marketing-overview-icon">
              <i className="fa-solid fa-layer-group" />
            </div>

            <div>
              <strong>{requests.length}</strong>
              <span>Total requests</span>
            </div>
          </div>

          <div className="marketing-overview-card">
            <div className="marketing-overview-icon">
              <i className="fa-solid fa-spinner" />
            </div>

            <div>
              <strong>{activeRequests}</strong>
              <span>Active requests</span>
            </div>
          </div>
        </section>

        <section className="marketing-intro">
          <div>
            <span className="marketing-section-label">
              OUR SERVICES
            </span>

            <h2>Choose the support your business needs</h2>

            <p>
              Select a service, tell us what you need, and
              submit your request. Pricing shown here comes
              directly from your active marketing services in
              the database.
            </p>
          </div>
        </section>

        {services.length === 0 ? (
          <section className="marketing-empty">
            <div className="marketing-empty-icon">
              <i className="fa-solid fa-bullhorn" />
            </div>

            <h3>No marketing services available</h3>

            <p>
              There are currently no active marketing services
              available for your business.
            </p>
          </section>
        ) : (
          <section className="marketing-services-grid">
            {services.map((service) => {
              const serviceCurrency =
                service.currency_code ||
                currency;

              const servicePrice =
                service.starting_price ??
                service.price ??
                null;

              return (
                <article
                  className="marketing-service-card"
                  key={service.id}
                >
                  <div className="marketing-service-top">
                    <div className="marketing-service-icon">
                      <i className="fa-solid fa-chart-line" />
                    </div>

                    <span className="marketing-service-badge">
                      Available
                    </span>
                  </div>

                  <div className="marketing-service-body">
                    <h3>
                      {service.name ||
                        "Marketing service"}
                    </h3>

                    <p>
                      {service.description ||
                        "Professional marketing support designed to help your business grow."}
                    </p>
                  </div>

                  <div className="marketing-service-bottom">
                    <div className="marketing-service-price">
                      <span>Starting from</span>

                      <strong>
                        {formatMoney(
                          servicePrice,
                          serviceCurrency,
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="marketing-primary-button"
                      onClick={() =>
                        openRequest(service)
                      }
                    >
                      Request service
                      <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <section className="marketing-process">
          <div className="marketing-process-heading">
            <span className="marketing-section-label">
              HOW IT WORKS
            </span>

            <h2>From request to completed work</h2>
          </div>

          <div className="marketing-process-grid">
            <div className="marketing-process-step">
              <span>01</span>
              <div>
                <h3>Choose a service</h3>
                <p>
                  Select the marketing service that matches
                  your current business need.
                </p>
              </div>
            </div>

            <div className="marketing-process-step">
              <span>02</span>
              <div>
                <h3>Submit your brief</h3>
                <p>
                  Tell our team what you want to achieve,
                  your budget and your preferred timeline.
                </p>
              </div>
            </div>

            <div className="marketing-process-step">
              <span>03</span>
              <div>
                <h3>We review it</h3>
                <p>
                  The IFC BIZGROWTH team reviews your request
                  and works with the agreed budget.
                </p>
              </div>
            </div>

            <div className="marketing-process-step">
              <span>04</span>
              <div>
                <h3>Work begins</h3>
                <p>
                  After the required payment, your request
                  moves into the production workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="marketing-requests">
          <div className="marketing-requests-heading">
            <div>
              <span className="marketing-section-label">
                YOUR REQUESTS
              </span>

              <h2>Marketing activity</h2>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="marketing-request-empty">
              <i className="fa-regular fa-folder-open" />

              <div>
                <strong>No marketing requests yet</strong>

                <p>
                  Your submitted marketing requests will
                  appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="marketing-request-list">
              {requests.map((request) => (
                <article
                  className="marketing-request-row"
                  key={request.id}
                >
                  <div className="marketing-request-main">
                    <div className="marketing-request-icon">
                      <i className="fa-solid fa-file-lines" />
                    </div>

                    <div>
                      <h3>
                        {request.title ||
                          "Marketing request"}
                      </h3>

                      <p>
                        Submitted{" "}
                        {formatDate(
                          request.created_at,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="marketing-request-budget">
                    <span>Budget</span>

                    <strong>
                      {formatMoney(
                        request.budget,
                        request.currency_code ||
                          currency,
                      )}
                    </strong>
                  </div>

                  <div className="marketing-request-status">
                    <span className={getStatusClass(request.status)}>
                      {formatStatus(request.status)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {showRequestForm && selectedService && (
        <div
          className="marketing-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRequest();
            }
          }}
        >
          <div
            className="marketing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="marketing-request-title"
          >
            <div className="marketing-modal-header">
              <div>
                <span className="marketing-section-label">
                  REQUEST SERVICE
                </span>

                <h2 id="marketing-request-title">
                  {selectedService.name}
                </h2>

                <p>
                  Give the IFC BIZGROWTH team enough
                  information to understand what you need.
                </p>
              </div>

              <button
                type="button"
                className="marketing-modal-close"
                onClick={closeRequest}
                disabled={submitting}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form
              className="marketing-request-form"
              onSubmit={submitRequest}
            >
              {error && (
                <div className="marketing-alert marketing-alert--error">
                  <i className="fa-solid fa-circle-exclamation" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="marketing-alert marketing-alert--success">
                  <i className="fa-solid fa-circle-check" />
                  <span>{message}</span>
                </div>
              )}

              <div className="marketing-form-group">
                <label htmlFor="marketing-title">
                  Request title
                </label>

                <input
                  id="marketing-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Social media campaign for my business"
                  minLength={2}
                  maxLength={150}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="marketing-form-group">
                <label htmlFor="marketing-description">
                  What do you need?
                </label>

                <textarea
                  id="marketing-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Explain what you want us to help you achieve..."
                  rows={6}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="marketing-form-grid">
                <div className="marketing-form-group">
                  <label htmlFor="marketing-budget">
                    Budget
                  </label>

                  <div className="marketing-input-prefix">
                    <span>{currency}</span>

                    <input
                      id="marketing-budget"
                      type="number"
                      value={budget}
                      onChange={(event) =>
                        setBudget(
                          event.target.value,
                        )
                      }
                      min="1"
                      step="0.01"
                      required
                      disabled={submitting}
                    />
                  </div>

                  {(
                    selectedService.starting_price ??
                    selectedService.price
                  ) != null && (
                    <small>
                      Minimum starting price:{" "}
                      {formatMoney(
                        selectedService.starting_price ??
                          selectedService.price,
                        selectedService.currency_code ||
                          currency,
                      )}
                    </small>
                  )}
                </div>

                <div className="marketing-form-group">
                  <label htmlFor="marketing-currency">
                    Currency
                  </label>

                  <input
                    id="marketing-currency"
                    type="text"
                    value={currency}
                    readOnly
                  />
                </div>
              </div>

              <div className="marketing-form-grid">
                <div className="marketing-form-group">
                  <label htmlFor="marketing-start">
                    Start date
                  </label>

                  <input
                    id="marketing-start"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(event) =>
                      setStartsAt(
                        event.target.value,
                      )
                    }
                    required
                    disabled={submitting}
                  />
                </div>

                <div className="marketing-form-group">
                  <label htmlFor="marketing-end">
                    End date
                  </label>

                  <input
                    id="marketing-end"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(event) =>
                      setEndsAt(
                        event.target.value,
                      )
                    }
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="marketing-modal-footer">
                <button
                  type="button"
                  className="marketing-secondary-button"
                  onClick={closeRequest}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="marketing-primary-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit request
                      <i className="fa-solid fa-arrow-right" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
