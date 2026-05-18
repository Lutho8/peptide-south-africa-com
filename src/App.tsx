import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import CartDrawer from "@/components/CartDrawer";
import AgeVerificationModal from "@/components/AgeVerificationModal";
import DiscountPopup from "@/components/DiscountPopup";
import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import CheckoutSuccessPage from "@/pages/CheckoutSuccessPage";
import CheckoutCancelPage from "@/pages/CheckoutCancelPage";
import OrderStatusPage from "@/pages/OrderStatusPage";
import AboutPage from "@/pages/AboutPage";
import FAQPage from "@/pages/FAQPage";
import ShippingPolicyPage from "@/pages/ShippingPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import QuizFunnelPage from "@/pages/QuizFunnelPage";
import FatLossProtocolPage from "@/pages/FatLossProtocolPage";
import ResearchHubPage from "@/pages/ResearchHubPage";
import ClinicianPage from "@/pages/ClinicianPage";
import AuthPage from "@/pages/AuthPage";
import AdminTestimonialsPage from "@/pages/admin/AdminTestimonialsPage";
import AdminIndexPage from "@/pages/admin/AdminIndexPage";
import AdminFAQsPage from "@/pages/admin/AdminFAQsPage";
import AdminDiscountEligibilityPage from "@/pages/admin/AdminDiscountEligibilityPage";
import AdminSEOReindexPage from "@/pages/admin/AdminSEOReindexPage";
import CookieConsent from "@/components/CookieConsent";
import WhatsAppButton from "@/components/WhatsAppButton";
import LiveActivity from "@/components/LiveActivity";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <AgeVerificationModal />
            <DiscountPopup />
            <AnnouncementBar />
            <Header />
            <CartDrawer />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/de" element={<HomePage />} />
                <Route path="/za" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/de/shop" element={<ShopPage />} />
                <Route path="/za/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/de/product/:slug" element={<ProductPage />} />
                <Route path="/za/product/:slug" element={<ProductPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
                <Route path="/order/:id" element={<OrderStatusPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/shipping" element={<ShippingPolicyPage />} />
                <Route path="/refund" element={<RefundPolicyPage />} />
                <Route path="/quiz" element={<QuizFunnelPage />} />
                <Route path="/fat-loss-protocol" element={<FatLossProtocolPage />} />
                <Route path="/research" element={<ResearchHubPage />} />
                <Route path="/clinician" element={<ClinicianPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminIndexPage />} />
                <Route path="/admin/testimonials" element={<AdminTestimonialsPage />} />
                <Route path="/admin/faqs" element={<AdminFAQsPage />} />
                <Route path="/admin/discounts" element={<AdminDiscountEligibilityPage />} />
                <Route path="/admin/seo-reindex" element={<AdminSEOReindexPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <StickyMobileCTA />
            <CookieConsent />
            <WhatsAppButton />
            <LiveActivity />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
