import React, { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/navigation/BottomNav'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import { API_BASE_URL } from './api'

// Lazy Load Pages to optimize initial load time
const AboutUs = lazy(() => import('./pages/AboutUs'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const FAQs = lazy(() => import('./pages/FAQs'))
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'))
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const HelpCenter = lazy(() => import('./pages/HelpCenter'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Shop = lazy(() => import('./pages/Shop'))
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage'))
const BestSellersPage = lazy(() => import('./pages/BestSellersPage'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const OffersPage = lazy(() => import('./pages/OffersPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const AddressPage = lazy(() => import('./pages/AddressPage'))
const PaymentPage = lazy(() => import('./pages/PaymentPage'))
const SuccessPage = lazy(() => import('./pages/SuccessPage'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ReelsPage = lazy(() => import('./pages/ReelsPage'))

// Loading Spinner for Suspense Fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-[#cf7e28] animate-spin"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Silent wake-up call to spin up backend on Render
    fetch(`${API_BASE_URL}/wakeup`)
      .then(res => res.json())
      .then(data => console.log('Wake-up call successful:', data))
      .catch((err) => console.log('Wake-up call failed/ignored:', err)); // Fire and forget
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Routes (no navbar/footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Reels Route (Standalone overlay) */}
          <Route path="/reels/:id" element={<ReelsPage />} />
          <Route path="/reels" element={<ReelsPage />} />

          {/* Public Routes (with navbar/footer) */}
          <Route path="/*" element={
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-grow">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                    <Route path="/best-sellers" element={<BestSellersPage />} />
                    <Route path="/offers" element={<OffersPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/checkout/address" element={<AddressPage />} />
                    <Route path="/checkout/payment" element={<PaymentPage />} />
                    <Route path="/checkout/success" element={<SuccessPage />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/faqs" element={<FAQs />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogDetail />} />
                  </Routes>
                </Suspense>
              </div>
              <Footer />
              <BottomNav />
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
