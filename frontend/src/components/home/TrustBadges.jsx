import React from "react";
import { ShieldCheck, Heart, RefreshCcw, Lock } from "lucide-react";

const TrustBadges = () => {
  return (
    <section className="md:hidden py-4 px-3 bg-[#fbf5f2]">
      <div className="w-full bg-white rounded-[24px] p-4 sm:p-5 flex flex-col justify-center border border-gray-100 shadow-sm max-w-5xl mx-auto">
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-2 w-full">
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-[#d2a77a]/50 bg-[#fffdfa] flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="text-[#b58145]" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1c1c1c] leading-tight mb-0.5">Premium Quality</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-[#786b62] leading-tight">100% Combed Cotton</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-[#d2a77a]/50 bg-[#fffdfa] flex items-center justify-center shrink-0">
              <Heart size={18} className="text-[#b58145]" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1c1c1c] leading-tight mb-0.5">Comfort First</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-[#786b62] leading-tight">Soft & Breathable</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-[#d2a77a]/50 bg-[#fffdfa] flex items-center justify-center shrink-0">
              <RefreshCcw size={18} className="text-[#b58145]" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1c1c1c] leading-tight mb-0.5">Easy Returns</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-[#786b62] leading-tight">7 Days Return</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl border border-[#d2a77a]/50 bg-[#fffdfa] flex items-center justify-center shrink-0">
              <Lock size={18} className="text-[#b58145]" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1c1c1c] leading-tight mb-0.5">Secure Payment</span>
              <span className="text-[8px] sm:text-[9px] font-medium text-[#786b62] leading-tight">100% Safe Checkout</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
