import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "ar" | "en";

const translations = {
  ar: {
    home:"الرئيسية", shop:"تسوق", cart:"السلة", search:"ابحث عن المنتجات...",
    deliveringTo:"التوصيل إلى", location:"إربد، الأردن", account:"حسابي",
    myOrders:"طلباتي", signIn:"تسجيل الدخول", signOut:"تسجيل الخروج",
    checkout:"إتمام الطلب", continueShopping:"متابعة التسوق", products:"المنتجات",
    categories:"الفئات", price:"السعر", quantity:"الكمية", addToCart:"أضف إلى السلة",
    subtotal:"المجموع الفرعي", total:"الإجمالي", deliveryFee:"رسوم التوصيل",
    emptyCart:"سلة التسوق فارغة", viewAll:"عرض الكل", loading:"جارٍ التحميل...",
    language:"اللغة", english:"English", arabic:"العربية", all:"الكل",
    sortBy:"ترتيب حسب", lowToHigh:"السعر: من الأقل للأعلى", highToLow:"السعر: من الأعلى للأقل",
    topRated:"الأعلى تقييماً", chooseWeight:"اختر الوزن", customWeight:"وزن مخصص",
    pricePer:"السعر لكل", pricePerQuarter:"السعر لكل 0.25 كغ", remove:"إزالة",
    clearCart:"إفراغ السلة", continueOrder:"متابعة الطلب", delivery:"التوصيل",
    calculatedAtCheckout:"يتم احتسابه عند إتمام الطلب", results:"النتائج",
    allProducts:"جميع المنتجات", couldNotLoad:"تعذر تحميل المنتجات",
    checkConnection:"تحقق من الاتصال وحاول مرة أخرى", tryAgain:"حاول مرة أخرى",
    noProducts:"لم يتم العثور على منتجات", clearFilters:"مسح عوامل التصفية",
    deliveryDetails:"تفاصيل التوصيل", fullName:"الاسم الكامل", phone:"رقم الهاتف",
    city:"المدينة", chooseCity:"اختر مدينتك", address:"العنوان",
    driverNote:"ملاحظة للسائق (اختياري)", placeOrder:"تأكيد الطلب",
    placingOrder:"جارٍ إرسال طلبك...", cashOrCard:"الدفع نقداً أو بالبطاقة عند وصول طلبك",
    orderSummary:"ملخص الطلب", keepShopping:"متابعة التسوق", note:"ملاحظة",
    signInToCheckout:"سجّل الدخول لإتمام الطلب", cartSaved:"سلتك محفوظة. سجّل الدخول لإدخال تفاصيل التوصيل.",
    goToShop:"الذهاب إلى المتجر", addFresh:"أضف بعض المنتجات الطازجة أولاً.",
    myOrdersTitle:"طلباتي", noOrders:"لا توجد طلبات حتى الآن",
    orderHistory:"سيظهر سجل طلباتك وحالة التوصيل هنا.", cancelOrder:"إلغاء الطلب",
    cancelThisOrder:"إلغاء هذا الطلب", delivering:"التوصيل إلى", subtotalLabel:"المجموع الفرعي",
    pageNotFound:"الصفحة غير موجودة", pageNotFoundText:"الصفحة التي تبحث عنها غير موجودة.",
    backToStore:"العودة إلى المتجر", featured:"منتجات مميزة", fresh:"طازج",
    email:"البريد الإلكتروني", password:"كلمة المرور", save:"حفظ", cancel:"إلغاء",
    edit:"تعديل", delete:"حذف", add:"إضافة", actions:"الإجراءات", status:"الحالة",
    pending:"قيد الانتظار", confirmed:"تم التأكيد", preparing:"قيد التجهيز",
    outForDelivery:"خرج للتوصيل", delivered:"تم التوصيل", cancelled:"ملغي",
    dashboard:"لوحة التحكم", customers:"العملاء", orders:"الطلبات",
    deliveryFees:"رسوم التوصيل", manageProducts:"إدارة المنتجات",
  },
  en: {
    home:"Home", shop:"Shop", cart:"Cart", search:"Search products...",
    deliveringTo:"Delivering to", location:"Irbid, Jordan", account:"My Account",
    myOrders:"My Orders", signIn:"Sign In", signOut:"Sign Out",
    checkout:"Checkout", continueShopping:"Continue Shopping", products:"Products",
    categories:"Categories", price:"Price", quantity:"Quantity", addToCart:"Add to Cart",
    subtotal:"Subtotal", total:"Total", deliveryFee:"Delivery Fee",
    emptyCart:"Your cart is empty", viewAll:"View All", loading:"Loading...",
    language:"Language", english:"English", arabic:"العربية", all:"All",
    sortBy:"Sort by", lowToHigh:"Price: low to high", highToLow:"Price: high to low",
    topRated:"Top rated", chooseWeight:"Choose weight", customWeight:"Custom weight",
    pricePer:"Price per", pricePerQuarter:"Price per 0.25 kg", remove:"Remove",
    clearCart:"Clear cart", continueOrder:"Continue order", delivery:"Delivery",
    calculatedAtCheckout:"Calculated at checkout", results:"Results",
    allProducts:"All products", couldNotLoad:"Could not load products",
    checkConnection:"Check your connection and try again", tryAgain:"Try again",
    noProducts:"No products found", clearFilters:"Clear filters",
    deliveryDetails:"Delivery details", fullName:"Full name", phone:"Phone number",
    city:"City", chooseCity:"Choose your city", address:"Address",
    driverNote:"Note for the driver (optional)", placeOrder:"Place order",
    placingOrder:"Placing your order...", cashOrCard:"Pay with cash or card when your order arrives",
    orderSummary:"Order summary", keepShopping:"Keep shopping", note:"Note",
    signInToCheckout:"Sign in to check out", cartSaved:"Your cart is saved. Sign in to enter your delivery details.",
    goToShop:"Go to the shop", addFresh:"Add some fresh products first.",
    myOrdersTitle:"My orders", noOrders:"No orders yet",
    orderHistory:"Your order history and delivery status will show here.", cancelOrder:"Cancel order",
    cancelThisOrder:"Cancel this order", delivering:"Delivering to", subtotalLabel:"Subtotal",
    pageNotFound:"Page not found", pageNotFoundText:"The page you are looking for does not exist.",
    backToStore:"Back to the store", featured:"Featured products", fresh:"Fresh",
    email:"Email", password:"Password", save:"Save", cancel:"Cancel",
    edit:"Edit", delete:"Delete", add:"Add", actions:"Actions", status:"Status",
    pending:"Pending", confirmed:"Confirmed", preparing:"Preparing",
    outForDelivery:"Out for delivery", delivered:"Delivered", cancelled:"Cancelled",
    dashboard:"Dashboard", customers:"Customers", orders:"Orders",
    deliveryFees:"Delivery fees", manageProducts:"Manage products",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
type ContextValue = {
  language: Language;
  isArabic: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<ContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return localStorage.getItem("rakan-language") === "en" ? "en" : "ar";
    } catch {
      return "ar";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
    root.dataset.language = language;
    try { localStorage.setItem("rakan-language", language); } catch { /* storage may be unavailable */ }
  }, [language]);

  const applyLanguage = (next: Language) => {
    if (next === language) return;
    const root = document.documentElement;
    root.classList.add("language-switch-no-motion");
    setLanguageState(next);
    window.setTimeout(() => root.classList.remove("language-switch-no-motion"), 0);
  };
  const setLanguage = (next: Language) => applyLanguage(next);
  const toggleLanguage = () => applyLanguage(language === "ar" ? "en" : "ar");
  const t = (key: TranslationKey) => translations[language][key] ?? translations.en[key];

  return (
    <LanguageContext.Provider value={{ language, isArabic: language === "ar", setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
