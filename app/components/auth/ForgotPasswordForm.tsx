import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React from "react";

export default function ForgotPasswordForm({ onChangeView }: { onChangeView: (view: "login" | "register" | "forgot") => void }) {
  return (
    <Card className="max-w-md w-full mx-auto mt-24 shadow-lg">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>We'll send you a link to reset your password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" autoComplete="email" />
        </div>
        <div className="flex justify-between items-center mt-2">
          <Button variant="link" className="px-0 text-sm" type="button" onClick={() => onChangeView("login")}>Back to sign in</Button>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Send Link</Button>
      </CardFooter>
    </Card>
  );
} 