"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Profile = {
  name: string;
  phone?: string;
  email?: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const { register, handleSubmit, reset } = useForm<Profile>();

  // ✅ Fetch profile on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (data.success) {
          setProfile(data.user);
          reset(data.user); // prefill form
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // ✅ Update profile
  const onSubmit = async (values: Profile) => {
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        alert("Profile updated successfully");
        setProfile(data.user);
        reset(data.user);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Something went wrong");
    }
  };

  if (loading) return <p className="p-4">Loading profile...</p>;

  if (!profile) return <p className="p-4 text-red-500">No profile found</p>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-2xl">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">Name</label>
          <Input type="text" {...register("name", { required: true })} />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <Input type="text" {...register("phone")} />
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <Input type="email" {...register("email")} disabled />
        </div>

        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </div>
  );
}
