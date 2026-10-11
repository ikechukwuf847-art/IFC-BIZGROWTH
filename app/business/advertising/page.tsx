"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  campaign_id: string | null;
  stat_date: string;
  impressions: number;
  clicks: number;
  contacts: number;
  conversions: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  website_clicks: number;
};

type DateRange = "today" | "7d" | "30d" | "all";

type Analytics = {
  impressions: number;
  clicks: number;
  contacts: number;
  conversions: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  website_clicks: number;
  reach: number | null;
  event_count: number;
  daily_stats: Stat[];
};

type Tab = "campaigns" | "active" | "stats";

const supabase = createSupabaseBrowserClient();

const EMPTY_ANALYTICS: Analytics = {
  impressions: 0,
  clicks: 0,
  contacts: 0,
  conversions: 0,
  whatsapp_clicks: 0,
  phone_clicks: 0,
  website_clicks: 0,
  reach: null,
  event_count: 0,
  daily_stats: [],
};

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
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function statusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDateBounds(range: DateRange) {
  if (range === "all") {
    return {
      startDate: null as string | null,
      endDate: null as string | null,
    };
  }

  const now = new Date();
  const endDate = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (range === "7d") {
    start.setDate(start.getDate() - 6);
  } else if (range === "30d") {
    start.setDate(start.getDate() - 29);
  }

  const startDate = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, "0"),
    String(start.getDate()).padStart(2, "0"),
  ].join("-");

  return { startDate, endDate };
}

function sumStats(items: Stat[]) {
  return items.reduce(
    (total, item) => ({
      impressions: total.impressions + Number(item.impressions || 0),
      clicks: total.clicks + Number(item.clicks || 0),
      contacts: total.contacts + Number(item.contacts || 0),
      conversions: total.conversions + Number(item.conversions || 0),
      whatsapp_clicks:
        total.whatsapp_clicks + Number(item.whatsapp_clicks || 0),
      phone_clicks:
        total.phone_clicks + Number(item.phone_clicks || 0),
      website_clicks:
        total.website_clicks + Number(item.website_clicks || 0),
    }),
    {
      impressions: 0,
      clicks: 0,
      contacts: 0,
      conversions: 0,
      whatsapp_clicks: 0,
      phone_clicks: 0,
      website_clicks: 0,
    }
  );
}

function calculateCTR(impressions: number, clicks: number) {
  if (impressions <= 0) {
    return "0.00%";
  }

  return `${((clicks / impressions) * 100).toFixed(2)}%`;
}

