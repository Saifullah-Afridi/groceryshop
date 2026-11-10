// import { Container } from "./Container";
// import { STORE } from "../config";
// import {
//   MapPin,
//   Phone,
//   Clock,
//   CreditCard,
//   Truck,
//   ArrowUpRight,
// } from "lucide-react";

// export function Footer() {
//   return (
//     <footer>
//       {/* Main Footer */}
//       <div className="relative isolate overflow-hidden border-t border-[#DCEAE1] bg-[#F5FAF7]">
//         {/* Background Image */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 -z-10 bg-no-repeat"
//           style={{
//             backgroundImage: "url('/images/footer-bg.png')",
//             backgroundSize: "100% 100%",
//             backgroundPosition: "center",
//           }}
//         />

//         {/* Light Overlay for Text Readability */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 -z-10 bg-[#F5FAF7]/25"
//         />

//         <Container className="relative z-10">
//           <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
//             {/* Brand */}
//             <div className="max-w-sm">
//               <a href="/" className="inline-block">
//                 <h3 className="text-3xl font-extrabold tracking-tight text-[#073B2B]">
//                   {STORE.name}
//                   <span className="text-[#00A878]">.</span>
//                 </h3>
//               </a>

//               <p className="mt-4 text-sm leading-7 text-[#45675A]">
//                 Fresh vegetables, seasonal fruits, local Baladi meats, dairy
//                 products, and everyday essentials — all in one place.
//               </p>

//               <p className="mt-3 text-sm leading-7 text-[#45675A]">
//                 Bringing quality products from local farms and trusted suppliers
//                 straight to your home.
//               </p>

//               <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#BFE6D5] bg-white/80 px-3 py-2 text-xs font-semibold text-[#008F59] backdrop-blur-sm">
//                 <span className="h-2 w-2 rounded-full bg-[#00A878]" />
//                 Your local grocery store
//               </div>
//             </div>

//             {/* Store Information */}
//             <div>
//               <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#073B2B]">
//                 Store Information
//               </h4>

