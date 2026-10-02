"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import "./advertising.css";

type Package = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency_code: string;
  duration_days: number;
};

type LocalizedPrice = {
  type: "ad_package";
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  base_currency: string;
  local_price: number;
  local_currency: string;
  exchange_rate: number;
  rate_direction: "direct" | "inverse" | "same";
};

type Business = {
  id: string;
  name: string;
  email: string | null;
  country_code: string;
  countries: {
    currency_code: string;
  }[];
};

type Campaign = {
  id: string;
  business_id: string;
  package_id: string | null;
  name: string;
  objective: string;
  budget: number;
  currency_code: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at: string;
  ad_packages: Package[] | null;
};

type Advertisement = {
  id: string;
  campaign_id: string;
  placement_id: string;
  title: string;
  description: string | null;
  destination_url: string | null;
  status: string;
};

type Stat = {
  id: string;
  advertisement_id: string;
  stat_date: string;
  impressions: number;
  clicks: number;
  contacts: number;
  conversions: number;
};

type Tab = "campaigns" | "active" | "stats";

const supabase = createSupabaseBrowserClient();

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AdvertisingPage() {
  const [business, setBusiness] = useState<Business | null>(null);

  const [packages, setPackages] = useState<Package[]>([]);

  const [localizedPrices, setLocalizedPrices] = useState<
    Record<string, LocalizedPrice>
  >({});

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [advertisements, setAdvertisements] = useState<
    Advertisement[]
  >([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const [tab, setTab] = useState<Tab>("campaigns");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] =
    useState<Package | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("visibility");

  /*
   * Load localized advertising prices.
   *
   * IMPORTANT:
   * The frontend does NOT calculate exchange rates.
   * It asks the get-localized-pricing Edge Function.
   */
  const loadLocalizedPrices = useCallback(
    async (
      businessId: string,
      packageList: Package[],
      accessToken: string
    ) => {
      if (packageList.length === 0) {
        setLocalizedPrices({});
        return;
      }

      setPricingLoading(true);

      try {
        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
          throw new Error(
            "Supabase configuration is missing."
          );
        }

        const response = await fetch(
          `${supabaseUrl}/functions/v1/get-localized-pricing`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              business_id: businessId,
              items: packageList.map((item) => ({
                type: "ad_package",
                id: item.id,
              })),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load localized advertising prices."
          );
        }

        if (!Array.isArray(data?.prices)) {
          throw new Error(
            "Invalid pricing response from the server."
          );
        }

        const priceMap: Record<string, LocalizedPrice> = {};

        for (const price of data.prices) {
          if (
            price?.type === "ad_package" &&
            price?.id &&
            typeof price.local_price === "number" &&
            price.local_currency
          ) {
            priceMap[price.id] = price as LocalizedPrice;
          }
        }

        /*
         * Do not allow the page to silently display
         * base NGN prices when a localized price is missing.
         */
        const missingPackage = packageList.find(
          (item) => !priceMap[item.id]
        );

        if (missingPackage) {
          throw new Error(
            `Unable to calculate the local price for ${missingPackage.name}.`
          );
        }

        setLocalizedPrices(priceMap);

        return priceMap;
      } finally {
        setPricingLoading(false);
      }
    },
    []
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      /*
       * 1. Get authenticated user.
       */
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(authError.message);
      }

      if (!user) {
        throw new Error("Please sign in to continue.");
      }

      /*
       * 2. Get all business memberships.
       */
      const { data: memberships, error: membershipError } =
        await supabase
          .from("business_members")
          .select("business_id,role")
          .eq("user_id", user.id);

      if (membershipError) {
        throw new Error(
          `Unable to load business membership: ${membershipError.message}`
        );
      }

      const membershipBusinessIds = (memberships || [])
        .map((item) => item.business_id)
        .filter(Boolean);

      /*
       * 3. Also get businesses directly owned by user.
       */
      const { data: ownedBusinesses, error: ownerError } =
        await supabase
          .from("businesses")
          .select("id")
          .eq("owner_id", user.id);

      if (ownerError) {
        throw new Error(
          `Unable to load owned businesses: ${ownerError.message}`
        );
      }

      const ownedBusinessIds = (ownedBusinesses || [])
        .map((item) => item.id)
        .filter(Boolean);

      /*
       * 4. Combine business IDs.
       */
      const businessIds = Array.from(
        new Set([
          ...membershipBusinessIds,
          ...ownedBusinessIds,
        ])
      );

      if (businessIds.length === 0) {
        throw new Error(
          "No business account is connected to your account."
        );
      }

      /*
       * 5. Load accessible businesses.
       */
      const {
        data: availableBusinesses,
        error: businessesError,
      } = await supabase
        .from("businesses")
        .select(
          "id,name,email,country_code,status,verification_status,is_public,owner_id"
        )
        .in("id", businessIds);

      if (businessesError) {
        throw new Error(
          `Unable to load businesses: ${businessesError.message}`
        );
      }

      if (
        !availableBusinesses ||
        availableBusinesses.length === 0
      ) {
        throw new Error(
          "No accessible business account was found."
        );
      }

      /*
       * 6. Select business.
       */
      const selectedBusiness =
        availableBusinesses.find(
          (item) =>
            item.status === "active" &&
            item.is_public === true
        ) ||
        availableBusinesses.find(
          (item) => item.status === "active"
        ) ||
        availableBusinesses[0];

      if (!selectedBusiness) {
        throw new Error(
          "No active business account was found."
        );
      }

      const businessId = selectedBusiness.id;

      /*
       * 7. Load business country.
       */
      const { data: countryData, error: countryError } =
        await supabase
          .from("countries")
          .select("code,currency_code")
          .eq("code", selectedBusiness.country_code)
          .maybeSingle();

      if (countryError) {
        throw new Error(
          `Unable to load business currency: ${countryError.message}`
        );
      }

      if (!countryData?.currency_code) {
        throw new Error(
          "The business local currency is not configured."
        );
      }

      setBusiness({
        id: selectedBusiness.id,
        name: selectedBusiness.name,
        email: selectedBusiness.email,
        country_code: selectedBusiness.country_code,
        countries: [
          {
            currency_code: countryData.currency_code,
          },
        ],
      });

      /*
       * 8. Load active advertising packages.
       *
       * These are BASE prices.
       * They are NOT displayed directly to the customer.
       */
      const {
        data: packagesData,
        error: packagesError,
      } = await supabase
        .from("ad_packages")
        .select(
          "id,name,slug,description,price,currency_code,duration_days"
        )
        .eq("is_active", true)
        .order("duration_days", {
          ascending: true,
        });

      if (packagesError) {
        throw new Error(
          `Unable to load advertising packages: ${packagesError.message}`
        );
      }

      const loadedPackages =
        (packagesData || []) as Package[];

      setPackages(loadedPackages);

      /*
       * 9. Convert every package to the business's
       * actual local currency.
       */
      await loadLocalizedPrices(
        businessId,
        loadedPackages,
        user.id
          ? (
              await supabase.auth.getSession()
            ).data.session?.access_token || ""
          : ""
      );

      /*
       * 10. Load this business's campaigns.
       */
      const {
        data: campaignsData,
        error: campaignsError,
      } = await supabase
        .from("ad_campaigns")
        .select(
          "id,business_id,package_id,name,objective,budget,currency_code,starts_at,ends_at,status,created_at"
        )
        .eq("business_id", businessId)
        .order("created_at", {
          ascending: false,
        });

      if (campaignsError) {
        throw new Error(
          `Unable to load campaigns: ${campaignsError.message}`
        );
      }

      /*
       * 11. Attach package information manually.
       */
      const campaignsWithPackages: Campaign[] =
        (campaignsData || []).map((campaign) => {
          const packageData = loadedPackages.find(
            (item) => item.id === campaign.package_id
          );

          return {
            ...campaign,
            ad_packages: packageData
              ? [packageData]
              : [],
          };
        }) as Campaign[];

      setCampaigns(campaignsWithPackages);

      /*
       * 12. Load advertisements.
       */
      const campaignIds = campaignsWithPackages.map(
        (campaign) => campaign.id
      );

      if (campaignIds.length === 0) {
        setAdvertisements([]);
        setStats([]);
        return;
      }

      const {
        data: advertisementsData,
        error: advertisementsError,
      } = await supabase
        .from("advertisements")
        .select(
          "id,campaign_id,placement_id,title,description,destination_url,status"
        )
        .in("campaign_id", campaignIds);

      if (advertisementsError) {
        throw new Error(
          `Unable to load advertisements: ${advertisementsError.message}`
        );
      }

      const loadedAdvertisements =
        (advertisementsData || []) as Advertisement[];

      setAdvertisements(loadedAdvertisements);

      /*
       * 13. Load statistics.
       */
      const advertisementIds = loadedAdvertisements.map(
        (advertisement) => advertisement.id
      );

      if (advertisementIds.length === 0) {
        setStats([]);
        return;
      }

      const { data: statsData, error: statsError } =
        await supabase
          .from("ad_daily_stats")
          .select(
            "id,advertisement_id,stat_date,impressions,clicks,contacts,conversions"
          )
          .in("advertisement_id", advertisementIds)
          .order("stat_date", {
            ascending: false,
          });

      if (statsError) {
        throw new Error(
          `Unable to load advertising statistics: ${statsError.message}`
        );
      }

      setStats((statsData || []) as Stat[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load advertising data."
      );
    } finally {
      setLoading(false);
    }
  }, [loadLocalizedPrices]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeCampaigns = useMemo(
    () =>
      campaigns.filter(
        (campaign) => campaign.status === "active"
      ),
    [campaigns]
  );

  const totalStats = useMemo(
    () =>
      stats.reduce(
        (total, item) => ({
          impressions:
            total.impressions +
            Number(item.impressions || 0),
          clicks:
            total.clicks +
            Number(item.clicks || 0),
          contacts:
            total.contacts +
            Number(item.contacts || 0),
          conversions:
            total.conversions +
            Number(item.conversions || 0),
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

  /*
   * Get localized price for a package.
   */
  const getPackagePrice = (
    packageId: string
  ): LocalizedPrice | null => {
    return localizedPrices[packageId] || null;
  };

  /*
   * Create advertising campaign and initialize payment.
   */
  const createCampaign = async () => {
    if (!business) {
      setError("Business account not found.");
      return;
    }

    if (!selectedPackage) {
      setError("Select an advertising package first.");
      return;
    }

    if (!localizedPrices[selectedPackage.id]) {
      setError(
        "The local price for this package is unavailable."
      );
      return;
    }

    if (!campaignName.trim()) {
      setError("Enter a campaign name.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (!supabaseUrl) {
        throw new Error(
          "Supabase configuration is missing."
        );
      }

      /*
       * Create campaign.
       *
       * Only the package ID is sent.
       * The backend gets the real base price itself.
       */
      const campaignResponse = await fetch(
        `${supabaseUrl}/functions/v1/create-ad-campaign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            business_id: business.id,
            package_id: selectedPackage.id,
            name: campaignName.trim(),
            objective,
          }),
        }
      );

      const campaignData =
        await campaignResponse.json();

      if (!campaignResponse.ok) {
        throw new Error(
          campaignData?.error ||
            "Unable to create advertising campaign."
        );
      }

      const campaignId =
        campaignData?.campaign?.id;

      if (!campaignId) {
        throw new Error(
          "Campaign was created but no campaign ID was returned."
        );
      }

      /*
       * Initialize payment.
       *
       * create-payment performs the server-side
       * payment calculation.
       */
      const paymentResponse = await fetch(
        `${supabaseUrl}/functions/v1/create-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            business_id: business.id,
            order_type: "ad_campaign",
            package_id: selectedPackage.id,
            campaign_id: campaignId,
          }),
        }
      );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData?.error ||
            "Unable to initialize payment."
        );
      }

      if (!paymentData?.authorization_url) {
        throw new Error(
          "Payment authorization URL was not returned."
        );
      }

      window.location.href =
        paymentData.authorization_url;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your advertising campaign."
      );

      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="advertising-page">
        <div className="advertising-loading">
          <div className="advertising-spinner" />
          <p>Loading advertising...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="advertising-page">
      <section className="advertising-header">
        <div>
          <span className="advertising-eyebrow">
            IFC BIZGROWTH
          </span>

          <h1>Advertising</h1>

          <p>
            Promote your business and put your brand in
            front of more customers.
          </p>
        </div>

        <div className="advertising-business">
          <span>Business</span>

          <strong>
            {business?.name || "Business"}
          </strong>
        </div>
      </section>

      {error && (
        <div
          className="advertising-error"
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <nav
        className="advertising-tabs"
        aria-label="Advertising navigation"
      >
        <button
          type="button"
          className={
            tab === "campaigns" ? "active" : ""
          }
          onClick={() => setTab("campaigns")}
        >
          Campaigns
        </button>

        <button
          type="button"
          className={
            tab === "active" ? "active" : ""
          }
          onClick={() => setTab("active")}
        >
          Active Campaign

          {activeCampaigns.length > 0 && (
            <span className="tab-count">
              {activeCampaigns.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={
            tab === "stats" ? "active" : ""
          }
          onClick={() => setTab("stats")}
        >
          Stats
        </button>
      </nav>

      {tab === "campaigns" && (
        <section className="advertising-content">
          <div className="section-heading">
            <div>
              <h2>
                Choose an advertising package
              </h2>

              <p>
                Select how long you want your business
                promotion to run.
              </p>
            </div>
          </div>

          {pricingLoading ? (
            <div className="empty-state">
              <h3>Calculating local prices</h3>

              <p>
                We are calculating advertising prices
                for your business location.
              </p>
            </div>
          ) : packages.length === 0 ? (
            <div className="empty-state">
              <h3>
                No advertising packages available
              </h3>

              <p>
                Advertising packages are currently
                unavailable.
              </p>
            </div>
          ) : (
            <div className="package-grid">
              {packages.map((item) => {
                const localized =
                  getPackagePrice(item.id);

                return (
                  <article
                    key={item.id}
                    className={`package-card ${
                      selectedPackage?.id === item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      localized &&
                      setSelectedPackage(item)
                    }
                  >
                    <div className="package-duration">
                      {item.duration_days}{" "}
                      {item.duration_days === 1
                        ? "day"
                        : "days"}
                    </div>

                    <h3>{item.name}</h3>

                    {item.description && (
                      <p>{item.description}</p>
                    )}

                    <strong className="package-price">
                      {localized
                        ? formatMoney(
                            localized.local_price,
                            localized.local_currency
                          )
                        : "Price unavailable"}
                    </strong>

                    <button
                      type="button"
                      disabled={!localized}
                      onClick={(event) => {
                        event.stopPropagation();

                        if (localized) {
                          setSelectedPackage(item);
                        }
                      }}
                    >
                      {selectedPackage?.id === item.id
                        ? "Selected"
                        : localized
                          ? "Select"
                          : "Unavailable"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}

          {selectedPackage &&
            localizedPrices[selectedPackage.id] && (
              <section className="campaign-form-card">
                <div className="section-heading">
                  <div>
                    <h2>Create campaign</h2>

                    <p>
                      Your campaign will be activated
                      automatically after successful
                      payment.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <label>
                    Campaign name

                    <input
                      type="text"
                      value={campaignName}
                      onChange={(event) =>
                        setCampaignName(
                          event.target.value
                        )
                      }
                      placeholder="e.g. October Business Promotion"
                      maxLength={120}
                    />
                  </label>

                  <label>
                    Objective

                    <select
                      value={objective}
                      onChange={(event) =>
                        setObjective(
                          event.target.value
                        )
                      }
                    >
                      <option value="visibility">
                        Brand visibility
                      </option>

                      <option value="customer_acquisition">
                        Customer acquisition
                      </option>

                      <option value="website_traffic">
                        Website traffic
                      </option>

                      <option value="promotion">
                        Promote an offer
                      </option>
                    </select>
                  </label>
                </div>

                <div className="campaign-summary">
                  <div>
                    <span>Package</span>

                    <strong>
                      {selectedPackage.name}
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>

                    <strong>
                      {selectedPackage.duration_days}{" "}
                      days
                    </strong>
                  </div>

                  <div>
                    <span>Price</span>

                    <strong>
                      {formatMoney(
                        localizedPrices[
                          selectedPackage.id
                        ].local_price,
                        localizedPrices[
                          selectedPackage.id
                        ].local_currency
                      )}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-button"
                  disabled={creating}
                  onClick={createCampaign}
                >
                  {creating
                    ? "Preparing payment..."
                    : "Continue to payment"}
                </button>
              </section>
            )}

          <section className="campaign-history">
            <div className="section-heading">
              <div>
                <h2>Your campaigns</h2>

                <p>
                  View your previous and current
                  advertising campaigns.
                </p>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <h3>No campaigns yet</h3>

                <p>
                  Your advertising campaigns will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="campaign-list">
                {campaigns.map((campaign) => {
                  const campaignPackage =
                    campaign.ad_packages?.[0];

                  const localized =
                    campaignPackage
                      ? getPackagePrice(
                          campaignPackage.id
                        )
                      : null;

                  return (
                    <article
                      className="campaign-row"
                      key={campaign.id}
                    >
                      <div>
                        <h3>{campaign.name}</h3>

                        <p>
                          {campaignPackage
                            ? campaignPackage.name
                            : `${campaign.budget} ${campaign.currency_code}`}
                        </p>

                        {localized && (
                          <small>
                            {formatMoney(
                              localized.local_price,
                              localized.local_currency
                            )}
                          </small>
                        )}
                      </div>

                      <div className="campaign-row-date">
                        <span>Created</span>

                        <strong>
                          {formatDate(
                            campaign.created_at
                          )}
                        </strong>
                      </div>

                      <span
                        className={`campaign-status status-${campaign.status}`}
                      >
                        {statusLabel(
                          campaign.status
                        )}
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      )}

      {tab === "active" && (
        <section className="advertising-content">
          <div className="section-heading">
            <div>
              <h2>Active campaigns</h2>

              <p>
                Monitor the advertising campaigns
                currently running.
              </p>
            </div>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="empty-state">
              <h3>No active campaign</h3>

              <p>
                Once your advertising payment is
                successful, your campaign will appear
                here automatically.
              </p>
            </div>
          ) : (
            <div className="active-campaign-grid">
              {activeCampaigns.map((campaign) => {
                const advertisement =
                  advertisements.find(
                    (item) =>
                      item.campaign_id ===
                      campaign.id
                  );

                const campaignStats =
                  advertisement
                    ? stats.filter(
                        (item) =>
                          item.advertisement_id ===
                          advertisement.id
                      )
                    : [];

                const impressions =
                  campaignStats.reduce(
                    (sum, item) =>
                      sum +
                      Number(
                        item.impressions || 0
                      ),
                    0
                  );

                const clicks =
                  campaignStats.reduce(
                    (sum, item) =>
                      sum +
                      Number(item.clicks || 0),
                    0
                  );

                return (
                  <article
                    className="active-campaign-card"
                    key={campaign.id}
                  >
                    <div className="active-campaign-top">
                      <div>
                        <span className="active-label">
                          LIVE
                        </span>

                        <h3>{campaign.name}</h3>
                      </div>

                      <span className="campaign-status status-active">
                        Active
                      </span>
                    </div>

                    <div className="active-campaign-dates">
                      <div>
                        <span>Started</span>

                        <strong>
                          {formatDate(
                            campaign.starts_at
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Ends</span>

                        <strong>
                          {formatDate(
                            campaign.ends_at
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="active-campaign-metrics">
                      <div>
                        <span>Impressions</span>

                        <strong>
                          {impressions.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Clicks</span>

                        <strong>
                          {clicks.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {tab === "stats" && (
        <section className="advertising-content">
          <div className="section-heading">
            <div>
              <h2>Advertising statistics</h2>

              <p>
                Performance data from your
                advertising campaigns.
              </p>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Impressions</span>

              <strong>
                {totalStats.impressions.toLocaleString()}
              </strong>
            </div>

            <div className="stat-card">
              <span>Clicks</span>

              <strong>
                {totalStats.clicks.toLocaleString()}
              </strong>
            </div>

            <div className="stat-card">
              <span>Contacts</span>

              <strong>
                {totalStats.contacts.toLocaleString()}
              </strong>
            </div>

            <div className="stat-card">
              <span>Conversions</span>

              <strong>
                {totalStats.conversions.toLocaleString()}
              </strong>
            </div>
          </div>

          {stats.length === 0 ? (
            <div className="empty-state">
              <h3>No statistics yet</h3>

              <p>
                Statistics will appear here after your
                advertisements receive activity.
              </p>
            </div>
          ) : (
            <div className="stats-table-wrapper">
              <table className="stats-table">
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
                  {stats.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {formatDate(item.stat_date)}
                      </td>

                      <td>
                        {Number(
                          item.impressions
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.clicks
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.contacts
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.conversions
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
  }
