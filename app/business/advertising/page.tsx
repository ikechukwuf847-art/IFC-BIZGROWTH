"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import "./advertising.css";

type Tab = "campaigns" | "active" | "stats";

type Package = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency_code: string;
  duration_days: number;
  is_active: boolean;
};

type Campaign = {
  id: string;
  name: string;
  objective: string;
  budget: number;
  currency_code: string;
  starts_at: string;
  ends_at: string;
  status: string;
  package_id: string | null;
};

type Business = {
  id: string;
  name: string;
  email: string | null;
  country_code: string;
  countries: {
    currency_code: string;
  } | null;
};

type Stat = {
  advertisement_id: string;
  stat_date: string;
  impressions: number;
  clicks: number;
  contacts: number;
  conversions: number;
};

const supabase = createSupabaseBrowserClient();

export default function AdvertisingPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [business, setBusiness] = useState<Business | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("visibility");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const localCurrency = business?.countries?.currency_code || "NGN";

  const money = useCallback(
    (amount: number, currency = localCurrency) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(amount),
    [localCurrency]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Please sign in to continue.");
      }

      const { data: membership, error: membershipError } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) throw membershipError;

      if (!membership?.business_id) {
        throw new Error("No business is connected to your account.");
      }

      const businessId = membership.business_id;

      const [businessResult, packageResult, campaignResult] =
        await Promise.all([
          supabase
            .from("businesses")
            .select(
              "id,name,email,country_code,countries(currency_code)"
            )
            .eq("id", businessId)
            .single(),

          supabase
            .from("ad_packages")
            .select(
              "id,name,slug,description,price,currency_code,duration_days,is_active"
            )
            .eq("is_active", true)
            .order("duration_days", { ascending: true }),

          supabase
            .from("ad_campaigns")
            .select(
              "id,name,objective,budget,currency_code,starts_at,ends_at,status,package_id"
            )
            .eq("business_id", businessId)
            .order("created_at", { ascending: false }),
        ]);

      if (businessResult.error) throw businessResult.error;
      if (packageResult.error) throw packageResult.error;
      if (campaignResult.error) throw campaignResult.error;

      setBusiness(businessResult.data as Business);
      setPackages((packageResult.data || []) as Package[]);
      setCampaigns((campaignResult.data || []) as Campaign[]);

      const activeCampaigns = (campaignResult.data || []).filter(
        (campaign) => campaign.status === "active"
      );

      if (activeCampaigns.length) {
        const campaignIds = activeCampaigns.map((campaign) => campaign.id);

        const { data: advertisements, error: adError } = await supabase
          .from("advertisements")
          .select("id,campaign_id")
          .in("campaign_id", campaignIds);

        if (adError) throw adError;

        const advertisementIds =
          advertisements?.map((ad) => ad.id) || [];

        if (advertisementIds.length) {
          const { data: dailyStats, error: statsError } = await supabase
            .from("ad_daily_stats")
            .select(
              "advertisement_id,stat_date,impressions,clicks,contacts,conversions"
            )
            .in("advertisement_id", advertisementIds)
            .order("stat_date", { ascending: false });

          if (statsError) throw statsError;

          setStats((dailyStats || []) as Stat[]);
        } else {
          setStats([]);
        }
      } else {
        setStats([]);
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to load advertising."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns]
  );

  const pendingCampaigns = useMemo(
    () =>
      campaigns.filter((campaign) =>
        ["pending_payment", "draft"].includes(campaign.status)
      ),
    [campaigns]
  );

  const totals = useMemo(
    () =>
      stats.reduce(
        (total, stat) => ({
          impressions: total.impressions + Number(stat.impressions || 0),
          clicks: total.clicks + Number(stat.clicks || 0),
          contacts: total.contacts + Number(stat.contacts || 0),
          conversions: total.conversions + Number(stat.conversions || 0),
        }),
        {
          impressions: 0,
          clicks: 0,
          contacts: 0,
          conversions: 0,
        }
      ),
    [stats]
  );

  async function createCampaign() {
    setError("");
    setMessage("");

    if (!selectedPackage) {
      setError("Select an advertising package.");
      return;
    }

    if (!campaignName.trim()) {
      setError("Enter a campaign name.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      if (!business?.id) {
        throw new Error("Business information is unavailable.");
      }

      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-ad-campaign`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: business.id,
          package_id: selectedPackage.id,
          name: campaignName.trim(),
          objective,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to create campaign.");
      }

      const campaignId = result.campaign.id;

      setMessage("Campaign created. Redirecting to payment...");
      setSubmitting(false);
      setPaymentLoading(true);

      const paymentUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment`;

      const paymentResponse = await fetch(paymentUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: business.id,
          order_type: "ad_campaign",
          package_id: selectedPackage.id,
          campaign_id: campaignId,
        }),
      });

      const payment = await paymentResponse.json();

      if (!paymentResponse.ok || !payment.success) {
        throw new Error(payment.error || "Unable to initialize payment.");
      }

      if (!payment.authorization_url) {
        throw new Error("Payment authorization URL was not returned.");
      }

      window.location.href = payment.authorization_url;
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      setPaymentLoading(false);
      setError(
        err instanceof Error ? err.message : "Unable to start payment."
      );
    }
  }

  function statusLabel(status: string) {
    return status.replaceAll("_", " ");
  }

  function statusClass(status: string) {
    return `status status-${status}`;
  }

  if (loading) {
    return (
      <main className="advertising-page">
        <div className="advertising-loading">
          <div className="loading-spinner" />
          <p>Loading advertising...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="advertising-page">
      <section className="advertising-shell">
        <header className="advertising-header">
          <div>
            <span className="eyebrow">IFC BIZGROWTH</span>
            <h1>Advertising</h1>
            <p>
              Put your business in front of more customers with Featured
              Business advertising.
            </p>
          </div>

          {business && (
            <div className="business-chip">
              <span className="business-dot" />
              <div>
                <strong>{business.name}</strong>
                <small>{localCurrency}</small>
              </div>
            </div>
          )}
        </header>

        <nav className="advertising-nav" aria-label="Advertising navigation">
          <button
            className={tab === "campaigns" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("campaigns")}
          >
            <span>Campaigns</span>
            <small>{campaigns.length}</small>
          </button>

          <button
            className={tab === "active" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("active")}
          >
            <span>Active Campaign</span>
            <small>{activeCampaigns.length}</small>
          </button>

          <button
            className={tab === "stats" ? "nav-item active" : "nav-item"}
            onClick={() => setTab("stats")}
          >
            <span>Stats</span>
            <small>Overview</small>
          </button>
        </nav>

        {error && (
          <div className="alert alert-error" role="alert">
            <strong>Something went wrong</strong>
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>{message}</span>
          </div>
        )}

        {tab === "campaigns" && (
          <section className="campaigns-section">
            <div className="section-heading">
              <div>
                <h2>Promote your business</h2>
                <p>
                  Select a package and pay securely to feature your business.
                </p>
              </div>
            </div>

            <div className="campaign-builder">
              <div className="builder-card">
                <div className="card-heading">
                  <span className="step-number">01</span>
                  <div>
                    <h3>Choose a package</h3>
                    <p>Choose how long you want your business featured.</p>
                  </div>
                </div>

                <div className="package-grid">
                  {packages.map((pkg) => {
                    const selected = selectedPackage?.id === pkg.id;

                    return (
                      <button
                        key={pkg.id}
                        className={
                          selected
                            ? "package-card selected"
                            : "package-card"
                        }
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <div className="package-top">
                          <span>{pkg.duration_days} days</span>
                          {selected && <span className="check">✓</span>}
                        </div>

                        <strong>
                          {money(Number(pkg.price), pkg.currency_code)}
                        </strong>

                        <small>
                          Displayed base price • {pkg.currency_code}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="builder-card">
                <div className="card-heading">
                  <span className="step-number">02</span>
                  <div>
                    <h3>Campaign details</h3>
                    <p>Give your advertising campaign a name.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Campaign name</span>
                    <input
                      value={campaignName}
                      onChange={(event) =>
                        setCampaignName(event.target.value)
                      }
                      placeholder="e.g. October Business Promotion"
                      maxLength={100}
                    />
                  </label>

                  <label>
                    <span>Objective</span>
                    <select
                      value={objective}
                      onChange={(event) => setObjective(event.target.value)}
                    >
                      <option value="visibility">Business visibility</option>
                      <option value="customer_acquisition">
                        Customer acquisition
                      </option>
                      <option value="brand_awareness">
                        Brand awareness
                      </option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="checkout-card">
                <div>
                  <span className="checkout-label">Selected package</span>

                  <h3>
                    {selectedPackage
                      ? selectedPackage.name
                      : "No package selected"}
                  </h3>

                  {selectedPackage && (
                    <p>
                      {selectedPackage.duration_days} days of Featured
                      Business placement.
                    </p>
                  )}
                </div>

                <div className="checkout-price">
                  {selectedPackage ? (
                    <>
                      <small>Package price</small>
                      <strong>
                        {money(
                          Number(selectedPackage.price),
                          selectedPackage.currency_code
                        )}
                      </strong>
                    </>
                  ) : (
                    <small>Select a package to continue</small>
                  )}
                </div>

                <button
                  className="primary-button"
                  onClick={createCampaign}
                  disabled={
                    submitting ||
                    paymentLoading ||
                    !selectedPackage ||
                    !campaignName.trim()
                  }
                >
                  {paymentLoading
                    ? "Opening payment..."
                    : submitting
                    ? "Creating campaign..."
                    : "Continue to payment"}
                </button>

                <small className="secure-note">
                  Secure payment powered by Paystack.
                </small>
              </div>
            </div>

            <div className="existing-campaigns">
              <div className="section-heading compact">
                <div>
                  <h2>Your campaigns</h2>
                  <p>Track campaigns you have created.</p>
                </div>
              </div>

              {campaigns.length === 0 ? (
                <div className="empty-card">
                  <h3>No campaigns yet</h3>
                  <p>
                    Choose an advertising package above to create your first
                    campaign.
                  </p>
                </div>
              ) : (
                <div className="campaign-list">
                  {campaigns.map((campaign) => (
                    <article className="campaign-row" key={campaign.id}>
                      <div className="campaign-info">
                        <div className="campaign-icon">AD</div>

                        <div>
                          <h3>{campaign.name}</h3>
                          <p>{campaign.objective.replaceAll("_", " ")}</p>
                        </div>
                      </div>

                      <div className="campaign-meta">
                        <strong>
                          {money(
                            Number(campaign.budget),
                            campaign.currency_code
                          )}
                        </strong>
                        <span>
                          {new Date(campaign.starts_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span className={statusClass(campaign.status)}>
                        {statusLabel(campaign.status)}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {pendingCampaigns.length > 0 && (
              <div className="info-box">
                <strong>Payment required</strong>
                <p>
                  Campaigns marked as pending payment have not been activated
                  yet. Complete their payment before the advertising period
                  begins.
                </p>
              </div>
            )}
          </section>
        )}

        {tab === "active" && (
          <section className="active-section">
            <div className="section-heading">
              <div>
                <h2>Active campaign</h2>
                <p>Your businesses currently running as Featured.</p>
              </div>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="empty-card large">
                <div className="empty-icon">AD</div>
                <h3>No active campaign</h3>
                <p>
                  Once you complete payment for an advertising package, your
                  campaign will appear here automatically.
                </p>
                <button
                  className="secondary-button"
                  onClick={() => setTab("campaigns")}
                >
                  Create campaign
                </button>
              </div>
            ) : (
              <div className="active-grid">
                {activeCampaigns.map((campaign) => (
                  <article className="active-card" key={campaign.id}>
                    <div className="active-card-top">
                      <span className="live-badge">
                        <span />
                        Live
                      </span>
                      <span className="active-package">
                        {campaign.currency_code}
                      </span>
                    </div>

                    <h3>{campaign.name}</h3>

                    <p>
                      Your business is currently being promoted through
                      Featured Businesses.
                    </p>

                    <div className="date-grid">
                      <div>
                        <small>Started</small>
                        <strong>
                          {new Date(
                            campaign.starts_at
                          ).toLocaleDateString()}
                        </strong>
                      </div>

                      <div>
                        <small>Ends</small>
                        <strong>
                          {new Date(
                            campaign.ends_at
                          ).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    <div className="active-price">
                      <small>Campaign budget</small>
                      <strong>
                        {money(
                          Number(campaign.budget),
                          campaign.currency_code
                        )}
                      </strong>
                    </div>

                    <button
                      className="secondary-button full"
                      onClick={() => setTab("stats")}
                    >
                      View campaign stats
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "stats" && (
          <section className="stats-section">
            <div className="section-heading">
              <div>
                <h2>Campaign statistics</h2>
                <p>
                  Performance data collected from your advertising campaigns.
                </p>
              </div>
            </div>

            {activeCampaigns.length === 0 ? (
              <div className="empty-card large">
                <div className="empty-icon">ST</div>
                <h3>No active campaign statistics</h3>
                <p>
                  Statistics will appear here after an advertising campaign
                  becomes active.
                </p>
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <span>Impressions</span>
                    <strong>
                      {totals.impressions.toLocaleString()}
                    </strong>
                    <small>Total ad views</small>
                  </div>

                  <div className="stat-card">
                    <span>Clicks</span>
                    <strong>{totals.clicks.toLocaleString()}</strong>
                    <small>Customer visits</small>
                  </div>

                  <div className="stat-card">
                    <span>Contacts</span>
                    <strong>{totals.contacts.toLocaleString()}</strong>
                    <small>Customer contacts</small>
                  </div>

                  <div className="stat-card">
                    <span>Conversions</span>
                    <strong>{totals.conversions.toLocaleString()}</strong>
                    <small>Recorded conversions</small>
                  </div>
                </div>

                <div className="stats-table-card">
                  <div className="table-heading">
                    <div>
                      <h3>Daily performance</h3>
                      <p>Recent advertising activity.</p>
                    </div>
                  </div>

                  {stats.length === 0 ? (
                    <div className="table-empty">
                      No statistics have been recorded yet.
                    </div>
                  ) : (
                    <div className="stats-table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Impressions</th>
                            <th>Clicks</th>
                            <th>Contacts</th>
                            <th>Conversions</th>
                          </tr>
                        </thead>

                        <tbody>
                          {stats.map((stat) => (
                            <tr
                              key={`${stat.advertisement_id}-${stat.stat_date}`}
                            >
                              <td>
                                {new Date(
                                  stat.stat_date
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                {Number(
                                  stat.impressions
                                ).toLocaleString()}
                              </td>
                              <td>
                                {Number(stat.clicks).toLocaleString()}
                              </td>
                              <td>
                                {Number(stat.contacts).toLocaleString()}
                              </td>
                              <td>
                                {Number(
                                  stat.conversions
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        )}
      </section>
    </main>
  );
}
