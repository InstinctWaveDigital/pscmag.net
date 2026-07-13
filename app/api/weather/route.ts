import { NextResponse } from "next/server";

export const revalidate = 1800; // cache for 30 minutes

const CITIES = [
  { name: "Lagos", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", lat: -1.2921, lon: 36.8219 },
  { name: "Accra", lat: 5.6037, lon: -0.187 },
];

export async function GET() {
  try {
    const results = await Promise.all(
      CITIES.map(async (city) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m&timezone=auto`;
        const res = await fetch(url, { next: { revalidate: 1800 } });
        if (!res.ok) throw new Error(`Failed weather fetch for ${city.name}`);
        const data = await res.json();
        return { name: city.name, temp: Math.round(data.current.temperature_2m) };
      })
    );
    return NextResponse.json({ cities: results });
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 502 });
  }
}