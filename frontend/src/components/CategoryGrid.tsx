// // import { Apple, Beef, Carrot, CupSoda, Milk, Wheat } from "lucide-react";
// // import { Link } from "react-router-dom";
// // import { useProducts } from "../hooks/useProducts";
// // import { useCategories } from "../hooks/useShopData";
// // import { Container } from "./Container";
// // import { Skeleton } from "./Skeleton";

// // const ICONS = { Carrot, Apple, Beef, Milk, CupSoda, Wheat };

// // export function CategoryGrid() {
// //   const { data } = useProducts({});
// //   const { data: categories = [], isLoading } = useCategories();

// //   const countOf = (id: string) =>
// //     data?.filter((p) => p.categoryId === id).length;

// //   return (
// //     <Container className="mt-12">
// //       <div className="mb-5 flex items-center justify-between gap-4">
// //         <h2 className="text-2xl font-bold text-brand">Shop by categories</h2>
// //       </div>

// //       <ul className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
// //         {isLoading &&
// //           Array.from({ length: 6 }, (_, i) => (
// //             <li key={i} className="w-40 shrink-0 sm:w-44 xl:flex-1">
// //               <Skeleton className="h-60 rounded-2xl" />
// //             </li>
// //           ))}

// //         {categories.map((c) => {
// //           const Icon = ICONS[c.icon as keyof typeof ICONS];
// //           const count = countOf(c.id);

// //           return (
// //             <li key={c.id} className="w-40 shrink-0 sm:w-44 xl:flex-1">
// //               <Link
// //                 to={`/shop?category=${c.id}`}
// //                 className="group relative block h-60 overflow-hidden rounded-2xl text-center text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
// //                 style={{ backgroundColor: c.color }}
// //               >
// //                 {/* Full-height category image */}
// //                 {c.image && (
// //                   <img
// //                     src={c.image}
// //                     alt={c.name}
// //                     className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
// //                   />
// //                 )}

// //                 {/* Dark overlay for readable text */}
// //                 <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/30" />

// //                 {/* Category title and item count */}
// //                 <div className="relative z-10 px-2 pt-5">
// //                   <h3 className="text-lg font-semibold leading-tight drop-shadow-md">
// //                     {c.name}
// //                   </h3>

// //                   <p className="mt-1 text-xs text-white/90 drop-shadow">
// //                     {count !== undefined ? `${count} items` : "\u00A0"}
// //                   </p>
// //                 </div>

// //                 {/* Icon for categories without an uploaded image */}
// //                 {!c.image && Icon && (
// //                   <Icon
// //                     size={76}
// //                     strokeWidth={1.3}
// //                     className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/55 transition-transform duration-300 group-hover:scale-110"
// //                   />
// //                 )}
// //               </Link>
// //             </li>
// //           );
// //         })}
// //       </ul>
// //     </Container>
// //   );
// // }

// import { useRef } from "react";

// import {
//   Apple,
//   Beef,
//   Carrot,
//   CupSoda,
//   Milk,
//   Wheat,
//   ArrowRight,
//   ChevronLeft,
//   ChevronRight,
//   Leaf,
// } from "lucide-react";

// import { Link } from "react-router-dom";
// import { useProducts } from "../hooks/useProducts";
// import { useCategories } from "../hooks/useShopData";
// import { Container } from "./Container";
// import { Skeleton } from "./Skeleton";

// const ICONS = {
//   Carrot,
//   Apple,
//   Beef,
//   Milk,
//   CupSoda,
//   Wheat,
// };

// export function CategoryGrid() {
//   const scrollRef = useRef<HTMLUListElement>(null);

//   const { data } = useProducts({});
//   const { data: categories = [], isLoading } = useCategories();

//   const countOf = (id: string) =>
//     data?.filter((p) => p.categoryId === id).length;

//   // Carousel navigation
//   const scrollCategories = (direction: "left" | "right") => {
//     if (!scrollRef.current) return;

//     scrollRef.current.scrollBy({
//       left: direction === "left" ? -300 : 300,
//       behavior: "smooth",
//     });
//   };

//   return (
//     <section className="relative overflow-hidden bg-[#F5FAF7] py-14 sm:py-16 lg:py-20">
//       {/* Subtle background decoration */}
//       <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#00C995]/5 blur-3xl" />

//       <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-[#138A50]/5 blur-3xl" />

//       <Container className="relative z-10">
//         {/* Section Header */}
//         <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
//           <div className="max-w-2xl">
//             {/* Badge */}
//             <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00A878]/20 bg-[#00C995]/10 px-4 py-2 text-xs font-bold tracking-wide text-[#008B65]">
//               <Leaf size={15} />
//               SHOP BY CATEGORIES
//             </div>

