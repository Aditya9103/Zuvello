import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Heart, RefreshCcw, Lock, PlayCircle, ChevronRight, ChevronLeft } from "lucide-react";

const Hero = () => {
  const video1Ref = React.useRef(null);
  const video2Ref = React.useRef(null);
  const [activeVideo, setActiveVideo] = React.useState(1);

  React.useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    v1.play().catch(() => {});
    let currentActive = 1;
    let animId;

    const checkLoop = () => {
      if (currentActive === 1) {
        if (v1.duration && v1.currentTime >= v1.duration - 0.25) {
          v2.currentTime = 0;
          v2.play().catch(() => {});
          currentActive = 2;
          setActiveVideo(2);
        }
      } else {
        if (v2.duration && v2.currentTime >= v2.duration - 0.25) {
          v1.currentTime = 0;
          v1.play().catch(() => {});
          currentActive = 1;
          setActiveVideo(1);
        }
      }
      animId = requestAnimationFrame(checkLoop);
    };

    animId = requestAnimationFrame(checkLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative w-full h-[260px] sm:h-[320px] md:h-[650px] lg:h-[700px] bg-white md:bg-[#fbf5f2] font-sans flex justify-center px-4 pt-4 md:p-0">

      {/* Mobile Card Wrapper */}
      <div className="relative w-full h-full rounded-[24px] md:rounded-none overflow-hidden bg-[#fbf5f2] shadow-sm md:shadow-none flex flex-row">

        {/* Soft Background Gradient for Left Side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf5f2]/80 via-[#fbf5f2]/40 to-transparent z-10 pointer-events-none w-full" />

        {/* Gapless Seamless Video Loop (Zero Pause on Restart) */}
        <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className={`absolute inset-0 w-full h-full z-0 object-cover object-center transition-opacity duration-300 pointer-events-none ${
            activeVideo === 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <video
          ref={video2Ref}
          muted
          playsInline
          preload="auto"
          className={`absolute inset-0 w-full h-full z-0 object-cover object-center transition-opacity duration-300 pointer-events-none ${
            activeVideo === 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>

        {/* Main Content Container */}
        <div className="relative z-20 w-full max-w-[1400px] h-full flex flex-row items-center justify-between px-5 sm:px-6 md:px-8 lg:px-12 py-4 md:py-16">

          {/* Left Side: Text Content */}
          <div className="w-[65%] md:w-[50%] flex flex-col justify-center h-full mt-4 md:mt-0">

            <div className="flex items-center gap-1.5 mb-1.5 md:mb-6">
              <span className="text-[#a57a4a] text-[8px] sm:text-[9px] md:text-[11px] font-bold tracking-[0.2em] uppercase">
                Premium Soft Toys
              </span>
              <Heart size={10} className="text-[#a57a4a] fill-current" />
            </div>

            <h1 className="text-[26px] sm:text-[34px] md:text-4xl lg:text-6xl xl:text-[75px] font-bold text-[#2a2a2a] leading-[1.1] mb-2 md:mb-6 tracking-tight font-serif w-[110%] md:w-full z-10 whitespace-nowrap">
              Made for Cuddles.<br />
              Made for <span className="text-[#b58145]">Love.</span>
            </h1>

            <p className="text-[#483d36] text-[9px] sm:text-[11px] md:text-[16px] max-w-[95%] md:max-w-sm mb-4 md:mb-10 leading-relaxed font-medium">
              Premium soft toys crafted to bring joy & warmth to every moment.
            </p>

            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 md:mb-14">
              <Link
                to="/shop"
                className="bg-[#b58145] hover:bg-[#9d6d36] text-white px-4 py-2.5 md:px-8 md:py-3.5 rounded-md font-bold text-[10px] sm:text-[11px] md:text-[14px] transition-colors shadow-lg shadow-amber-900/10 flex items-center gap-1 md:gap-2"
              >
                Shop Collection <ChevronRight size={14} className="md:w-4 md:h-4" />
              </Link>
              <button className="hidden md:flex bg-white hover:bg-gray-50 text-[#1c1c1c] px-6 py-3.5 rounded-md font-bold text-[14px] items-center gap-2 transition-colors shadow-sm">
                Explore <PlayCircle size={18} className="text-[#b58145]" />
              </button>
            </div>

            {/* Features Row (Desktop Only) */}
            <div className="hidden md:flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[#e8dfd8] pt-6 w-full max-w-2xl">

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={10} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1c1c1c] mb-0.5">Premium Quality</span>
                  <span className="text-[9px] text-[#786b62]">Super Soft & Safe</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <Heart size={10} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1c1c1c] mb-0.5">Kid Friendly</span>
                  <span className="text-[9px] text-[#786b62]">Non-Toxic Materials</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <RefreshCcw size={10} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1c1c1c] mb-0.5">Easy Returns</span>
                  <span className="text-[9px] text-[#786b62]">7 Days Return Policy</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#f1e5d9] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock size={10} className="text-[#b58145]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-[#1c1c1c] mb-0.5">Secure Payment</span>
                  <span className="text-[9px] text-[#786b62]">100% Safe Checkout</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Side: Offer Badge Only (Image is blended in background) */}
          <div className="hidden sm:flex w-[40%] md:w-[45%] h-full relative items-center justify-center">

            {/* Offer Badge (Hidden on mobile to match screenshot) */}
            <div className="hidden md:flex absolute top-[5%] md:top-[8%] right-0 md:right-[15%] z-30 bg-[#b58145] text-white w-28 h-28 md:w-[130px] md:h-[130px] rounded-full flex-col items-center justify-center shadow-2xl border-4 border-[#d8b888]/30 bg-gradient-to-br from-[#c69355] to-[#9d6d36]">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest mb-0.5">Up To</span>
              <span className="text-3xl md:text-[42px] font-black leading-none mb-1">40%</span>
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Off</span>
            </div>

          </div>

          {/* Mobile Carousel Dots */}
          <div className="md:hidden absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            <div className="w-1.5 h-1.5 rounded-full bg-black"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#b58145]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>

        </div>
      </div>

    </section>
  );
};

export default Hero;