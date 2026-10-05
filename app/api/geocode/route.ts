import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    const countryCode =
      typeof body.countryCode === "string"
        ? body.countryCode.trim().toLowerCase()
        : "";

    if (!address) {
      return NextResponse.json(
        {
          error: "Business address is required.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.MAPBOX_ACCESS_TOKEN;

    if (!apiKey) {
      console.error(
        "MAPBOX_ACCESS_TOKEN is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Location services are not configured. Please contact support.",
        },
        { status: 500 }
      );
    }

    /*
     * Keep the original working Mapbox endpoint.
     *
     * The only important change is that country is no longer
     * hardcoded to Nigeria.
     */
    const params = new URLSearchParams();

    params.set("q", address);
    params.set("limit", "1");
    params.set("language", "en");
    params.set(
      "access_token",
      apiKey
    );

    /*
     * Restrict the search to the business's actual country
     * when a country code is supplied.
     *
     * NG = Nigeria
     * GH = Ghana
     * KE = Kenya
     * ZA = South Africa
     * etc.
     */
    if (countryCode) {
      params.set("country", countryCode);
    }

    const url =
      "https://api.mapbox.com/search/geocode/v6/forward?" +
      params.toString();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      let mapboxError = "";

      try {
        const errorData = await response.json();

        mapboxError =
          typeof errorData?.message === "string"
            ? errorData.message
            : "";
      } catch {
        // Ignore invalid error response.
      }

      console.error("Mapbox geocoding failed:", {
        status: response.status,
        message: mapboxError,
        countryCode,
        address,
      });

      return NextResponse.json(
        {
          error:
            "Unable to determine the business location right now. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const feature = data?.features?.[0];

    if (!feature) {
      return NextResponse.json(
        {
          error:
            "We could not find this business address. Please check the address, city, and state and try again.",
        },
        { status: 422 }
      );
    }

    const coordinates =
      feature?.geometry?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length < 2
    ) {
      return NextResponse.json(
        {
          error:
            "We could not determine coordinates for this business address. Please check the address and try again.",
        },
        { status: 422 }
      );
    }

    /*
     * Mapbox returns:
     *
     * [longitude, latitude]
     */
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
      console.error(
        "Mapbox returned invalid coordinates:",
        coordinates
      );

      return NextResponse.json(
        {
          error:
            "The location service returned invalid coordinates. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      latitude: Number(latitude.toFixed(7)),
      longitude: Number(longitude.toFixed(7)),
      placeName:
        typeof feature?.properties?.full_address === "string"
          ? feature.properties.full_address
          : typeof feature?.place_name === "string"
          ? feature.place_name
          : null,
    });
  } catch (error) {
    console.error("Geocoding route error:", error);

    return NextResponse.json(
      {
        error:
          "Unable to process the business location right now. Please try again.",
      },
      { status: 500 }
    );
  }
    }
