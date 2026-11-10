// import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
// import { Link } from "react-router-dom";

// export function HeroBanner() {
//   return (
//     <section className="relative isolate min-h-[650px] overflow-hidden bg-[#080F23] sm:min-h-[700px] xl:min-h-[720px]">
//       {/* Background image */}
//       <img
//         src="/images/hero-groceries.png"
//         alt="Fresh vegetables, fruits and groceries"
//         className="absolute inset-0 h-full w-full object-cover object-center"
//       />

//       {/* Dark navy overlay */}
//       <div className="absolute inset-0 bg-[#080F23]/75" />

//       {/* Subtle green ambient light */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

//       {/* Hero content */}
//       <div className="relative mx-auto flex min-h-[650px] max-w-[1600px] items-center px-5 py-20 sm:min-h-[700px] sm:px-12 xl:min-h-[720px] xl:px-16">
//         <div className="w-full max-w-[760px]">
//           {/* Badge */}
//           <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
//             <Leaf size={17} />
//             Fresh & Healthy Everyday
//           </div>

//           {/* Heading */}
//           <h1 className="text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
//             Shop Fresh Daily.
//             <br />
//             <span className="text-[#00C995]">Rakan Freshness.</span>
//             <br />
//             Delivered to Your Door.
//           </h1>

//           {/* Description */}
//           <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
//             Discover fresh vegetables, juicy fruits, local Baladi meats, dairy,
//             bakery products, and everyday essentials. Quality groceries
//             delivered straight to your home.
//           </p>

//           {/* CTA and trust indicators */}
//           <div className="mt-9 flex flex-col items-start gap-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
//             <Link
//               to="/shop"
//               className="group inline-flex items-center gap-3 rounded-full bg-[#00C995] px-8 py-4 text-base font-bold text-[#071B20] shadow-lg shadow-[#00C995]/20 transition-all duration-200 hover:-translate-y-1 hover:bg-[#20E2AE] hover:shadow-xl"
//             >
//               Shop Fresh Products
//               <ArrowRight
//                 size={20}
//                 className="transition-transform duration-200 group-hover:translate-x-1"
//               />
//             </Link>

//             {/* Trust indicators */}
//             <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
//               <div className="flex items-center gap-2">
//                 <Leaf size={25} className="shrink-0 text-[#00C995]" />
//                 <span className="text-sm font-semibold leading-tight text-white">
//                   100%
//                   <br />
//                   Daily Fresh
//                 </span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <ShieldCheck size={25} className="shrink-0 text-[#00C995]" />
//                 <span className="text-sm font-semibold leading-tight text-white">
//                   Secure
//                   <br />
//                   Shopping
//                 </span>
//               </div>

//               <div className="flex items-center gap-2">
//                 <Truck size={27} className="shrink-0 text-[#00C995]" />
//                 <span className="text-sm font-semibold leading-tight text-white">
//                   Fast
//                   <br />
//                   Delivery
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Small location message */}
//           <div className="mt-9 flex items-center gap-2 text-sm font-medium text-white/60">
//             <span className="h-2 w-2 rounded-full bg-[#00C995]" />
//             Bringing freshness to your doorstep every day.
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroBanner() {
  return (
    <section className="relative isolate min-h-[650px] overflow-hidden bg-[#080F23] sm:min-h-[700px] xl:min-h-[720px]">
      {/* Background Image */}
      <img
        src="/images/hero-groceries.png"
        alt="Fresh vegetables, fruits and groceries"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Navy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080F23]/85 via-[#080F23]/50 to-[#080F23]/20" />

      {/* Green Ambient Light */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(0,201,149,0.18),_transparent_65%)]" />

      {/* Hero Content */}
      <div className="relative mx-auto flex min-h-[650px] max-w-[1600px] items-center px-5 py-40 sm:min-h-[700px] sm:px-12 xl:min-h-[720px] xl:px-30">
        <div className="w-full max-w-[760px]">
          {/* Badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#00C995]/30 bg-[#00C995]/10 px-4 py-2 text-sm font-semibold text-[#00C995]">
            <Leaf size={17} />
            Fresh & Healthy Everyday
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl xl:text-6xl">
            Shop Fresh Daily.
            <br />
            <span className="text-[#00C995]">Rakan Freshness.</span>
            <br />
            Delivered to Your Door.
          </h1>

          {/* Description */}
          <p className="mt-7 max-w-[620px] text-base leading-8 text-white/80 sm:text-lg">
            Discover fresh vegetables, juicy fruits, local Baladi meats, dairy,
            bakery products, and everyday essentials. Quality groceries
            delivered straight to your home.
          </p>

          {/* CTA and Trust Indicators */}
          <div className="mt-9 flex flex-col items-start gap-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            {/* Shop Button */}
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-[#00C995] px-8 py-4 text-base font-bold text-[#071B20] shadow-lg shadow-[#00C995]/20 transition-all duration-200 hover:-translate-y-1 hover:bg-[#20E2AE] hover:shadow-xl"
            >
              Shop Fresh Products
              <ArrowRight
                size={20}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {/* Daily Fresh */}
              <div className="flex items-center gap-2">
                <Leaf size={25} className="shrink-0 text-[#00C995]" />

                <span className="text-sm font-semibold leading-tight text-white">
                  100%
                  <br />
                  Daily Fresh
                </span>
              </div>

              {/* Secure Shopping */}
              <div className="flex items-center gap-2">
                <ShieldCheck size={25} className="shrink-0 text-[#00C995]" />

                <span className="text-sm font-semibold leading-tight text-white">
                  Secure
                  <br />
                  Shopping
                </span>
              </div>

              {/* Fast Delivery */}
              <div className="flex items-center gap-2">
                <Truck size={27} className="shrink-0 text-[#00C995]" />

                <span className="text-sm font-semibold leading-tight text-white">
                  Fast
                  <br />
                  Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Location Message */}
          <div className="mt-9 flex items-center gap-2 text-sm font-medium text-white/60">
            <span className="h-2 w-2 rounded-full bg-[#00C995]" />
            Bringing freshness to your doorstep every day.
          </div>
        </div>
      </div>
    </section>
  );
}
