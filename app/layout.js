"use client"

import { Header } from "@/components/layout/Header";
import { MobileFooterNav } from "@/components/layout/mobile-footer-nav";
import { Toaster } from "sonner";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartSidebar } from "@/components/cart/CartSidebar";
import { CheckoutModal } from "@/components/cart/CheckoutModal";
import "./globals.css";

import { usePathname } from "next/navigation";

const MainLayout = ({ children }) => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  const isStorePage = pathname.startsWith("/store");

  // Don't render header/footer/sidebar for auth pages, unauthenticated landing page, or the store
  if (isAuthPage || isLandingPage || isStorePage) {
    return (
      <>
        {children}
        <CartSidebar />
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
        <Toaster position="top-center" richColors closeButton toastOptions={{ classNames: { closeButton: '!bg-white !text-black !opacity-100' } }} />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        <Header />
        <main className="flex-1 w-full">
          <div className="p-6 pb-20 md:pb-6">
            {children}
          </div>
        </main>
        <MobileFooterNav />
      </div>
      <CartSidebar />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
      <Toaster position="top-center" richColors closeButton toastOptions={{ classNames: { closeButton: '!bg-white !text-black !opacity-100' } }} />
    </>
  );
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('cricverse-theme') || 'dark';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
