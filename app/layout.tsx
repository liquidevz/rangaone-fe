// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-context";
import { CartProvider } from "@/components/cart/cart-context";
import AuthGuard from "@/components/auth/auth-guard";
import { Toaster } from "@/components/ui/toaster";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Rangaone Finwala - Portfolio Management",
  description: "Your trusted partner in financial growth and portfolio management",
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
        </AuthProvider>
      </body>
    </html>
  );
}