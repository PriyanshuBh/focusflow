import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusFlow | Professional Pomodoro & Kanban Sanctuary",
  description:
    "Elevate your productivity with FocusFlow. A minimalist deep-work dashboard featuring a Pomodoro timer, Kanban task management, and built-in ambient focus sounds.",
  keywords: [
    "Pomodoro Timer",
    "Kanban Board",
    "Deep Work Tool",
    "Productivity Dashboard",
    "Ambient Focus Sounds",
    "Brown Noise Timer",
    "Task Management",
    "FocusFlow",
    "Next.js Productivity App",
  ],
  authors: [{ name: "Priyanshu Bharti" }],
  openGraph: {
    title: "FocusFlow | Deep Work Sanctuary",
    description:
      "Master your workflow with the ultimate Pomodoro and Kanban integration.",
    url: "https://focusflow-pb.vercel.app",
    siteName: "FocusFlow",
    images: [
      {
        url: "https://focusflow-pb.vercel.app/og-image.png", // Ensure this image exists in /public
        width: 1200,
        height: 630,
        alt: "FocusFlow Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusFlow | Professional Productivity Hub",
    description:
      "Stop multitasking. Start flowing. Pomodoro + Kanban + Atmosphere Engine.",
    images: ["https://focusflow-pb.vercel.app/og-image.png"],
    creator: "@PriyanshuBh",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-indigo-500/30`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "FocusFlow",
              operatingSystem: "Web",
              applicationCategory: "ProductivityApplication",
              description:
                "Professional Pomodoro timer and Kanban board for deep work.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
