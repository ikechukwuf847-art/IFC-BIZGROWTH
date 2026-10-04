"use client";

import { useEffect, useState } from "react";

export default function LocationLabel() {
  const [location, setLocation] =
    useState("Your Location");

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `/api/reverse-geocode?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
          );

          if (!response.ok) {
            return;
          }

          const data = await response.json();

          if (
            typeof data.city === "string" &&
            data.city.trim()
          ) {
            setLocation(data.city.trim());
          }
        } catch {
          // Keep "Your Location"
        }
      },
      () => {
        // Keep "Your Location"
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, []);

  return <span>{location}</span>;
            }
