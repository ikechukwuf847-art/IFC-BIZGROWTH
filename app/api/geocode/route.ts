import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const address = searchParams.get("address")?.trim();
    const city = searchParams.get("city")?.trim();
    const state = searchParams.get("state")?.trim();
    const country = searchParams.get("country")?.trim();
    const countryCode = searchParams.get("countryCode")?.trim();

    if (!address && !city && !state && !country) {
      return NextResponse.json(
        { error: "At least one address field is required." },
        { status: 400 }
      );
    }

    const token = process.env.MAPBOX_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "Mapbox access token is not configured." },
        { status: 500 }
      );
    }

    /*
     * Build the search query from the business's actual location.
     *
     * IMPORTANT:
     * Do NOT hardcode country=ng.
     * IFC BIZGROWTH supports businesses across Africa.
     */
    const queryParts = [
      address,
      city,
      state,
      country,
    ].filter(Boolean);

    const query = queryParts.join(", ");

    if (!query) {
      return NextResponse.json(
        { error: "A valid location could not be created from the supplied fields." },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://api.mapbox.com/search/geocode/v6/forward"
    );

    url.searchParams.set("q", query);
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "1");
    url.searchParams.set("language", "en");

    /*
     * Only send Mapbox's country restriction when we actually have
     * a valid country code.
     *
     * Example:
     * NG → Nigeria
     * GH → Ghana
     * KE → Kenya
     */
    if (countryCode) {
      url.searchParams.set("country", countryCode.toLowerCase());
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Mapbox geocoding error:", errorText);

      return NextResponse.json(
        { error: "Geocoding service request failed." },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        {
          error: "Location could not be found.",
          query,
        },
        { status: 404 }
      );
    }

    const feature = data.features[0];

    /*
     * Mapbox coordinates are:
     *
     * [longitude, latitude]
     */
    const coordinates = feature.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2 ||
      typeof coordinates[0] !== "number" ||
      typeof coordinates[1] !== "number"
    ) {
      return NextResponse.json(
        { error: "Geocoding returned invalid coordinates." },
        { status: 502 }
      );
    }

    const longitude = coordinates[0];
    const latitude = coordinates[1];

    /*
     * Basic coordinate validation.
     */
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        { error: "Geocoding returned invalid coordinate values." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
      place_name: feature.properties?.full_address ?? feature.place_name ?? null,
      query,
    });
  } catch (error) {
    console.error("Geocoding route error:", error);

    return NextResponse.json(
      { error: "An unexpected geocoding error occurred." },
      { status: 500 }
    );
  }
        }
