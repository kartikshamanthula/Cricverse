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

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccessDenied } from "@/components/layout/AccessDenied";

const MainLayout = ({ children }) => {
  const { isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isSpectateMode = typeof window !== "undefined" && (window.location.search.includes("spectate=true") || pathname.startsWith("/spectate/"));
  
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLandingPage = pathname === "/";
  const isStorePage = pathname.startsWith("/store");

  // Dynamic Route Check
  const getRequiredPermission = (path) => {
    if (path.startsWith("/teams")) return "teamModule";
    if (path.startsWith("/tournaments")) return "tournamentModule";
    if (path.startsWith("/matches")) return "matchModule";
    if (path.startsWith("/store")) return "storeModule";
    return null;
  };

  const requiredPerm = getRequiredPermission(pathname);
  const isBlocked = user && user.role !== "admin" && requiredPerm && user.permissions?.[requiredPerm] === false;

  // If user is already authenticated and lands on /login or /register, immediately replace with dashboard
  useEffect(() => {
    if (!loading && user && isAuthPage && typeof window !== "undefined") {
      window.location.replace(user.role === "admin" ? "/admin/products" : "/dashboard");
    }
  }, [user, loading, isAuthPage]);

  // Lock browser backward navigation on root dashboard so clicking Back cannot navigate back to login
  useEffect(() => {
    if (!loading && user && typeof window !== "undefined") {
      if (pathname === "/dashboard" || pathname === "/admin/products") {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
          window.history.pushState(null, "", window.location.href);
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
      }
    }
  }, [user, loading, pathname]);

  // Single-Module Auto-Redirection
  useEffect(() => {
    if (!loading && user && user.role !== "admin" && user.permissions) {
      const p = user.permissions;
      const hasDashboard = p.liveScoreInternational !== false || p.liveScoreLocal !== false;
      const hasTeams = p.teamModule !== false;
      const hasMatches = p.matchModule !== false;
      const hasTournaments = p.tournamentModule !== false;
      const hasStore = p.storeModule !== false;

      // If store is their only access
      if (hasStore && !hasDashboard && !hasTeams && !hasMatches && !hasTournaments) {
        if (pathname === "/dashboard" || pathname === "/") {
          router.replace("/store");
        }
      }
    }
  }, [user, loading, pathname, router]);

  // If user is already logged in and attempts to view an auth page, render nothing while redirecting
  if (!loading && user && isAuthPage) {
    return null;
  }

  // Don't render header/footer/sidebar for auth pages, unauthenticated landing page, store page, or spectate modes
  if (isAuthPage || isLandingPage || isStorePage || isSpectateMode || !user) {
    if (isStorePage && isBlocked) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <AccessDenied moduleName="store" />
        </div>
      );
    }
    return (
      <>
        <div className={(isSpectateMode || !user) && pathname.startsWith("/matches/") ? "p-4 sm:p-6 max-w-7xl mx-auto w-full" : ""}>
          {children}
        </div>
        <CartSidebar />
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
        <Toaster position="top-center" richColors closeButton toastOptions={{ classNames: { closeButton: '!bg-white !text-black !opacity-100' } }} />
      </>
    );
  }

  if (isBlocked) {
    return (
      <>
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1 w-full flex items-center justify-center p-6">
            <AccessDenied moduleName={requiredPerm.replace("Module", "")} />
          </main>
          <MobileFooterNav />
        </div>
        <CartSidebar />
        <Toaster position="top-center" richColors closeButton />
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
