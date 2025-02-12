import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Upload, 
  LayoutDashboard, 
  Settings, 
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Layout({ children }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-sidebar">
        <ScrollArea className="h-screen">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <Link href="/">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  InvoiceOCR
                </h2>
              </Link>
              <div className="space-y-1">
                <Link href="/">
                  <Button
                    variant={location === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-lg"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Home
                    {location === "/" && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button
                    variant={location === "/upload" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-lg"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                    {location === "/upload" && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant={location === "/dashboard" ? "secondary" : "ghost"}
                    className="w-full justify-start rounded-lg"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                    {location === "/dashboard" && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </Link>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="px-3 py-2">
              <h3 className="mb-2 px-4 text-sm font-medium">Settings</h3>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start rounded-lg">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start rounded-lg text-red-500 hover:text-red-600">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Support
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
      <main className="flex-1">
        <div className="container mx-auto py-6 px-8">
          {children}
        </div>
      </main>
    </div>
  );
}