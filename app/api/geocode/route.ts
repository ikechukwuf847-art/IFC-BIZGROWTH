import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const address = searchParams.get("address")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";
    const state = searchParams.get("state")?.trim() || "";
    const country = searchParams.get("country")?.trim() || "";
    const countryCode = searchParams.get("countryCode")?.trim() || "";

    if (!address && !city && !state && !country) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one location field is required.",
        },
        { status: 400 }
      );
    }

    const token = process.env.MAPBOX_ACCESS_TOKEN;

    if (!token) {
      console.error("MAPBOX_ACCESS_TOKEN is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "Mapbox access token is not configured.",
        },
        { status: 500 }
      );
    }

    const query = [address, city, state, country]
      .filter(Boolean)
      .join(", ");

    /*
     * Mapbox v6 Search API
     */
    const url = new URL(
      "https://api.mapbox.com/search/geocode/v6/forward"
    );

    url.searchParams.set("q", query);
    url.searchParams.set("access_token", token);
    url.searchParams.set("limit", "1");
    url.searchParams.set("language", "en");

    /*
     * IMPORTANT:
     * Do not restrict every search to Nigeria.
     *
     * If a country code is supplied, use that country.
     */
    if (countryCode) {
      url.searchParams.set(
        "country",
        countryCode.toLowerCase()
      );
    }

    console.log("Geocoding query:", query);
    console.log(
      "Geocoding country:",
      countryCode || "not restricted"
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Mapbox HTTP error:",
        response.status,
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          error: "Mapbox geocoding request failed.",
          details: responseText,
        },
        { status: 502 }
      );
    }

    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "Mapbox returned non-JSON response:",
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          error: "Mapbox returned an invalid response.",
          details: responseText,
        },
        { status: 502 }
      );
    }

    if (
      !data ||
      !Array.isArray(data.features) ||
      data.features.length === 0
    ) {
      console.error(
        "No Mapbox results:",
        JSON.stringify(data)
      );

      return NextResponse.json(
        {
          success: false,
          error: "Location could not be found.",
          query,
        },
        { status: 404 }
      );
    }

    const feature = data.features[0];

    const coordinates =
      feature?.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      console.error(
        "Invalid Mapbox coordinates:",
        JSON.stringify(feature)
      );

      return NextResponse.json(
        {
          success: false,
          error: "Mapbox returned invalid coordinates.",
        },
        { status: 502 }
      );
    }

    /*
     * Mapbox always returns:
     *
     * [longitude, latitude]
     */
    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      console.error(
        "Invalid coordinate values:",
        coordinates
      );

      return NextResponse.json(
        {
          success: false,
          error: "Mapbox returned invalid coordinate values.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,

      /*
       * Database order:
       * latitude
       * longitude
       */
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),

      place_name:
        feature?.properties?.full_address ||
        feature?.place_name ||
        null,

      query,
    });
  } catch (error) {
    console.error("Geocoding route error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected geocoding error occurred.",
      },
      { status: 500 }
    );
  }
        }
