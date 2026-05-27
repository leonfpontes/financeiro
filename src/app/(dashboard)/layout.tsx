import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import SessionProvider from "@/components/SessionProvider";
import { AppTourProvider } from "@/components/tour/AppTourProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <SessionProvider session={session}>
      <AppTourProvider>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <TopBar />
        <Sidebar />
        <Box component="main" sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          <Box sx={{ maxWidth: 1280, margin: "0 auto", padding: { xs: "68px 16px 80px", md: "28px 32px" } }}>
            {children}
          </Box>
        </Box>
        <BottomNav />
        </Box>
      </AppTourProvider>
    </SessionProvider>
  );
}
