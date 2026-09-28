import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    if (!address) {
      return NextResponse.json(
        { error: "Address is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.MAPBOX_ACCESS_TOKEN;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Geocoding service is not configured." },
        { status: 500 }
      );
    }

    const url =
      `https://api.mapbox.com/search/geocode/v6/forward` +
      `?q=${encodeURIComponent(address)}` +
      `&limit=1` +
      `&country=ng` +
      `&access_token=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to geocode the business address." },
        { status: 502 }
      );
    }

    const data = await response.json();

    const feature = data?.features?.[0];

    if (!feature) {
      return NextResponse.json(
        {
          latitude: null,
          longitude: null,
        },
        { status: 200 }
      );
    }

    const coordinates = feature?.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return NextResponse.json(
        {
          latitude: null,
          longitude: null,
        },
        { status: 200 }
      );
    }

    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90 ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          latitude: null,
          longitude: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to process the geocoding request." },
      { status: 500 }
    );
  }
  }
