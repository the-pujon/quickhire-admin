import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/redux/provider";
import { Toaster } from "sonner";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QuickHire — Admin Console",
  description:
    "Manage job listings, review applications, and grow your talent pipeline with the QuickHire admin dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="antialiased">
        <StoreProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "var(--font-geist-sans), sans-serif",
                fontSize: "13px",
              },
            }}
          />
        </StoreProvider>
      </body>
    </html>
  );
}