//             {/* Heading */}
//             <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#103B30] sm:text-4xl lg:text-5xl">
//               Fresh Categories
//               <br />
//               <span className="text-[#00A878]">for Your Everyday Needs.</span>
//             </h2>

//             {/* Description */}
//             <p className="mt-4 max-w-xl text-sm leading-7 text-[#557168] sm:text-base">
//               Explore our wide selection of fresh products, carefully selected
//               to bring quality and freshness to your everyday shopping.
//             </p>
//           </div>

//           {/* Carousel Controls */}
//           <div className="hidden shrink-0 items-center gap-3 sm:flex">
//             <button
//               type="button"
//               onClick={() => scrollCategories("left")}
//               aria-label="Previous categories"
//               className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm transition-all duration-300 hover:border-[#00A878] hover:bg-[#00A878] hover:text-white"
//             >
//               <ChevronLeft size={21} />
//             </button>

//             <button
//               type="button"
//               onClick={() => scrollCategories("right")}
//               aria-label="Next categories"
//               className="flex h-11 w-11  cursor-pointer  items-center justify-center rounded-full bg-[#008F59] text-white shadow-md shadow-[#008F59]/20 transition-all duration-300 hover:bg-[#00A878] hover:shadow-lg"
//             >
//               <ChevronRight size={21} />
//             </button>
//           </div>
//         </div>

//         {/* Category Carousel */}
//         <ul
//           ref={scrollRef}
//           className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
//         >
//           {/* Loading Skeletons */}
//           {isLoading &&
//             Array.from({ length: 6 }, (_, i) => (
//               <li
//                 key={i}
//                 className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
//               >
//                 <Skeleton className="h-[260px] rounded-2xl" />
//               </li>
//             ))}

//           {/* Category Cards */}
//           {!isLoading &&
//             categories.map((c) => {
//               const Icon = ICONS[c.icon as keyof typeof ICONS];
//               const count = countOf(c.id);

//               return (
//                 <li
//                   key={c.id}
//                   className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
//                 >
//                   <Link
//                     to={`/shop?category=${c.id}`}
//                     className="group relative block h-[260px] overflow-hidden rounded-2xl border border-[#DCEAE2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A878]/50 hover:shadow-xl hover:shadow-[#164B35]/10"
//                   >
//                     {/* Category Image */}
//                     {c.image ? (
//                       <img
//                         src={c.image}
//                         alt={c.name}
//                         loading="lazy"
//                         className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
//                       />
//                     ) : (
//                       <div
//                         className="absolute inset-0"
//                         style={{
//                           background: `linear-gradient(145deg, ${c.color || "#DFF5E9"}, #B7E5CC)`,
//                         }}
//                       />
//                     )}

//                     {/* Light Image Overlay */}
//                     <div className="absolute inset-0 bg-gradient-to-t from-[#092D22]/85 via-[#092D22]/10 to-transparent transition-all duration-300 group-hover:from-[#092D22]/90" />

//                     {/* Top Icon */}
//                     {Icon && (
//                       <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/90 text-[#008F59] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-[#00C995] group-hover:text-white">
//                         <Icon size={21} strokeWidth={1.8} />
//                       </div>
//                     )}

//                     {/* Category Information */}
//                     <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
//                       <div className="min-w-0">
//                         <h3 className="truncate text-base font-bold text-white transition-colors duration-300 group-hover:text-[#55E5B6]">
//                           {c.name}
//                         </h3>

//                         <p className="mt-1 text-xs font-medium text-white/80">
//                           {count !== undefined
//                             ? `${count} products`
//                             : "Explore products"}
//                         </p>
//                       </div>

//                       {/* Arrow */}
//                       <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#00C995] group-hover:bg-[#00C995] group-hover:text-[#073B2D]">
//                         <ArrowRight
//                           size={17}
//                           className="transition-transform duration-300 group-hover:translate-x-0.5"
//                         />
//                       </div>
//                     </div>
//                   </Link>
//                 </li>
//               );
//             })}
//         </ul>

//         {/* Mobile Carousel Controls */}
//         <div className="mt-5 flex justify-center gap-3 sm:hidden">
//           <button
//             type="button"
//             onClick={() => scrollCategories("left")}
//             aria-label="Previous categories"
//             className="flex h-11 w-11 items-center cursor-pointer justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm active:scale-95"
//           >
//             <ChevronLeft size={21} />
//           </button>

//           <button
//             type="button"
//             onClick={() => scrollCategories("right")}
//             aria-label="Next categories"
//             className="flex h-11 w-11 curosr-pointer items-center justify-center rounded-full bg-[#008F59] text-white shadow-md active:scale-95"
//           >
//             <ChevronRight size={21} />
//           </button>
//         </div>
//       </Container>
//     </section>
//   );
// }

