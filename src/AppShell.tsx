import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
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
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import PreferredSourcesButton from "@/components/PreferredSourcesButton";

// Every route is a separate client chunk. Build-time rendering waits for all
// lazy modules before writing complete SEO HTML for public routes.
const HomePage = lazy(() => import("@/pages/HomePage"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const BuildYourStackPage = lazy(() => import("@/pages/BuildYourStackPage"));
const ProductPage = lazy(() => import("@/pages/ProductPage"));
const ImpressumPage = lazy(() => import("@/pages/ImpressumPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const ShippingPolicyPage = lazy(() => import("@/pages/ShippingPolicyPage"));
const RefundPolicyPage = lazy(() => import("@/pages/RefundPolicyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const QuizFunnelPage = lazy(() => import("@/pages/QuizFunnelPage"));
const FatLossProtocolPage = lazy(() => import("@/pages/FatLossProtocolPage"));
const ResearchHubPage = lazy(() => import("@/pages/ResearchHubPage"));
const BlogIndexPage = lazy(() => import("@/pages/BlogIndexPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const EditorialPolicyPage = lazy(() => import("@/pages/EditorialPolicyPage"));
const AffiliatePage = lazy(() => import("@/pages/AffiliatePage"));
const BuyRetatrutideSA = lazy(() => import("@/pages/BuyRetatrutideSA"));
const BuyBpc157SA = lazy(() => import("@/pages/BuyBpc157SA"));
const BuyTirzepatideSA = lazy(() => import("@/pages/BuyTirzepatideSA"));
const BuyGhkCuSA = lazy(() => import("@/pages/BuyGhkCuSA"));
const BuyTesamorelinSA = lazy(() => import("@/pages/BuyTesamorelinSA"));
const BuyMotsCSA = lazy(() => import("@/pages/BuyMotsCSA"));
const TestingPage = lazy(() => import("@/pages/TestingPage"));
const CoaRedirectPage = lazy(() => import("@/pages/CoaRedirectPage"));
const CommunityJoinPage = lazy(() => import("@/pages/CommunityJoinPage"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("@/pages/CheckoutSuccessPage"));
const CheckoutCancelPage = lazy(() => import("@/pages/CheckoutCancelPage"));
const OrderStatusPage = lazy(() => import("@/pages/OrderStatusPage"));
const EftInstructionsPage = lazy(() => import("@/pages/EftInstructionsPage"));
const TrackOrderPage = lazy(() => import("@/pages/TrackOrderPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminIndexPage = lazy(() => import("@/pages/admin/AdminIndexPage"));
const AdminTestimonialsPage = lazy(() => import("@/pages/admin/AdminTestimonialsPage"));
const AdminFAQsPage = lazy(() => import("@/pages/admin/AdminFAQsPage"));
const AdminSEOReindexPage = lazy(() => import("@/pages/admin/AdminSEOReindexPage"));
const AdminBatchesPage = lazy(() => import("@/pages/admin/AdminBatchesPage"));
const AdminCustomersPage = lazy(() => import("@/pages/admin/AdminCustomersPage"));
const AdminLifecyclePage = lazy(() => import("@/pages/admin/AdminLifecyclePage"));

/**
 * Router-agnostic application shell. Wrapped by <BrowserRouter> in the browser
 * (App.tsx) and by <StaticRouter> during build-time prerender (entry-server).
 * Keep this free of any Router element so both callers control routing.
 */
function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export default function AppShell() {
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
              <Suspense fallback={<RouteLoadingFallback />}>
                <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/build-your-stack" element={<BuildYourStackPage />} />
                <Route path="/5-pack" element={<BuildYourStackPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/eft-instructions" element={<EftInstructionsPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
                <Route path="/order/:id" element={<OrderStatusPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
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
                <Route path="/editorial-policy" element={<EditorialPolicyPage />} />
                <Route path="/affiliate" element={<AffiliatePage />} />
                <Route path="/buy-retatrutide-south-africa" element={<BuyRetatrutideSA />} />
                <Route path="/buy-bpc-157-south-africa" element={<BuyBpc157SA />} />
                <Route path="/buy-tirzepatide-south-africa" element={<BuyTirzepatideSA />} />
                <Route path="/buy-ghk-cu-south-africa" element={<BuyGhkCuSA />} />
                <Route path="/buy-tesamorelin-south-africa" element={<BuyTesamorelinSA />} />
                <Route path="/buy-mots-c-south-africa" element={<BuyMotsCSA />} />
                <Route path="/testing" element={<TestingPage />} />
                <Route path="/reviews" element={<ReviewsPage />} />
                <Route path="/v/:code" element={<CoaRedirectPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/community" element={<CommunityJoinPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminIndexPage />} />
                <Route path="/admin/testimonials" element={<AdminTestimonialsPage />} />
                <Route path="/admin/faqs" element={<AdminFAQsPage />} />
                <Route path="/admin/seo-reindex" element={<AdminSEOReindexPage />} />
                <Route path="/admin/batches" element={<AdminBatchesPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />
                <Route path="/admin/lifecycle" element={<AdminLifecyclePage />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <div className="container px-4 py-8">
              <PreferredSourcesButton />
            </div>
            <Footer />
            <StickyMobileCTA />
            <FloatingProductFollower />
            <FloatingTrustBadge />
            <CookieConsent />
            <WhatsAppButton />
            <Analytics />
          </LastViewedProductProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