//               <div className="mt-5 space-y-5">
//                 <div className="flex items-start gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#CDEBDD] bg-white/85 text-[#008F59]">
//                     <MapPin size={17} />
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-[#173D30]">
//                       Our Location
//                     </p>
//                     <p className="mt-1 text-sm leading-6 text-[#45675A]">
//                       University Street, near Al-Qubbah Circle, Irbid
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#CDEBDD] bg-white/85 text-[#008F59]">
//                     <Clock size={17} />
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-[#173D30]">
//                       Opening Hours
//                     </p>
//                     <p className="mt-1 text-sm leading-6 text-[#45675A]">
//                       Daily, 7:00 AM – 12:00 midnight
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Delivery & Payment */}
//             <div>
//               <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#073B2B]">
//                 Delivery & Payment
//               </h4>

//               <div className="mt-5 space-y-5">
//                 <div className="flex items-start gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#CDEBDD] bg-white/85 text-[#008F59]">
//                     <Truck size={17} />
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-[#173D30]">
//                       Delivery Areas
//                     </p>
//                     <p className="mt-1 text-sm leading-6 text-[#45675A]">
//                       Irbid, including Aidoun, Husn, Sarih, and surrounding
//                       districts.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start gap-3">
//                   <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#CDEBDD] bg-white/85 text-[#008F59]">
//                     <CreditCard size={17} />
//                   </div>

//                   <div>
//                     <p className="text-sm font-semibold text-[#173D30]">
//                       Payment Methods
//                     </p>
//                     <p className="mt-1 text-sm leading-6 text-[#45675A]">
//                       Cash or card on delivery, CliQ, Visa, and MasterCard.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Support */}
//             <div>
//               <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-[#073B2B]">
//                 Customer Support
//               </h4>

//               <p className="mt-5 text-sm leading-6 text-[#45675A]">
//                 Need help with an order or have a question? We're here to help.
//               </p>

//               <a
//                 href={`tel:${STORE.phone}`}
//                 className="mt-4 inline-flex items-center gap-2 text-base font-bold text-[#008F59] transition-colors hover:text-[#073B2B]"
//               >
//                 <Phone size={17} />
//                 {STORE.phone}
//                 <ArrowUpRight size={15} />
//               </a>

//               <p className="mt-4 text-sm leading-6 text-[#45675A]">
//                 Get in touch with us for assistance with your shopping and
//                 delivery needs.
//               </p>
//             </div>
//           </div>
//         </Container>
//       </div>

//       {/* Copyright */}
//       <div className="border-t border-white/10 bg-[#073B2B]">
//         <Container>
//           <div className="flex flex-col gap-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
//             <p>
//               © {new Date().getFullYear()} {STORE.name}. All rights reserved.
//             </p>

//             <div className="flex flex-wrap items-center gap-6">
//               <a href="/privacy" className="transition-colors hover:text-white">
//                 Privacy Policy
//               </a>

//               <a href="/terms" className="transition-colors hover:text-white">
//                 Terms of Service
//               </a>
//             </div>
//           </div>
//         </Container>
//       </div>
//     </footer>
//   );
// }

import { Container } from "./Container";
import { STORE } from "../config";

import {
  MapPin,
  Phone,
  Clock,
  CreditCard,
  Truck,
  ArrowUpRight,
} from "lucide-react";

interface FooterProps {
  variant?: "light" | "dark";
}

export function Footer({ variant = "light" }: FooterProps) {
  const isDark = variant === "dark";

  const theme = {
    mainBackground: isDark ? "bg-[#031D1A]" : "bg-[#F5FAF7]",

    border: isDark ? "border-white/10" : "border-[#DCEAE1]",

    brandTitle: isDark ? "text-white" : "text-[#073B2B]",
    heading: isDark ? "text-white" : "text-[#073B2B]",
    body: isDark ? "text-white/65" : "text-[#45675A]",
    itemTitle: isDark ? "text-white" : "text-[#173D30]",

    accent: isDark ? "text-[#00C98D]" : "text-[#008F59]",

    accentHover: isDark ? "hover:text-[#00E6A0]" : "hover:text-[#073B2B]",

    iconContainer: isDark
      ? "border-white/10 bg-white/5 text-[#00C98D]"
      : "border-[#CDEBDD] bg-white/85 text-[#008F59]",

    badge: isDark
      ? "border-[#00C98D]/25 bg-[#00C98D]/10 text-[#00C98D]"
      : "border-[#BFE6D5] bg-white/80 text-[#008F59]",

    badgeDot: isDark ? "bg-[#00C98D]" : "bg-[#00A878]",
  };

  return (
    <footer>
      {/* Main Footer */}
      <div
        className={`relative isolate overflow-hidden border-t ${theme.border} ${theme.mainBackground}`}
      >
        {/* Background Image */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-no-repeat"
          style={{
            backgroundImage: "url('/images/footer-bg.png')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        />

        {/* Background Overlay */}
        {isDark ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#031D1A] via-[#031D1A]/90 to-[#031D1A]/65"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[#F5FAF7]/25"
          />
        )}

        <Container className="relative z-10">
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12 lg:py-16">
            {/* Brand */}
            <div className="max-w-sm">
              <a href="/" className="inline-block">
                <h3
                  className={`text-3xl font-extrabold tracking-tight ${theme.brandTitle}`}
                >
                  {STORE.name}
                  <span className={theme.accent}>.</span>
                </h3>
              </a>

              <p className={`mt-4 text-sm leading-7 ${theme.body}`}>
                Fresh vegetables, seasonal fruits, local Baladi meats, dairy
                products, and everyday essentials — all in one place.
              </p>

              <p className={`mt-3 text-sm leading-7 ${theme.body}`}>
                Bringing quality products from local farms and trusted suppliers
                straight to your home.
              </p>

              <div
                className={`mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold backdrop-blur-sm ${theme.badge}`}
              >
                <span className={`h-2 w-2 rounded-full ${theme.badgeDot}`} />
                Your local grocery store
              </div>
            </div>

            {/* Store Information */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                Store Information
              </h4>

              <div className="mt-5 space-y-5">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconContainer}`}
                  >
                    <MapPin size={17} />
                  </div>

                  <div>
                    <p className={`text-sm font-semibold ${theme.itemTitle}`}>
                      Our Location
                    </p>

                    <p className={`mt-1 text-sm leading-6 ${theme.body}`}>
                      University Street, near Al-Qubbah Circle, Irbid
                    </p>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconContainer}`}
                  >
                    <Clock size={17} />
                  </div>

                  <div>
                    <p className={`text-sm font-semibold ${theme.itemTitle}`}>
                      Opening Hours
                    </p>

                    <p className={`mt-1 text-sm leading-6 ${theme.body}`}>
                      Daily, 7:00 AM – 12:00 midnight
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery & Payment */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                Delivery & Payment
              </h4>

              <div className="mt-5 space-y-5">
                {/* Delivery Areas */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconContainer}`}
                  >
                    <Truck size={17} />
                  </div>

                  <div>
                    <p className={`text-sm font-semibold ${theme.itemTitle}`}>
                      Delivery Areas
                    </p>

                    <p className={`mt-1 text-sm leading-6 ${theme.body}`}>
                      Irbid, including Aidoun, Husn, Sarih, and surrounding
                      districts.
                    </p>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${theme.iconContainer}`}
                  >
                    <CreditCard size={17} />
                  </div>

                  <div>
                    <p className={`text-sm font-semibold ${theme.itemTitle}`}>
                      Payment Methods
                    </p>

                    <p className={`mt-1 text-sm leading-6 ${theme.body}`}>
                      Cash or card on delivery, CliQ, Visa, and MasterCard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div>
              <h4
                className={`text-xs font-bold uppercase tracking-[0.12em] ${theme.heading}`}
              >
                Customer Support
              </h4>

              <p className={`mt-5 text-sm leading-6 ${theme.body}`}>
                Need help with an order or have a question? We're here to help.
              </p>

              <a
                href={`tel:${STORE.phone}`}
                className={`mt-4 inline-flex items-center gap-2 text-base font-bold transition-colors ${theme.accent} ${theme.accentHover}`}
              >
                <Phone size={17} />
                {STORE.phone}
                <ArrowUpRight size={15} />
              </a>

              <p className={`mt-4 text-sm leading-6 ${theme.body}`}>
                Get in touch with us for assistance with your shopping and
                delivery needs.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Copyright */}
      <div
        className={`border-t ${
          isDark
            ? "border-white/10 bg-[#021512]"
            : "border-[#DCEAE1] bg-[#073B2B]"
        }`}
      >
        <Container>
          <div className="flex flex-col gap-4 py-5 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {STORE.name}. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <a href="/privacy" className="transition-colors hover:text-white">
                Privacy Policy
              </a>

              <a href="/terms" className="transition-colors hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
