import type { Metadata } from "next";
import { GameProvider } from "@/context/GameContext";
import { GlobalSalesNotification } from "@/components/notifications/GlobalSalesNotification";
import CommunicationNotifier from "@/components/notifications/CommunicationNotifier";
import HelpFloatingButton from "@/components/HelpFloatingButton";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Script from "next/script";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import "./globals.css";

export const metadata: Metadata = {
  title: "Real Shop App V2",
  description: "Financial education game for kids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
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
