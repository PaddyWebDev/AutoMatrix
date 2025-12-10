import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { calculateDistanceKm } from "@/hooks/distance";

/**
 * GET /api/service-centers/nearest?lat=<latitude>&lng=<longitude>
 * Returns the top 5 nearest service centers based on the user's current coordinates.
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Extract latitude and longitude from query parameters
    const latitudeParam = searchParams.get("lat");
    const longitudeParam = searchParams.get("lon");
    if (!latitudeParam || !longitudeParam) {
      return new NextResponse("Longitude & Latitude are required", {
        status: 400,
      });
    }

    const userLatitude = parseFloat(latitudeParam);
    const userLongitude = parseFloat(longitudeParam);

    // Fetch all service centers from the database
    const serviceCenters = await prisma.serviceCenter.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    });

    // Add distance property to each service center
    const serviceCentersWithDistance = serviceCenters.map((center) => {
      if (!center.latitude || !center.longitude) {
        return { ...center, distanceKm: Infinity };
      }
      const distanceKm = calculateDistanceKm(
        userLatitude,
        userLongitude,
        center.latitude,
        center.longitude
      );
      return { ...center, distanceKm };
    });

    // Sort by nearest distance and take top 5
    const nearestServiceCenters = serviceCentersWithDistance
      .filter((c) => c.distanceKm !== Infinity)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);

    return NextResponse.json({
      service_center_data: nearestServiceCenters,
    });
  } catch (error) {
    console.error("Error fetching nearest service centers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
