import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface LoginFormProps {
  onChangeView: (view: "login" | "register" | "forgot") => void;
  onLogin: (email: string, password: string) => void;
  error?: string | null;
}

export default function LoginForm({
  onChangeView,
  onLogin,
  error,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div
      className="min-h-screen min-w-full bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,186,255,0.15) 0%, rgba(64,244,255,0.12) 25%, rgba(59,234,31,0.10) 50%, rgba(0,48,135,0.18) 100%)",
      }}
    >
      <Card className="max-w-md w-full mx-auto mt-24 shadow-lg">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Access your account to continue</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            <div className="flex justify-between items-center mt-2">
              <Button
                variant="link"
                className="px-0 text-sm"
                type="button"
                onClick={() => onChangeView("forgot")}
              >
                Forgot your password?
              </Button>
              <Button
                variant="link"
                className="px-0 text-sm"
                type="button"
                onClick={() => onChangeView("activate")}
              >
                Activate account
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