export default function AdvertisingPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);

  const [localizedPrices, setLocalizedPrices] = useState<
    Record<string, LocalizedPrice>
  >({});

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  const [analytics, setAnalytics] =
    useState<Analytics>(EMPTY_ANALYTICS);

  const [analyticsError, setAnalyticsError] = useState("");
  const [range, setRange] = useState<DateRange>("30d");
  const [tab, setTab] = useState<Tab>("campaigns");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [error, setError] = useState("");

  const [selectedPackage, setSelectedPackage] =
    useState<Package | null>(null);

  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("visibility");

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
          throw new Error("Supabase configuration is missing.");
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
          throw new Error("Invalid pricing response from the server.");
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
    setAnalyticsError("");

    try {
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

      const {
        data: memberships,
        error: membershipError,
      } = await supabase
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

      const {
        data: ownedBusinesses,
        error: ownerError,
      } = await supabase
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

      if (!availableBusinesses?.length) {
        throw new Error("No accessible business account was found.");
      }

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
        throw new Error("No active business account was found.");
      }

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
        countries: [{ currency_code: countryData.currency_code }],
      });

      const {
        data: packagesData,
        error: packagesError,
      } = await supabase
        .from("ad_packages")
        .select(
          "id,name,slug,description,price,currency_code,duration_days"
        )
        .eq("is_active", true)
        .order("duration_days", { ascending: true });

      if (packagesError) {
        throw new Error(
          `Unable to load advertising packages: ${packagesError.message}`
        );
      }

      const loadedPackages = (packagesData || []) as Package[];
      setPackages(loadedPackages);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      await loadLocalizedPrices(
        selectedBusiness.id,
        loadedPackages,
        session.access_token
      );

      const {
        data: campaignsData,
        error: campaignsError,
      } = await supabase
        .from("ad_campaigns")
        .select(
          "id,business_id,package_id,name,objective,budget,currency_code,starts_at,ends_at,status,created_at"
        )
        .eq("business_id", selectedBusiness.id)
        .order("created_at", { ascending: false });

      if (campaignsError) {
        throw new Error(
          `Unable to load campaigns: ${campaignsError.message}`
        );
      }

      const campaignsWithPackages: Campaign[] =
        (campaignsData || []).map((campaign) => {
          const packageData = loadedPackages.find(
            (item) => item.id === campaign.package_id
          );

          return {
            ...campaign,
            ad_packages: packageData ? [packageData] : [],
          };
        }) as Campaign[];

      setCampaigns(campaignsWithPackages);

      const campaignIds = campaignsWithPackages.map(
        (campaign) => campaign.id
      );

      if (campaignIds.length === 0) {
        setAdvertisements([]);
        setStats([]);
        setAnalytics(EMPTY_ANALYTICS);
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

      const advertisementIds = loadedAdvertisements.map(
        (advertisement) => advertisement.id
      );

      if (advertisementIds.length === 0) {
        setStats([]);
        setAnalytics(EMPTY_ANALYTICS);
        return;
      }

      const {
        data: statsData,
        error: statsError,
      } = await supabase
        .from("ad_daily_stats")
        .select(
          "id,advertisement_id,campaign_id,stat_date,impressions,clicks,contacts,conversions,whatsapp_clicks,phone_clicks,website_clicks"
        )
        .in("advertisement_id", advertisementIds)
        .order("stat_date", { ascending: false });

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

  const loadAnalytics = useCallback(async () => {
    if (!business?.id) {
      return;
    }

    setRefreshing(true);
    setAnalyticsError("");

    try {
      const { startDate, endDate } = getDateBounds(range);

      const { data, error: rpcError } = await supabase.rpc(
        "get_advertising_analytics",
        {
          p_business_id: business.id,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data || typeof data !== "object") {
        throw new Error("The analytics response is invalid.");
      }

      const result = data as Partial<Analytics>;

      setAnalytics({
        impressions: Number(result.impressions || 0),
        clicks: Number(result.clicks || 0),
        contacts: Number(result.contacts || 0),
        conversions: Number(result.conversions || 0),
        whatsapp_clicks: Number(result.whatsapp_clicks || 0),
        phone_clicks: Number(result.phone_clicks || 0),
        website_clicks: Number(result.website_clicks || 0),
        reach:
          result.reach === null || result.reach === undefined
            ? null
            : Number(result.reach),
        event_count: Number(result.event_count || 0),
        daily_stats: Array.isArray(result.daily_stats)
          ? result.daily_stats.map((item) => ({
              ...item,
              impressions: Number(item.impressions || 0),
              clicks: Number(item.clicks || 0),
              contacts: Number(item.contacts || 0),
              conversions: Number(item.conversions || 0),
              whatsapp_clicks: Number(item.whatsapp_clicks || 0),
              phone_clicks: Number(item.phone_clicks || 0),
              website_clicks: Number(item.website_clicks || 0),
            }))
          : [],
      });
    } catch (err) {
      setAnalyticsError(
        err instanceof Error
          ? err.message
          : "Unable to load advertising analytics."
      );
    } finally {
      setRefreshing(false);
    }
  }, [business?.id, range]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading && business?.id) {
      void loadAnalytics();
    }
  }, [loading, business?.id, loadAnalytics]);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status === "active"),
    [campaigns]
  );

  const { startDate, endDate } = useMemo(
    () => getDateBounds(range),
    [range]
  );

  const filteredStats = useMemo(
    () =>
      stats.filter((item) => {
        if (startDate && item.stat_date < startDate) {
          return false;
        }

        if (endDate && item.stat_date > endDate) {
          return false;
        }

        return true;
      }),
    [stats, startDate, endDate]
  );

  const totalStats = useMemo(
    () => sumStats(filteredStats),
    [filteredStats]
  );

  const getPackagePrice = (
    packageId: string
  ): LocalizedPrice | null => {
    return localizedPrices[packageId] || null;
  };

  const handleRefresh = async () => {
    await loadData();
  };

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
      setError("The local price for this package is unavailable.");
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
        throw new Error("Supabase configuration is missing.");
      }

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

      const campaignData = await campaignResponse.json();

      if (!campaignResponse.ok) {
        throw new Error(
          campaignData?.error ||
            "Unable to create advertising campaign."
        );
      }

      const campaignId = campaignData?.campaign?.id;

      if (!campaignId) {
        throw new Error(
          "Campaign was created but no campaign ID was returned."
        );
      }

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

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          paymentData?.error || "Unable to initialize payment."
        );
      }

      if (!paymentData?.authorization_url) {
        throw new Error(
          "Payment authorization URL was not returned."
        );
      }

      window.location.href = paymentData.authorization_url;
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
            Promote your business and put your brand in front
            of more customers.
          </p>
        </div>

        <div className="advertising-business">
          <span>Business</span>
          <strong>{business?.name || "Business"}</strong>
        </div>
      </section>

      {error && (
        <div className="advertising-error" role="alert">
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
          className={tab === "campaigns" ? "active" : ""}
          onClick={() => setTab("campaigns")}
        >
          Campaigns
        </button>

        <button
          type="button"
          className={tab === "active" ? "active" : ""}
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
          className={tab === "stats" ? "active" : ""}
          onClick={() => setTab("stats")}
        >
          Stats
        </button>
      </nav>

      {tab === "campaigns" && (
        <section className="advertising-content">
          <div className="section-heading">
            <div>
              <h2>Choose an advertising package</h2>
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
                We are calculating advertising prices for your
                business location.
              </p>
            </div>
          ) : packages.length === 0 ? (
            <div className="empty-state">
              <h3>No advertising packages available</h3>
              <p>
                Advertising packages are currently unavailable.
              </p>
            </div>
          ) : (
            <div className="package-grid">
              {packages.map((item) => {
                const localized = getPackagePrice(item.id);

                return (
                  <article
                    key={item.id}
                    className={`package-card ${
                      selectedPackage?.id === item.id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      if (localized) {
                        setSelectedPackage(item);
                      }
                    }}
                  >
                    <div className="package-duration">
                      {item.duration_days}{" "}
                      {item.duration_days === 1 ? "day" : "days"}
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
                      Your campaign will be activated automatically
                      after successful payment.
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
                        setCampaignName(event.target.value)
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
                        setObjective(event.target.value)
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
                    <strong>{selectedPackage.name}</strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {selectedPackage.duration_days} days
                    </strong>
                  </div>

                  <div>
                    <span>Price</span>
                    <strong>
                      {formatMoney(
                        localizedPrices[selectedPackage.id].local_price,
                        localizedPrices[selectedPackage.id].local_currency
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
                  View your previous and current advertising
                  campaigns.
                </p>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <h3>No campaigns yet</h3>
                <p>
                  Your advertising campaigns will appear here.
                </p>
              </div>
            ) : (
              <div className="campaign-list">
                {campaigns.map((campaign) => {
                  const campaignPackage =
                    campaign.ad_packages?.[0];

                  const localized = campaignPackage
                    ? getPackagePrice(campaignPackage.id)
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
                          {formatDate(campaign.created_at)}
                        </strong>
                      </div>

                      <span
                        className={`campaign-status status-${campaign.status}`}
                      >
                        {statusLabel(campaign.status)}
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
                Monitor the advertising campaigns currently
                running.
              </p>
            </div>
          </div>

          {activeCampaigns.length === 0 ? (
            <div className="empty-state">
              <h3>No active campaign</h3>
              <p>
                Once your advertising payment is successful,
                your campaign will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="active-campaign-grid">
              {activeCampaigns.map((campaign) => {
                const campaignAds = advertisements.filter(
                  (item) => item.campaign_id === campaign.id
                );

                const campaignAdIds = new Set(
                  campaignAds.map((item) => item.id)
                );

                const campaignStats = filteredStats.filter(
                  (item) =>
                    campaignAdIds.has(item.advertisement_id)
                );

                const totals = sumStats(campaignStats);

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
                          {formatDate(campaign.starts_at)}
                        </strong>
                      </div>

                      <div>
                        <span>Ends</span>
                        <strong>
                          {formatDate(campaign.ends_at)}
                        </strong>
                      </div>
                    </div>

                    <div className="active-campaign-metrics">
                      <div>
                        <span>Impressions</span>
                        <strong>
                          {totals.impressions.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>Clicks</span>
                        <strong>
                          {totals.clicks.toLocaleString()}
                        </strong>
                      </div>

                      <div>
                        <span>CTR</span>
                        <strong>
                          {calculateCTR(
                            totals.impressions,
                            totals.clicks
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Contacts</span>
                        <strong>
                          {totals.contacts.toLocaleString()}
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
                Review your campaign reach and advertising
                performance.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              {loading || refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          <div className="stats-filters" aria-label="Statistics date range">
            {(
              [
                ["today", "Today"],
                ["7d", "Last 7 days"],
                ["30d", "Last 30 days"],
                ["all", "All time"],
              ] as const
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={range === value ? "active" : ""}
                aria-pressed={range === value}
                onClick={() => setRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {analyticsError && (
            <div className="advertising-error" role="alert">
              <span>
                Analytics could not be loaded: {analyticsError}
              </span>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <span>Unique reach</span>
              <strong>
                {analytics.reach === null
                  ? "Unavailable"
                  : analytics.reach.toLocaleString()}
              </strong>
              <small>Distinct visitors recorded</small>
            </div>

            <div className="stat-card">
              <span>Impressions</span>
              <strong>
                {analytics.impressions.toLocaleString()}
              </strong>
              <small>Total recorded ad views</small>
            </div>

            <div className="stat-card">
              <span>Clicks</span>
              <strong>
                {analytics.clicks.toLocaleString()}
              </strong>
              <small>
                CTR:{" "}
                {calculateCTR(
                  analytics.impressions,
                  analytics.clicks
                )}
              </small>
            </div>

            <div className="stat-card">
              <span>Contacts</span>
              <strong>
                {analytics.contacts.toLocaleString()}
              </strong>
              <small>Recorded contact actions</small>
            </div>

            <div className="stat-card">
              <span>Conversions</span>
              <strong>
                {analytics.conversions.toLocaleString()}
              </strong>
              <small>Recorded conversions</small>
            </div>

            <div className="stat-card">
              <span>WhatsApp clicks</span>
              <strong>
                {analytics.whatsapp_clicks.toLocaleString()}
              </strong>
              <small>WhatsApp contact actions</small>
            </div>

            <div className="stat-card">
              <span>Phone clicks</span>
              <strong>
                {analytics.phone_clicks.toLocaleString()}
              </strong>
              <small>Phone contact actions</small>
            </div>

            <div className="stat-card">
              <span>Website clicks</span>
              <strong>
                {analytics.website_clicks.toLocaleString()}
              </strong>
              <small>Visits to business websites</small>
            </div>
          </div>

          {filteredStats.length === 0 ? (
            <div className="empty-state">
              <h3>No statistics for this period</h3>
              <p>
                Statistics will appear when your advertisements
                begin receiving recorded activity.
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
                    <th>CTR</th>
                    <th>Contacts</th>
                    <th>WhatsApp</th>
                    <th>Phone</th>
                    <th>Website</th>
                    <th>Conversions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStats.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.stat_date)}</td>

                      <td>
                        {Number(item.impressions || 0).toLocaleString()}
                      </td>

                      <td>
                        {Number(item.clicks || 0).toLocaleString()}
                      </td>

                      <td>
                        {calculateCTR(
                          Number(item.impressions || 0),
                          Number(item.clicks || 0)
                        )}
                      </td>

                      <td>
                        {Number(item.contacts || 0).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.whatsapp_clicks || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.phone_clicks || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.website_clicks || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {Number(
                          item.conversions || 0
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
