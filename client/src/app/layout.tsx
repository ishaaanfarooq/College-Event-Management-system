import type { Metadata } from "next";
import "@/index.css";
import Providers from "@/components/Providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "CollegeEMS — Event Management System",
  description: "Manage, discover and apply to college events with CollegeEMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-sans bg-[#0d0d1a] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
