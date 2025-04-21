import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TopBar } from "./TopBar";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 overflow-auto">{children}</main>
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}
