"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./discover.module.css";

type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  country_code: string;
  verification_status: string;
  is_featured: boolean;
  city: string | null;
  state_region: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export default function DiscoverClient({
  businesses,
}: {
  businesses: Business[];
}) {
  const [position, setPosition] =
    useState<Coordinates | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        setPosition({
          latitude:
            location.coords.latitude,
          longitude:
            location.coords.longitude,
        });
      },
      () => {
        setPosition(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  }, []);

  const nearbyBusinesses = useMemo(() => {
    if (!position) {
      return businesses
        .filter(
          (business) =>
            business.latitude !== null &&
            business.longitude !== null
        )
        .slice(0, 6);
    }

    return businesses
      .filter(
        (business) =>
          business.latitude !== null &&
          business.longitude !== null
      )
      .map((business) => ({
        business,
        distance: calculateDistance(
          position.latitude,
          position.longitude,
          business.latitude!,
          business.longitude!
        ),
      }))
      .sort(
        (a, b) =>
          a.distance - b.distance
      )
      .slice(0, 6)
      .map((item) => item.business);
  }, [businesses, position]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>
          <span>⌖</span>
          Businesses Near You
        </h2>

        <Link href="/near-me">
          See All <span>›</span>
        </Link>
      </div>

      {nearbyBusinesses.length > 0 ? (
        <div className={styles.businessScroller}>
          {nearbyBusinesses.map(
            (business) => (
              <BusinessCard
                key={business.id}
                business={business}
              />
            )
          )}
        </div>
      ) : (
        <div className={styles.emptyNearby}>
          <span>⌖</span>

          <strong>
            No nearby businesses yet
          </strong>

          <p>
            Businesses with public locations
            will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  const location = [
    business.city,
    business.state_region,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={styles.businessCard}>
      <div className={styles.businessImage}>
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={`${business.name} logo`}
          />
        ) : (
          <span>
            {getInitials(business.name)}
          </span>
        )}

        {business.verification_status ===
          "approved" && (
          <span
            className={
              styles.verifiedBadge
            }
          >
            ✓ Verified
          </span>
        )}
      </div>

      <div className={styles.businessContent}>
        <h3>{business.name}</h3>

        <p className={styles.businessDescription}>
          {business.description ||
            "Business information available on IFC BIZGROWTH."}
        </p>

        <p className={styles.businessLocation}>
          <span>●</span>
          {location ||
            business.country_code}
        </p>

        <div className={styles.cardActions}>
          <Link
            href={`/businesses/${business.slug}`}
            className={styles.viewButton}
          >
            View Business
          </Link>

          <Link
            href={`/businesses/${business.slug}`}
            className={styles.cardIconButton}
          >
            ⌕
          </Link>
        </div>
      </div>
    </article>
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "B";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;

  const dLat =
    toRadians(lat2 - lat1);

  const dLon =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
}

function toRadians(value: number) {
  return (
    (value * Math.PI) / 180
  );
  }
