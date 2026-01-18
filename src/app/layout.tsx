import type { Metadata } from "next";
import { GameProvider } from "@/context/GameContext";
import { GlobalSalesNotification } from "@/components/notifications/GlobalSalesNotification";
import CommunicationNotifier from "@/components/notifications/CommunicationNotifier";
import HelpFloatingButton from "@/components/HelpFloatingButton";
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
        <GameProvider>
          <GlobalSalesNotification />
          <CommunicationNotifier />
          <HelpFloatingButton />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
