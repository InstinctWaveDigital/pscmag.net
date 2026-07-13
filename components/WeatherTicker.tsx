"use client";

import { useEffect, useState } from "react";

interface CityWeather {
  name: string;
  temp: number;
}

export default function WeatherTicker() {
  const [cities, setCities] = useState<CityWeather[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/weather");
        if (!res.ok) throw new Error("Bad response");
        const data = await res.json();
        if (!cancelled) setCities(data.cities);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const interval = setInterval(load, 30 * 60 * 1000); // refresh every 30 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Fail silently rather than show stale/fake numbers
  if (error || !cities) return null;

  return (
    <span className="hidden sm:inline">
      {cities.map((c, i) => (
        <span key={c.name}>
          {c.name} {c.temp}&deg;C{i < cities.length - 1 ? " \u00B7 " : ""}
        </span>
      ))}
    </span>
  );
}