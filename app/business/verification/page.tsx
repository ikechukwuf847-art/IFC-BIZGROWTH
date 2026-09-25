"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VerificationWorkspace from "./verification-workspace";
import "./verification.css";
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

export default function BusinessVerificationPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [verification, setVerification] =
    useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: businessData, error: businessError } =
          await supabase
            .from("businesses")
            .select(
              "id,name,status,verification_status"
            )
            .eq("owner_id", user.id)
            .limit(1)
            .maybeSingle();

        if (businessError) throw businessError;

        if (!businessData) {
          router.replace("/business/create");
          return;
        }

        if (
          businessData.status !== "active" &&
          businessData.status !== "approved"
        ) {
          router.replace("/business/dashboard");
          return;
        }

        const { data: verificationData, error: verificationError } =
          await supabase
            .from("business_verifications")
            .select(
              `
                id,
                business_id,
                submitted_by,
                business_name,
                registration_number,
                registration_country,
                verification_type,
                document_urls,
                notes,
                status,
                reviewed_by,
                reviewed_at,
                rejection_reason,
                created_at,
                updated_at
              `
            )
            .eq("business_id", businessData.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (verificationError) throw verificationError;

        if (!mounted) return;

        setBusiness(businessData);
        setVerification(verificationData ?? null);
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load verification information."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="verification-page">
        <div className="verification-loading">
          <div className="verification-spinner" />
          <p>Loading verification...</p>
        </div>
      </main>
    );
  }

  if (error || !business) {
    return (
      <main className="verification-page">
        <div className="verification-error">
          <div className="verification-error-icon">!</div>
          <h1>Verification unavailable</h1>
          <p>
            {error || "We could not load your business verification."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="verification-page">
      <VerificationWorkspace
        business={business}
        initialVerification={verification}
      />
    </main>
  );
}
