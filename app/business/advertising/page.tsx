import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdvertisingWorkspace from "./advertising-workspace";
import "./globals.css";

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

export default async function AdvertisingPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, status, verification_status")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (businessError) {
    throw new Error("Unable to load business.");
  }

  if (!business) {
    redirect("/business/create");
  }

  const [
    packagesResult,
    placementsResult,
    campaignsResult,
  ] = await Promise.all([
    supabase
      .from("ad_packages")
      .select(
        "id, name, slug, description, price, currency_code, duration_days, is_active",
      )
      .eq("is_active", true)
      .order("price", { ascending: true }),

    supabase
      .from("ad_placements")
      .select(
        "id, name, slug, description, placement_type, is_active",
      )
      .eq("is_active", true)
      .order("name", { ascending: true }),

    supabase
      .from("ad_campaigns")
      .select(
        "id, package_id, name, objective, budget, currency_code, starts_at, ends_at, status, created_at, updated_at",
      )
      .eq("business_id", business.id)
      .order("created_at", { ascending: false }),
  ]);

  if (packagesResult.error) {
    throw new Error("Unable to load advertising packages.");
  }

  if (placementsResult.error) {
    throw new Error("Unable to load advertising placements.");
  }

  if (campaignsResult.error) {
    throw new Error("Unable to load advertising campaigns.");
  }

  const packages = (packagesResult.data ?? []) as AdPackage[];
  const placements = (placementsResult.data ?? []) as AdPlacement[];
  const campaigns = (campaignsResult.data ?? []) as Campaign[];

  const activeCampaigns = campaigns.filter(
    (campaign) => campaign.status === "active",
  ).length;

  const pendingCampaigns = campaigns.filter((campaign) =>
    ["pending_payment", "pending_review"].includes(campaign.status),
  ).length;

  const totalSpend = campaigns.reduce(
    (total, campaign) => total + Number(campaign.budget || 0),
    0,
  );

  const currencyTotals = new Map<string, number>();

  for (const campaign of campaigns) {
    const current = currencyTotals.get(campaign.currency_code) ?? 0;
    currencyTotals.set(
      campaign.currency_code,
      current + Number(campaign.budget || 0),
    );
  }

  return (
    <main className="advertising-page">
      <section className="advertising-hero">
        <div>
          <span className="advertising-eyebrow">
            BUSINESS ADVERTISING
          </span>

          <h1>Put your business in front of more people.</h1>

          <p>
            Create advertising campaigns, choose a package that fits
            your goal, and send your campaign through IFC BIZGROWTH
            for payment and review.
          </p>
        </div>

        <div className="advertising-hero-card">
          <span>Business</span>
          <strong>{business.name}</strong>

          <div className="advertising-status-row">
            <span
              className={`advertising-status advertising-status--${business.status}`}
            >
              {business.status.replaceAll("_", " ")}
            </span>

            <span
              className={`advertising-status advertising-status--${business.verification_status}`}
            >
              {business.verification_status.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </section>

      <section className="advertising-stats">
        <div className="advertising-stat-card">
          <span>Active campaigns</span>
          <strong>{activeCampaigns}</strong>
          <small>Currently running campaigns</small>
        </div>

        <div className="advertising-stat-card">
          <span>Pending campaigns</span>
          <strong>{pendingCampaigns}</strong>
          <small>Awaiting payment or review</small>
        </div>

        <div className="advertising-stat-card">
          <span>Total campaign budget</span>
          <strong>
            {currencyTotals.size === 1
              ? formatMoney(
                  totalSpend,
                  [...currencyTotals.keys()][0],
                )
              : totalSpend.toLocaleString()}
          </strong>
          <small>
            {currencyTotals.size > 1
              ? "Across multiple currencies"
              : "Based on your campaigns"}
          </small>
        </div>

        <div className="advertising-stat-card">
          <span>Available plans</span>
          <strong>{packages.length}</strong>
          <small>Plans currently available</small>
        </div>
      </section>

      <AdvertisingWorkspace
        businessId={business.id}
        businessName={business.name}
        businessStatus={business.status}
        packages={packages}
        placements={placements}
        campaigns={campaigns}
      />
    </main>
  );
}
