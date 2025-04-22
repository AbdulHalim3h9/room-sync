import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TopBar } from "./TopBar";
import AnnouncementBanner from "../AnnouncementBanner";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16"></div> {/* Reserved space for topbar */}
          <TopBar />
          <AnnouncementBanner />
          <main className="flex-1 p-4 overflow-auto pt-2 pb-16">{children}</main>
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}
