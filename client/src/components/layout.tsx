import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Upload, LayoutDashboard } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Layout({ children }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-sidebar border-r">
        <ScrollArea className="h-screen">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <Link href="/">
                <h2 className="mb-2 px-4 text-lg font-semibold">InvoiceOCR</h2>
              </Link>
              <div className="space-y-1">
                <Link href="/">
                  <Button
                    variant={location === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button
                    variant={location === "/upload" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant={location === "/dashboard" ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>
      <main className="flex-1 bg-background">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
