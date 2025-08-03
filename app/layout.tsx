// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-context";
import { CartProvider } from "@/components/cart/cart-context";
import AuthGuard from "@/components/auth/auth-guard";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/components/notifications/notification-context";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finance - SEBI Registered Research Analyst",
  description: "Your Growth, Our Priority",
  images: [{ url: "../public/imgs/9.png" }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <AuthGuard>
                <div className="min-h-screen bg-gray-50 overflow-x-hidden">
                  <main>
                    {children}
                  </main>

                </div>
                <Toaster />
              </AuthGuard>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}