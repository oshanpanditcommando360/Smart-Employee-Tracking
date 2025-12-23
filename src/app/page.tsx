"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";

// Dynamic import for Map component (needs client-side only)
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
}

interface Boundary {
  id: string;
  name: string;
  coords: { lat: number; lng: number }[];
  color: string;
}

// Sample users for demo (will be replaced with API data)
const sampleUsers: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", isOnline: true, latitude: 28.6139, longitude: 77.209 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", isOnline: true, latitude: 28.6229, longitude: 77.219 },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", isOnline: false, latitude: 28.6039, longitude: 77.199 },
  { id: "4", name: "Alice Brown", email: "alice@example.com", isOnline: true, latitude: 28.6339, longitude: 77.229 },
  { id: "5", name: "Charlie Davis", email: "charlie@example.com", isOnline: false, latitude: 28.5939, longitude: 77.189 },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]); // Delhi
  const [mapZoom, setMapZoom] = useState(13);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setUsers(data);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch boundaries from API
  useEffect(() => {
    const fetchBoundaries = async () => {
      try {
        const response = await fetch("/api/boundaries");
        if (response.ok) {
          const data = await response.json();
          setBoundaries(data);
        }
      } catch (error) {
        console.error("Error fetching boundaries:", error);
      }
    };
    fetchBoundaries();
  }, []);

  const handleUserClick = useCallback((user: User) => {
    setSelectedUser(user);
    if (user.latitude && user.longitude) {
      setMapCenter([user.latitude, user.longitude]);
      setMapZoom(15);
    }
  }, []);

  const handleLocationSelect = useCallback((lat: number, lng: number, name: string) => {
    setMapCenter([lat, lng]);
    setMapZoom(14);
  }, []);

  const handleBoundarySave = useCallback(async (coords: { lat: number; lng: number }[], name: string) => {
    try {
      const response = await fetch("/api/boundaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, coords }),
      });

      if (response.ok) {
        const newBoundary = await response.json();
        setBoundaries((prev) => [...prev, newBoundary]);
      }
    } catch (error) {
      console.error("Error saving boundary:", error);
    }
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        users={users}
        onUserClick={handleUserClick}
        selectedUserId={selectedUser?.id}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Search */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <SearchBar onLocationSelect={handleLocationSelect} />
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {users.filter((u) => u.isOnline).length} online
          </div>
        </header>

        {/* Map Container */}
        <div className="flex-1 relative">
          <Map
            center={mapCenter}
            zoom={mapZoom}
            onBoundarySave={handleBoundarySave}
            users={users}
            boundaries={boundaries}
          />
        </div>
      </main>
    </div>
  );
}
