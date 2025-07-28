'use client'

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDemoConfig, useIsDemoMode } from '@/hooks/use-demo-config';
import { Settings, Info, Database } from 'lucide-react';

export function DemoModeIndicator() {
  const { isDemoMode, toggleDemoMode } = useDemoConfig();
  const isActuallyDemoMode = useIsDemoMode();
  const [showDetails, setShowDetails] = useState(false);

  if (!isActuallyDemoMode) {
    return null; // No mostrar nada si no estamos en modo demo
  }

  return (
    <>
      {/* Indicador flotante */}
      <div className="fixed top-4 right-4 z-50">
        <Badge 
          variant="secondary" 
          className="bg-yellow-100 text-yellow-800 border-yellow-300 px-3 py-1 cursor-pointer hover:bg-yellow-200 transition-colors"
          onClick={() => setShowDetails(true)}
        >
          <Database className="h-3 w-3 mr-1" />
          DEMO MODE
        </Badge>
      </div>

      {/* Modal de detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-yellow-600" />
              Demo Mode Active
            </DialogTitle>
            <DialogDescription>
              You are currently using the application in demo mode with sample data.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">What does this mean?</p>
                  <ul className="text-yellow-700 space-y-1">
                    <li>• All data is stored locally in your browser</li>
                    <li>• Sample carriers, loads, and waterfalls are available</li>
                    <li>• No backend connection required</li>
                    <li>• Perfect for testing and demonstrations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">Demo Features Available:</h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>8 Sample Carriers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>8 Sample Loads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>5 Sample Waterfalls</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Full CRUD Operations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Data Persistence (localStorage)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowDetails(false)} 
                className="w-full"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DemoModeSettings() {
  const { isDemoMode, toggleDemoMode, setDemoMode } = useDemoConfig();
  const isActuallyDemoMode = useIsDemoMode();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Demo Configuration
        </CardTitle>
        <CardDescription>
          Configure demo mode settings for development and testing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="demo-mode">Demo Mode</Label>
            <div className="text-sm text-muted-foreground">
              Use sample data instead of backend
            </div>
          </div>
          <Switch
            id="demo-mode"
            checked={isDemoMode}
            onCheckedChange={toggleDemoMode}
          />
        </div>
        
        <div className="pt-4 border-t">
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Environment:</span>
              <Badge variant={isActuallyDemoMode ? "secondary" : "default"}>
                {isActuallyDemoMode ? "Demo" : "Production"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Data Source:</span>
              <span className="text-muted-foreground">
                {isActuallyDemoMode ? "localStorage" : "Backend API"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
