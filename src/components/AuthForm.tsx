"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

type FormType = "login" | "register" | "forgot";

interface AuthFormProps {
  type: FormType;
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(type, form);

    if (type === "login") {
      // TODO: Call /api/auth/login
      router.push("/");
    } else if (type === "register") {
      // TODO: Call /api/auth/register
      router.push("/auth/login");
    } else if (type === "forgot") {
      // TODO: Call /api/auth/forgot-password
      alert("Reset link sent!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold capitalize">
            {type === "login"
              ? "Login"
              : type === "register"
              ? "Create Account"
              : "Forgot Password"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email or Phone */}
            {type !== "forgot" && (
              <Input
                type="text"
                name="emailOrPhone"
                placeholder="Email or Phone"
                value={form.emailOrPhone}
                onChange={handleChange}
                required
              />
            )}

            {/* Password */}
            {type !== "forgot" && (
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            )}

            {/* Confirm Password */}
            {type === "register" && (
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            )}

            {/* Forgot Page */}
            {type === "forgot" && (
              <Input
                type="text"
                name="emailOrPhone"
                placeholder="Enter Email or Phone"
                value={form.emailOrPhone}
                onChange={handleChange}
                required
              />
            )}

            <Button type="submit" className="w-full">
              {type === "login"
                ? "Login"
                : type === "register"
                ? "Sign Up"
                : "Send Reset Link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