import { useRef } from "react";

import {
  Apple,
  Beef,
  Carrot,
  CupSoda,
  Milk,
  Wheat,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useShopData";
import { Container } from "./Container";
import { Skeleton } from "./Skeleton";

const ICONS = {
  Carrot,
  Apple,
  Beef,
  Milk,
  CupSoda,
  Wheat,
};

export function CategoryGrid() {
  const scrollRef = useRef<HTMLUListElement>(null);

  const { data } = useProducts({});
  const { data: categories = [], isLoading } = useCategories();

  const countOf = (id: string) =>
    data?.filter((p) => p.categoryId === id).length;

  // Carousel navigation
  const scrollCategories = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative isolate overflow-hidden py-14 sm:py-16 lg:py-20">
      {/* Category Section Background Image */}
      <img
        src="/images/category-bg.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />

      {/* Soft overlay to keep the section bright */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#F5FAF7]/35" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#00A878]/20 bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#008B65] shadow-sm backdrop-blur-sm">
              <Leaf size={15} />
              SHOP BY CATEGORIES
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#103B30] sm:text-4xl lg:text-5xl">
              Fresh Categories
              <br />
              <span className="text-[#00A878]">for Your Everyday Needs.</span>
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#557168] sm:text-base">
              Explore our wide selection of fresh products, carefully selected
              to bring quality and freshness to your everyday shopping.
            </p>
          </div>

          {/* Desktop Carousel Controls */}
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <button
              type="button"
              onClick={() => scrollCategories("left")}
              aria-label="Previous categories"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm transition-all duration-300 hover:border-[#00A878] hover:bg-[#00A878] hover:text-white"
            >
              <ChevronLeft size={21} />
            </button>

            <button
              type="button"
              onClick={() => scrollCategories("right")}
              aria-label="Next categories"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#008F59] text-white shadow-md shadow-[#008F59]/20 transition-all duration-300 hover:bg-[#00A878] hover:shadow-lg"
            >
              <ChevronRight size={21} />
            </button>
          </div>
        </div>

        {/* Category Carousel */}
        <ul
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {/* Loading Skeletons */}
          {isLoading &&
            Array.from({ length: 6 }, (_, i) => (
              <li
                key={i}
                className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
              >
                <Skeleton className="h-[260px] rounded-2xl" />
              </li>
            ))}

          {/* Category Cards */}
          {!isLoading &&
            categories.map((c) => {
              const Icon = ICONS[c.icon as keyof typeof ICONS];
              const count = countOf(c.id);

              return (
                <li
                  key={c.id}
                  className="w-[75vw] max-w-[250px] shrink-0 snap-start sm:w-[230px] lg:w-[220px]"
                >
                  <Link
                    to={`/shop?category=${c.id}`}
                    className="group relative block h-[260px] overflow-hidden rounded-2xl border border-[#DCEAE2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A878]/50 hover:shadow-xl hover:shadow-[#164B35]/10"
                  >
                    {/* Category Image */}
                    {c.image ? (
                      <img
                        src={c.image}
                        alt={c.name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(145deg, ${c.color || "#DFF5E9"}, #B7E5CC)`,
                        }}
                      />
                    )}

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#092D22]/85 via-[#092D22]/10 to-transparent transition-all duration-300 group-hover:from-[#092D22]/90" />

                    {/* Top Icon */}
                    {Icon && (
                      <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/90 text-[#008F59] shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-[#00C995] group-hover:text-white">
                        <Icon size={21} strokeWidth={1.8} />
                      </div>
                    )}

                    {/* Category Information */}
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-bold text-white transition-colors duration-300 group-hover:text-[#55E5B6]">
                          {c.name}
                        </h3>

                        <p className="mt-1 text-xs font-medium text-white/80">
                          {count !== undefined
                            ? `${count} products`
                            : "Explore products"}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-[#00C995] group-hover:bg-[#00C995] group-hover:text-[#073B2D]">
                        <ArrowRight
                          size={17}
                          className="transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
        </ul>

        {/* Mobile Carousel Controls */}
        <div className="mt-5 flex justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => scrollCategories("left")}
            aria-label="Previous categories"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[#D8E8DF] bg-white text-[#176B4B] shadow-sm active:scale-95"
          >
            <ChevronLeft size={21} />
          </button>

          <button
            type="button"
            onClick={() => scrollCategories("right")}
            aria-label="Next categories"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-[#008F59] text-white shadow-md active:scale-95"
          >
            <ChevronRight size={21} />
          </button>
        </div>
      </Container>
    </section>
  );
}
