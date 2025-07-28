"use client"
import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Truck, Package, Users, Settings, ChevronLeft, ChevronRight, LogOut, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

const navigationItems = [
  {
    id: "carrier-waterfalls",
    label: "Carrier Waterfalls",
    icon: Truck,
    href: "/carrier-waterfalls",
  },
  {
    id: "loads",
    label: "Loads",
    icon: Package,
    href: "/loads",
  },
  {
    id: "carrier-directory",
    label: "Carrier Directory",
    icon: Users,
    href: "/carrier-directory",
  },
  {
    id: "admin-settings",
    label: "Admin Settings",
    icon: Settings,
    href: "/admin-settings",
  },
  {
    id: "brand-style-guide",
    label: "Brand Style Guide",
    icon: Palette,
    href: "/brand-style-guide",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, logout } = useAuth()

  // MODO DEMO/TESTING - Logout opcional
  const handleLogout = () => {
    logout()
    // Redirigir a login solo si no estamos en modo demo
    router.push('/auth/login')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  // Determine active section based on pathname
  const getActiveSection = () => {
    if (pathname.startsWith('/carrier-waterfalls')) return 'carrier-waterfalls'
    if (pathname.startsWith('/loads')) return 'loads'
    if (pathname.startsWith('/carrier-directory')) return 'carrier-directory'
    if (pathname.startsWith('/admin-settings')) return 'admin-settings'
    if (pathname.startsWith('/brand-style-guide')) return 'brand-style-guide'
    return 'carrier-waterfalls' // default
  }

  const activeSection = getActiveSection()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && <h1 className="text-xl font-bold text-gray-900">Direct Traffic Solutions</h1>}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 h-8 w-8"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          {!sidebarCollapsed && <p className="text-sm text-gray-600 mt-1">Carrier dispatch sequences</p>}
          {/* Mostrar usuario o info de demo */}
          {currentUser ? (
            <div className="mt-2 text-xs text-gray-500">
              Logged in as <span className="font-semibold">{currentUser.name}</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <strong>DEMO MODE</strong> - Full access without authentication
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100",
                    sidebarCollapsed && "justify-center px-2",
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              )
            })}
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <Button 
              variant="outline" 
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors", 
                !sidebarCollapsed && "justify-start"
              )} 
              onClick={handleLogout}
              title={!currentUser ? "Demo mode - Logout optional" : "Logout"}
            >
              <LogOut className="h-4 w-4" />
              {!sidebarCollapsed && <span className="ml-2 font-medium">Log out</span>}
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">DTS Carrier Matching</h1>
            <p className="text-sm text-gray-600 mt-1">Carrier matching and logistics operations</p>
            {/* Mostrar usuario o info de demo en móvil */}
            {currentUser ? (
              <div className="mt-2 text-xs text-gray-500">
                Logged in as <span className="font-semibold">{currentUser.name}</span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                <strong>DEMO MODE</strong> - Full access without authentication
              </div>
            )}
          </div>
          <nav className="p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors" 
                onClick={handleLogout}
                title={!currentUser ? "Demo mode - Logout optional" : "Logout"}
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 font-medium">Log out</span>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
