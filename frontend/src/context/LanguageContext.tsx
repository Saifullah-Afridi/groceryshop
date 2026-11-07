import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Language = "ar" | "en";

const translations = {
  ar: {
    home: "الرئيسية",
    shop: "تسوق",
    cart: "السلة",
    search: "ابحث عن المنتجات...",
    deliveringTo: "التوصيل إلى",
    location: "إربد، الأردن",
    account: "حسابي",
    myOrders: "طلباتي",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    checkout: "إتمام الطلب",
    continueShopping: "متابعة التسوق",
    products: "المنتجات",
    categories: "الفئات",
    price: "السعر",
    quantity: "الكمية",
    addToCart: "أضف إلى السلة",
    subtotal: "المجموع الفرعي",
    total: "الإجمالي",
    deliveryFee: "رسوم التوصيل",
    emptyCart: "سلة التسوق فارغة",
    viewAll: "عرض الكل",
    loading: "جاري التحميل...",
    language: "اللغة",
    english: "English",
    arabic: "العربية",
  },

  en: {
    home: "Home",
    shop: "Shop",
    cart: "Cart",
    search: "Search products...",
    deliveringTo: "Delivering to",
    location: "Irbid, Jordan",
    account: "My Account",
    myOrders: "My Orders",
    signIn: "Sign In",
    signOut: "Sign Out",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    products: "Products",
    categories: "Categories",
    price: "Price",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    subtotal: "Subtotal",
    total: "Total",
    deliveryFee: "Delivery Fee",
    emptyCart: "Your cart is empty",
    viewAll: "View All",
    loading: "Loading...",
    language: "Language",
    english: "English",
    arabic: "العربية",
  },
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  isArabic: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("rakan-language");

    return saved === "en" ? "en" : "ar";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    localStorage.setItem("rakan-language", language);
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
  };

  const toggleLanguage = () => {
    setLanguageState((current) => (current === "ar" ? "en" : "ar"));
  };

  const t = (key: TranslationKey) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic: language === "ar",
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
