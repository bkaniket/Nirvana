"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";

type Location = {
  country: string;
  state?: string;
};

export default function WorldMap({ locations }: { locations: Location[] }) {
  const globeRef = useRef<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [darkMode, setDarkMode] = useState(true);

  // 🌍 Load world GeoJSON
  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
    )
      .then((res) => res.json())
      .then((data) => setCountries(data.features));
  }, []);

  useEffect(() => {
  if (!window.WebGLRenderingContext) {
    alert("WebGL not supported on this browser");
  }
}, []);

  // 🎥 Camera + lighting fix
  useEffect(() => {
    if (!globeRef.current) return;

    // Camera
    globeRef.current.pointOfView(
      { lat: 20, lng: 0, altitude: 2.2 },
      0
    );

    const controls = globeRef.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = false;

    // 💡 LIGHTING (THIS FIXES BLACK GLOBE)
    const scene = globeRef.current.scene();

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
  }, []);

  // 📊 Country counts
  const countryCounts: Record<string, number> = {};
  locations.forEach((l) => {
    if (!l.country) return;
    const key = l.country.toLowerCase();
    countryCounts[key] = (countryCounts[key] || 0) + 1;
  });

return (
  <div
    className="relative w-full h-[320px] rounded-xl overflow-hidden"
    style={{
      background: "linear-gradient(180deg, #1E2F5E 0%, #0F1C3D 100%)",
      boxShadow: "0 10px 30px rgba(30,47,94,0.4)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {/* 🌗 Theme toggle */}
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="absolute z-10 top-3 right-3 px-3 py-1.5 text-xs rounded-full font-medium transition-all"
      style={{
        backgroundColor: "#1E2F5E",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {darkMode ? "🌙 Dark" : "☀️ Light"}
    </button>

    {/* Subtle glow */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        boxShadow: "inset 0 0 60px rgba(0,196,255,0.15)",
      }}
    />

    <Globe
      ref={globeRef}
      width={500}
      height={320}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl={
        darkMode
          ? "https://unpkg.com/three-globe/example/img/earth-dark.jpg"
          : "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      }
      bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
      polygonsData={countries}
      polygonAltitude={(d: any) => {
        const count =
          countryCounts[d.properties.name.toLowerCase()] || 0;
        return 0.01 + Math.min(count * 0.04, 0.4);
      }}
      polygonCapColor={(d: any) =>
        countryCounts[d.properties.name.toLowerCase()]
          ? "#4FD1FF"
          : darkMode
          ? "rgba(90,110,160,0.35)"
          : "rgba(200,210,230,0.7)"
      }
      polygonSideColor={() => "rgba(0,0,0,0.25)"}
      polygonStrokeColor={() => "rgba(255,255,255,0.15)"}
      polygonLabel={(d: any) => {
        const name = d.properties.name;
        const count = countryCounts[name.toLowerCase()] || 0;
        return `
          <div style="
            text-align:center;
            padding:6px 8px;
            background:#1E2F5E;
            color:#fff;
            border-radius:6px;
            font-size:12px;
          ">
            <strong>${name}</strong><br/>
            Buildings: ${count}
          </div>
        `;
      }}
    />
  </div>
);
}