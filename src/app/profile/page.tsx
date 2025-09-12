'use client'

import { useState } from 'react'
import { User, Mail, Phone, Edit } from 'lucide-react'

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: 'Lokendra Jatav',
    email: 'lokendra@example.com',
    phone: '+91 12345 67890',
    role: 'Admin',
    avatar: 'https://i.pravatar.cc/100?u=user',
  })

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-pink-600 mb-8 text-center">My Profile</h1>

      <div className="bg-white border rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-8">
        {/* Avatar */}
        <div className="relative">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-pink-200"
          />
          <button className="absolute bottom-0 right-0 bg-pink-500 text-white p-1 rounded-full hover:bg-pink-600">
            <Edit size={16} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 text-gray-700 text-lg">
            <User size={20} className="text-pink-600" />
            <span>{user.name}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Mail size={18} className="text-pink-600" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Phone size={18} className="text-pink-600" />
            <span>{user.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <span className="font-semibold text-sm bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
