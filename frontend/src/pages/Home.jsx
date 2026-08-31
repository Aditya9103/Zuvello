import React from 'react';
import Hero from '../components/Hero';
import Categories from '../components/categories';
import TrustBadges from '../components/home/TrustBadges';
import NewArrivals from '../components/home/NewArrivals';
import ShopByReels from '../components/home/ShopByReels';
import BestSellers from '../components/home/BestSellers';
import InstagramFeed from '../components/home/InstagramFeed';
import PromoBanners from '../components/home/PromoBanners';
import SEO from '../components/SEO';

const Home = () => {
  return (
    <main className="bg-white min-h-screen">
      <SEO
        title="Home"
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": "https://www.zuvello.in/",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.zuvello.in/shop?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Zuvello",
            "url": "https://www.zuvello.in",
            "logo": "https://www.zuvello.in/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-8873405595",
              "contactType": "customer service",
              "areaServed": "IN",
              "availableLanguage": "en"
            },
            "sameAs": [
              "https://www.instagram.com/zuvello.in/",
              "https://www.facebook.com/zuvello.in/"
            ]
          }
        ]}
      />
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Shop by Category */}
      <Categories />
      <TrustBadges />

      {/* 3. New Arrivals */}
      <NewArrivals />

      {/* 4. Best Sellers Section */}
      <BestSellers />

      {/* Shop By Reels */}
      <ShopByReels />

      {/* 5. Instagram Feed */}
      <InstagramFeed />

      {/* 6. Promo Banners & Features */}
      <PromoBanners />
    </main>
  );
};

export default Home;
