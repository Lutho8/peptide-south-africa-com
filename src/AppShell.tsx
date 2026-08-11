import { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import { LastViewedProductProvider } from "@/context/LastViewedProductContext";
import FloatingProductFollower from "@/components/FloatingProductFollower";
import FloatingTrustBadge from "@/components/FloatingTrustBadge";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import CartDrawer from "@/components/CartDrawer";
import PostAddUpsellModal from "@/components/PostAddUpsellModal";
import DiscountPopup from "@/components/DiscountPopup";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import BuildYourStackPage from "@/pages/BuildYourStackPage";
import ProductPage from "@/pages/ProductPage";
import ImpressumPage from "@/pages/ImpressumPage";
import FAQPage from "@/pages/FAQPage";
import ShippingPolicyPage from "@/pages/ShippingPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import QuizFunnelPage from "@/pages/QuizFunnelPage";
import FatLossProtocolPage from "@/pages/FatLossProtocolPage";
import ResearchHubPage from "@/pages/ResearchHubPage";
import BlogIndexPage from "@/pages/BlogIndexPage";
import BlogPostPage from "@/pages/BlogPostPage";
import AffiliatePage from "@/pages/AffiliatePage";
import BuyRetatrutideSA from "@/pages/BuyRetatrutideSA";
import BuyBpc157SA from "@/pages/BuyBpc157SA";
import BuyTirzepatideSA from "@/pages/BuyTirzepatideSA";
import BuyGhkCuSA from "@/pages/BuyGhkCuSA";
import BuyTesamorelinSA from "@/pages/BuyTesamorelinSA";
import BuyMotsCSA from "@/pages/BuyMotsCSA";
import TestingPage from "@/pages/TestingPage";
import CommunityJoinPage from "@/pages/CommunityJoinPage";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import LiveActivity from "@/components/LiveActivity";
import NotFound from "@/pages/NotFound";

const RESEARCH_EDUCATION_ARTICLE =
  "/blog/retatrutide-heart-rate-clinical-trial-evidence";

// Lazy-loaded: none of these routes are part of scripts/prerender.mjs's
// route list, so they're never rendered during the SSR/prerender build
// step — safe to code-split without any risk to SEO-critical prerendered
// HTML. These are purely transactional, account, or staff-only admin
// pages that the vast majority of visitors never reach.
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage"));
const CheckoutCancelPage = lazy(() => import("@/pages/CheckoutCancelPage"));
const OrderStatusPage = lazy(() => import("@/pages/OrderStatusPage"));
const TrackOrderPage = lazy(() => import("@/pages/TrackOrderPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminIndexPage = lazy(() => import("@/pages/admin/AdminIndexPage"));
const AdminTestimonialsPage = lazy(() => import("@/pages/admin/AdminTestimonialsPage"));
const AdminFAQsPage = lazy(() => import("@/pages/admin/AdminFAQsPage"));
const AdminDiscountEligibilityPage = lazy(() => import("@/pages/admin/AdminDiscountEligibilityPage"));
const AdminSEOReindexPage = lazy(() => import("@/pages/admin/AdminSEOReindexPage"));
const AdminBatchesPage = lazy(() => import("@/pages/admin/AdminBatchesPage"));
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"));

/**
 * Router-agnostic application shell. Wrapped by <BrowserRouter> in the browser
 * (App.tsx) and by <StaticRouter> during build-time prerender (entry-server).
 * Keep this free of any Router element so both callers control routing.
 */
function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();

  if (pathname === RESEARCH_EDUCATION_ARTICLE) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background">
          <div className="container flex max-w-3xl items-center justify-between gap-6 px-4 py-5">
            <img
              src="/logo-horizontal.png"
              alt="Peptide South Africa"
              className="h-9 w-auto"
            />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Research education
            </span>
          </div>
        </header>
        <main className="min-h-screen">
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </main>
        <footer className="border-t border-border bg-background">
          <div className="container max-w-3xl px-4 py-8 text-xs leading-relaxed text-muted-foreground">
            Independent evidence summary for research education. No products,
            services, protocols or treatment pathways are offered on this page.
          </div>
        </footer>
        <Analytics />
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <LastViewedProductProvider>
            <Toaster />
            <Sonner />
            <DiscountPopup />
            <AnnouncementBar />
            <Header />
            <CartDrawer />
            <PostAddUpsellModal />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/build-your-stack" element={<BuildYourStackPage />} />
                <Route path="/5-pack" element={<BuildYourStackPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<Suspense fallback={<RouteLoadingFallback />}><CartPage /></Suspense>} />
                <Route path="/checkout" element={<Suspense fallback={<RouteLoadingFallback />}><CheckoutPage /></Suspense>} />
                <Route path="/checkout/success" element={<Suspense fallback={<RouteLoadingFallback />}><CheckoutSuccessPage /></Suspense>} />
                <Route path="/checkout/cancel" element={<Suspense fallback={<RouteLoadingFallback />}><CheckoutCancelPage /></Suspense>} />
                <Route path="/order/:id" element={<Suspense fallback={<RouteLoadingFallback />}><OrderStatusPage /></Suspense>} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/track-order" element={<Suspense fallback={<RouteLoadingFallback />}><TrackOrderPage /></Suspense>} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/refund" element={<RefundPolicyPage />} />
                <Route path="/quiz" element={<QuizFunnelPage />} />
                <Route path="/fat-loss-protocol" element={<FatLossProtocolPage />} />
                <Route path="/research" element={<ResearchHubPage />} />
                <Route path="/blog" element={<BlogIndexPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/affiliate" element={<AffiliatePage />} />
                <Route path="/buy-retatrutide-south-africa" element={<BuyRetatrutideSA />} />
                <Route path="/buy-bpc-157-south-africa" element={<BuyBpc157SA />} />
                <Route path="/buy-tirzepatide-south-africa" element={<BuyTirzepatideSA />} />
                <Route path="/buy-ghk-cu-south-africa" element={<BuyGhkCuSA />} />
                <Route path="/buy-tesamorelin-south-africa" element={<BuyTesamorelinSA />} />
                <Route path="/buy-mots-c-south-africa" element={<BuyMotsCSA />} />
                <Route path="/testing" element={<TestingPage />} />
                <Route path="/account" element={<Suspense fallback={<RouteLoadingFallback />}><AccountPage /></Suspense>} />
                <Route path="/community" element={<CommunityJoinPage />} />
                <Route path="/auth" element={<Suspense fallback={<RouteLoadingFallback />}><AuthPage /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<RouteLoadingFallback />}><AdminIndexPage /></Suspense>} />
                <Route path="/admin/testimonials" element={<Suspense fallback={<RouteLoadingFallback />}><AdminTestimonialsPage /></Suspense>} />
                <Route path="/admin/faqs" element={<Suspense fallback={<RouteLoadingFallback />}><AdminFAQsPage /></Suspense>} />
                <Route path="/admin/discounts" element={<Suspense fallback={<RouteLoadingFallback />}><AdminDiscountEligibilityPage /></Suspense>} />
                <Route path="/admin/seo-reindex" element={<Suspense fallback={<RouteLoadingFallback />}><AdminSEOReindexPage /></Suspense>} />
                <Route path="/admin/batches" element={<Suspense fallback={<RouteLoadingFallback />}><AdminBatchesPage /></Suspense>} />
                <Route path="/admin/customers" element={<Suspense fallback={<RouteLoadingFallback />}><AdminCustomersPage /></Suspense>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <StickyMobileCTA />
            <FloatingProductFollower />
            <FloatingTrustBadge />
            <CookieConsent />
            <WhatsAppButton />
            <LiveActivity />
            <Analytics />
          </LastViewedProductProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
