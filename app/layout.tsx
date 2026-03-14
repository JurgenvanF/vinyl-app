import { LanguageProvider } from "../lib/LanguageContext";
import ClientLayout from "./ClientLayout";
import ToastContainer from "./components/toast/ToastContainer";
import "./styles/main.scss";

export const metadata = {
  title: "Vinyl Vault",
  description: "Manage your vinyl collection in one central place.",
  manifest: "/manifest.json",
};

export const viewport = {
  viewport: { width: "device-width", initialScale: 1 },
  themeColor: "#e17100",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/app-logo-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <ClientLayout>{children}</ClientLayout>
          <ToastContainer />
        </LanguageProvider>
      </body>
    </html>
  );
}
