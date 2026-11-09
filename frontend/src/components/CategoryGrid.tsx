import { Apple, Beef, Carrot, CupSoda, Milk, Wheat } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useShopData";
import { Container } from "./Container";
import { Skeleton } from "./Skeleton";

const ICONS = { Carrot, Apple, Beef, Milk, CupSoda, Wheat };

export function CategoryGrid() {
  const { data } = useProducts({});
  const { data: categories = [], isLoading } = useCategories();

  const countOf = (id: string) =>
    data?.filter((p) => p.categoryId === id).length;

  return (
    <Container className="mt-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-brand">Shop by categories</h2>
      </div>

      <ul className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-4">
        {isLoading &&
          Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="w-40 shrink-0 sm:w-44 xl:flex-1">
              <Skeleton className="h-60 rounded-2xl" />
            </li>
          ))}

        {categories.map((c) => {
          const Icon = ICONS[c.icon as keyof typeof ICONS];
          const count = countOf(c.id);

          return (
            <li key={c.id} className="w-40 shrink-0 sm:w-44 xl:flex-1">
              <Link
                to={`/shop?category=${c.id}`}
                className="group relative block h-60 overflow-hidden rounded-2xl text-center text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ backgroundColor: c.color }}
              >
                {/* Full-height category image */}
                {c.image && (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Dark overlay for readable text */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/30" />

                {/* Category title and item count */}
                <div className="relative z-10 px-2 pt-5">
                  <h3 className="text-lg font-semibold leading-tight drop-shadow-md">
                    {c.name}
                  </h3>

                  <p className="mt-1 text-xs text-white/90 drop-shadow">
                    {count !== undefined ? `${count} items` : "\u00A0"}
                  </p>
                </div>

                {/* Icon for categories without an uploaded image */}
                {!c.image && Icon && (
                  <Icon
                    size={76}
                    strokeWidth={1.3}
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/55 transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
