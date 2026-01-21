import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GameProvider } from "@/context/GameContext";
import { GlobalSalesNotification } from "@/components/notifications/GlobalSalesNotification";
import CommunicationNotifier from "@/components/notifications/CommunicationNotifier";
import HelpFloatingButton from "@/components/HelpFloatingButton";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Script from "next/script";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import "./globals.css";

const appFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-app",
});

export const metadata: Metadata = {
  title: "Real Shop App V2",
  description: "Financial education game for kids",
  manifest: "/manifest.json",
  themeColor: "#6366f1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Real Shop App",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={appFont.variable}>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
          strategy="afterInteractive"
        />
        <AnimatedBackground />
        <ToastProvider>
          <GameProvider>
            <GlobalSalesNotification />
            <CommunicationNotifier />
            <HelpFloatingButton />
            {children}
          </GameProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
