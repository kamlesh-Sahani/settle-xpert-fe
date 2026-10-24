import type { Metadata } from "next";
import "./globals.css";
import AntdProviders from "@/common/utils/AntdProviders";
import MainLayout from "./MainLayout";

import { IBM_Plex_Sans } from "next/font/google";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});


import { APP_CONFIG } from "@/config/app.config";

export const metadata: Metadata = {
  title: {
    template: `${APP_CONFIG.name} | %s`,
    default: `${APP_CONFIG.name} | Employee`,
  },
  description: `${APP_CONFIG.name} - ${APP_CONFIG.description}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={ibmPlexSans.variable}>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-background text-text-primary min-h-screen"
      >
        <AntdProviders>
          <MainLayout>{children}</MainLayout>
        </AntdProviders>
      </body>
    </html>
  );
}
