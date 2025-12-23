"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

interface MapProps {
  center: [number, number];
  zoom: number;
  onBoundarySave: (coords: { lat: number; lng: number }[], name: string) => void;
  users: Array<{
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    isOnline: boolean;
  }>;
  boundaries: Array<{
    id: string;
    name: string;
    coords: { lat: number; lng: number }[];
    color: string;
  }>;
}

export default function Map({ center, zoom, onBoundarySave, users, boundaries }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const userMarkersRef = useRef<globalThis.Map<string, L.Marker>>(new globalThis.Map());
  const boundaryLayersRef = useRef<globalThis.Map<string, L.Polygon>>(new globalThis.Map());
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix default marker icons
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current).setView(center, zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Initialize feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: "#3388ff",
            weight: 2,
          },
        },
        rectangle: {
          shapeOptions: {
            color: "#3388ff",
            weight: 2,
          },
        },
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
      },
    });

    map.addControl(drawControl);

    // Handle draw events
    map.on(L.Draw.Event.DRAWSTART, () => {
      setIsDrawing(true);
    });

    map.on(L.Draw.Event.CREATED, (e: L.LeafletEvent) => {
      const event = e as L.DrawEvents.Created;
      const layer = event.layer as L.Polygon;
      drawnItems.addLayer(layer);

      const name = prompt("Enter a name for this boundary:");
      if (name) {
        const latLngs = layer.getLatLngs()[0] as L.LatLng[];
        const coords = latLngs.map((ll) => ({ lat: ll.lat, lng: ll.lng }));
        onBoundarySave(coords, name);
      } else {
        drawnItems.removeLayer(layer);
      }
      setIsDrawing(false);
    });

    map.on(L.Draw.Event.DRAWSTOP, () => {
      setIsDrawing(false);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update user markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkers = userMarkersRef.current;

    // Remove markers for users no longer in list
    currentMarkers.forEach((marker, id) => {
      if (!users.find((u) => u.id === id)) {
        map.removeLayer(marker);
        currentMarkers.delete(id);
      }
    });

    // Add or update markers for users
    users.forEach((user) => {
      if (user.latitude && user.longitude) {
        const existingMarker = currentMarkers.get(user.id);

        const icon = L.divIcon({
          className: "custom-marker",
          html: `
            <div class="relative">
              <div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                ${user.name.charAt(0).toUpperCase()}
              </div>
              <span class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              }"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (existingMarker) {
          existingMarker.setLatLng([user.latitude, user.longitude]);
          existingMarker.setIcon(icon);
        } else {
          const marker = L.marker([user.latitude, user.longitude], { icon })
            .addTo(map)
            .bindPopup(`<strong>${user.name}</strong>`);
          currentMarkers.set(user.id, marker);
        }
      }
    });
  }, [users]);

  // Update boundary polygons
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentLayers = boundaryLayersRef.current;

    // Remove old boundaries
    currentLayers.forEach((layer, id) => {
      if (!boundaries.find((b) => b.id === id)) {
        map.removeLayer(layer);
        currentLayers.delete(id);
      }
    });

    // Add new boundaries
    boundaries.forEach((boundary) => {
      if (!currentLayers.has(boundary.id)) {
        const latLngs = boundary.coords.map((c) => [c.lat, c.lng] as [number, number]);
        const polygon = L.polygon(latLngs, {
          color: boundary.color,
          weight: 2,
          fillOpacity: 0.2,
        })
          .addTo(map)
          .bindPopup(`<strong>${boundary.name}</strong>`);
        currentLayers.set(boundary.id, polygon);
      }
    });
  }, [boundaries]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {isDrawing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          Click on the map to draw boundary points. Double-click to finish.
        </div>
      )}
    </div>
  );
}
