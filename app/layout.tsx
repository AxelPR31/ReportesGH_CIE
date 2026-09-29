import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { CS_AppShell } from "@/components/CS_AppShell";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reportes de Gestión Humana | CIE",
  description:
    "Generación de reportes de gestión humana del Centro de Intervención Edu-Terapéutico.",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
    shortcut: [{ url: "/icon", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${roboto.variable} flex min-h-screen flex-col antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('cs-theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <CS_AppShell>{children}</CS_AppShell>
      </body>
    </html>
  );
}
