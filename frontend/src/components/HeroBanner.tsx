import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section className="relative min-h-[650px] overflow-hidden bg-[#f5f9e9] sm:min-h-[700px] xl:min-h-[720px]">
      {/* Hero background image */}
      <img
        src="/images/hero-groceries.png"
        alt="Fresh vegetables, fruits and groceries"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Soft overlay behind the text */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#f7fbe9]/95 via-[#f7fbe9]/80 to-transparent" />

      {/* Subtle overall overlay */}
      <div className="absolute inset-0 -z-10 bg-white/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#f8fbe9]/80 via-[#f8fbe9]/40 to-transparent" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[650px] max-w-[1600px] items-center px-6 pb-12 pt-32 sm:min-h-[700px] sm:px-12 sm:pt-36 xl:min-h-[720px] xl:px-16">
        <div className="max-w-[700px]">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-green-800/10 bg-white/70 px-4 py-2 text-sm font-semibold text-brand shadow-sm backdrop-blur-sm">
            <Leaf size={18} className="text-brand" />
            Fresh & Healthy Everyday
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#064b2b] sm:text-5xl xl:text-6xl">
            Fresh groceries,
            <br />
            <span className="text-[#16884a]">delivered</span> to your door.
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[590px] text-base leading-8 text-neutral-700 sm:text-lg">
            From fresh vegetables and juicy fruits to local Baladi meats, dairy,
            bakery products, and everyday essentials, Rakan's brings quality
            groceries and fresh ingredients straight to your home.
          </p>

          {/* CTA and Trust Indicators */}
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 rounded-full bg-[#07843f] px-8 py-4 text-base font-bold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-1 hover:bg-[#066d35]"
            >
              Shop Fresh Products
              <ArrowRight size={20} />
            </Link>

            <div className="hidden h-12 w-px bg-green-900/25 sm:block" />

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-5 sm:gap-7">
              <div className="flex items-center gap-2">
                <Leaf size={29} className="shrink-0 text-brand" />
                <span className="text-sm font-bold leading-tight text-[#173e27]">
                  100%
                  <br />
                  Fresh
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ShieldCheck size={29} className="shrink-0 text-brand" />
                <span className="text-sm font-bold leading-tight text-[#173e27]">
                  Secure
                  <br />
                  Shopping
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Truck size={32} className="shrink-0 text-brand" />
                <span className="text-sm font-bold leading-tight text-[#173e27]">
                  Fast
                  <br />
                  Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
