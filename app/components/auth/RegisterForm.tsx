import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

interface RegisterFormProps {
  onChangeView: (view: "login" | "register" | "forgot") => void;
  onRegister: (email: string, password: string, name: string) => void;
  error?: string | null;
}

export default function RegisterForm({ onChangeView, onRegister, error }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    onRegister(email, password, name);
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-24 shadow-lg">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="Your name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" placeholder="••••••••" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          <div className="flex justify-between items-center mt-2">
            <Button variant="link" className="px-0 text-sm" type="button" onClick={() => onChangeView("login")}>Already have an account? Sign in</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">Sign Up</Button>
        </CardFooter>
      </form>
    </Card>
  );
} 