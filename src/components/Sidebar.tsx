"use client";

import { useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  latitude?: number;
  longitude?: number;
}

interface SidebarProps {
  users: User[];
  onUserClick: (user: User) => void;
  selectedUserId?: string;
}

export default function Sidebar({ users, onUserClick, selectedUserId }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Smart Tracking</h1>
      </div>

      <div className="p-3">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Users ({filteredUsers.length})
          </h2>
        </div>

        <ul className="space-y-1 px-2">
          {filteredUsers.map((user) => (
            <li key={user.id}>
              <button
                onClick={() => onUserClick(user)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  selectedUserId === user.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      user.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {filteredUsers.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No users found
          </div>
        )}
      </div>
    </aside>
  );
}
