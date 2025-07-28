import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { authService } from "@/services";

export default function ActivateAccountForm({ onChangeView }: { onChangeView: (view: "login" | "register" | "forgot" | "activate") => void }) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    
    console.log('🔓 [ACTIVATE-FORM] Iniciando activación de cuenta...');
    
    try {
      await authService.activateAccount({ token, password });
      setSuccess(true);
      console.log('🎉 [ACTIVATE-FORM] Cuenta activada exitosamente');
    } catch (err: any) {
      console.error('❌ [ACTIVATE-FORM] Error en activación:', err);
      setError(err.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-24 shadow-lg">
      <CardHeader>
        <CardTitle>Activate Account</CardTitle>
        <CardDescription>Enter your activation token and set your password</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="token">Activation Token</Label>
            <Input id="token" type="text" placeholder="Enter your token" value={token} onChange={e => setToken(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Set your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">Account activated! You can now sign in.</div>}
          <div className="flex justify-between items-center mt-2">
            <Button variant="link" className="px-0 text-sm" type="button" onClick={() => onChangeView("login")}>Back to sign in</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={loading}>{loading ? "Activating..." : "Activate Account"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
} 