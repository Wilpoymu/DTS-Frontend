"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, Bell, Shield, Database, Activity } from "lucide-react"

export default function AdminSettings() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    carrierUpdates: true,
    systemMaintenance: true,
  })

  const [systemSettings, setSystemSettings] = useState({
    autoMatching: true,
    waterfallTimeout: "30",
    maxRetries: "3",
    defaultMargin: "15",
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Settings
          </CardTitle>
          <CardDescription>Configure system settings and preferences</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Advanced system settings and performance tuning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Carrier Matching</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Matching</Label>
                      <p className="text-sm text-gray-600">Enable automatic carrier matching</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoMatching}
                      onCheckedChange={(checked) => setSystemSettings((prev) => ({ ...prev, autoMatching: checked }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="waterfall-timeout">Waterfall Timeout (seconds)</Label>
                    <Input
                      id="waterfall-timeout"
                      value={systemSettings.waterfallTimeout}
                      onChange={(e) => setSystemSettings((prev) => ({ ...prev, waterfallTimeout: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-retries">Max Retries</Label>
                    <Input
                      id="max-retries"
                      value={systemSettings.maxRetries}
                      onChange={(e) => setSystemSettings((prev) => ({ ...prev, maxRetries: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="default-margin">Default Margin (%)</Label>
                    <Input
                      id="default-margin"
                      value={systemSettings.defaultMargin}
                      onChange={(e) => setSystemSettings((prev) => ({ ...prev, defaultMargin: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">System Status</p>
                          <p className="text-lg font-bold text-green-600">Healthy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Database</p>
                          <p className="text-lg font-bold text-blue-600">98% Uptime</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">API Response</p>
                          <p className="text-lg font-bold text-orange-600">145ms</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              {/* New System Configuration Fields */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Parameters</h3>
                
                {/* Polling frequency for loads */}
                <div className="space-y-2">
                  <Label className="font-medium" htmlFor="polling-frequency">
                    Load polling frequency
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Define how often loads are automatically refreshed.
                  </p>
                  <Select defaultValue="5">
                    <SelectTrigger id="polling-frequency" className="w-48">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Every 5 minutes</SelectItem>
                      <SelectItem value="10">Every 10 minutes</SelectItem>
                      <SelectItem value="15">Every 15 minutes</SelectItem>
                      <SelectItem value="30">Every 30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Default value for Response Window */}
                <div className="space-y-2">
                  <Label className="font-medium" htmlFor="response-window-default">
                    Default Response Window (minutes)
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    This value will be used as the default response time when adding a carrier.
                  </p>
                  <Input
                    id="response-window-default"
                    type="number"
                    min="1"
                    defaultValue="30"
                    className="w-32"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              <Separator />

              {/* SMTP Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SMTP Configuration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Edit the SMTP connection parameters for sending email notifications.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">SMTP Server</Label>
                    <Input id="smtp-host" placeholder="smtp.example.com" defaultValue="smtp.example.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Port</Label>
                    <Input id="smtp-port" type="number" placeholder="587" defaultValue="587" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-user">User</Label>
                    <Input id="smtp-user" placeholder="user@example.com" defaultValue="user@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input id="smtp-password" type="password" placeholder="••••••••" defaultValue="" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="smtp-from">Sender (From)</Label>
                    <Input id="smtp-from" placeholder="noreply@example.com" defaultValue="noreply@example.com" />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline">Save SMTP Configuration</Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
                <Button variant="outline">Export Configuration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
