import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TopBar } from "./TopBar";
import AnnouncementBanner from "../AnnouncementBanner";
import NavigateMembers from "./NavigateMembers";
import { MonthProvider } from "@/contexts/MonthContext";

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <MonthProvider>
        <div className="flex w-full min-h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 relative">
            <div className="h-16"></div> {/* Reserved space for topbar */}
            <TopBar />
            <AnnouncementBanner />
            <main className="flex-1 p-4 overflow-auto pt-2 pb-16">{children}</main>
            <NavigateMembers />
            <Toaster />
          </div>
        </div>
      </MonthProvider>
    </SidebarProvider>
  );
}
