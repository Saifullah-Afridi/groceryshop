import { Link } from "react-router-dom";
import { AlertTriangle, ArchiveX, Banknote, ClipboardList, Package, ShoppingBag, Users, Tags } from "lucide-react";
import { useAdminDashboard } from "../../hooks/useAdmin";
import { useLanguage } from "../../context/LanguageContext";
import { formatPrice } from "../../utils/format";
import { PageHeader } from "../../components/admin/PageHeader";
import { TableSkeleton } from "../../components/Skeleton";

function Stat({label,value,icon:Icon,href,tone="text-brand"}:{label:string;value:string|number;icon:any;href?:string;tone?:string}) {
 const body=<div className="rounded-2xl border border-line bg-white p-5"><div className="flex items-center justify-between"><p className="text-sm text-muted">{label}</p><Icon size={20} className={tone}/></div><p className="mt-2 text-2xl font-bold text-brand">{value}</p></div>;
 return href ? <Link to={href} className="block transition hover:-translate-y-0.5">{body}</Link> : body;
}
export function AdminDashboardPage() {
 const {data,isLoading,error}=useAdminDashboard();
 const {language,isArabic}=useLanguage();
 const tr=(en:string,ar:string)=>isArabic?ar:en;
 if(isLoading) return <TableSkeleton/>;
 if(error || !data) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{tr("Could not load dashboard data. Check the API and database migration.","تعذر تحميل بيانات لوحة التحكم. تحقق من واجهة API وترحيل قاعدة البيانات.")}</p>;
 const money=(n:number)=>`${formatPrice(n)} JOD`;
 return <div dir={language==="ar"?"rtl":"ltr"}>
  <PageHeader title={tr("Owner dashboard","لوحة تحكم المالك")} text={tr("Your store performance, orders and inventory at a glance.","نظرة سريعة على أداء المتجر والطلبات والمخزون.")}/>
  <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
   <Stat label={tr("Today's revenue","مبيعات اليوم")} value={money(data.todayRevenue)} icon={Banknote}/>
   <Stat label={tr("Orders today","طلبات اليوم")} value={data.todayOrders} icon={ShoppingBag} href="/admin/orders"/>
   <Stat label={tr("Average order value","متوسط قيمة الطلب")} value={money(data.averageOrderValue)} icon={ClipboardList}/>
   <Stat label={tr("Pending orders","الطلبات المعلقة")} value={data.pendingOrders} icon={ClipboardList} href="/admin/orders"/>
   <Stat label={tr("Monthly revenue","مبيعات هذا الشهر")} value={money(data.monthRevenue)} icon={Banknote}/>
   <Stat label={tr("New customers today","عملاء جدد اليوم")} value={data.newCustomersToday} icon={Users} href="/admin/users"/>
   <Stat label={tr("Products","المنتجات")} value={data.productsCount} icon={Package} href="/admin/products"/>
   <Stat label={tr("Categories","الفئات")} value={data.categoriesCount} icon={Tags} href="/admin/categories"/>
  </div>
  <div className="mt-5 grid gap-4 lg:grid-cols-2">
   <Link to="/admin/products?stock=low" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 hover:shadow-sm">
    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-amber-900">{tr("Low stock products","منتجات قاربت على النفاد")}</p><p className="mt-1 text-3xl font-bold text-amber-900">{data.lowStock.length}</p></div><AlertTriangle className="text-amber-700" size={28}/></div>
    <p className="mt-2 text-sm text-amber-800">{tr("Click to manage products that need restocking.","اضغط لإدارة المنتجات التي تحتاج إلى إعادة تخزين.")}</p>
    {data.lowStock.slice(0,4).map(p=><p key={p.id} className="mt-2 flex justify-between text-sm text-amber-950"><span>{isArabic?(p.nameAr||p.name):p.name}</span><b>{p.stockQuantity} {p.unit}</b></p>)}
   </Link>
   <Link to="/admin/products?stock=out" className="rounded-2xl border border-red-200 bg-red-50 p-5 hover:shadow-sm">
    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-red-900">{tr("Out of stock","نفد المخزون")}</p><p className="mt-1 text-3xl font-bold text-red-900">{data.outOfStock.length}</p></div><ArchiveX className="text-red-700" size={28}/></div>
    <p className="mt-2 text-sm text-red-800">{tr("These products cannot be ordered until restocked.","لا يمكن طلب هذه المنتجات حتى إعادة تخزينها.")}</p>
    {data.outOfStock.slice(0,4).map(p=><p key={p.id} className="mt-2 text-sm text-red-950">{isArabic?(p.nameAr||p.name):p.name}</p>)}
   </Link>
  </div>
  <div className="mt-5 grid gap-4 lg:grid-cols-2">
   <section className="rounded-2xl border border-line bg-white p-5"><h2 className="mb-3 font-bold">{tr("Best sellers this month","الأكثر مبيعاً هذا الشهر")}</h2>
    {data.bestSellers.length?data.bestSellers.map((p,i)=><div key={p.name} className="flex justify-between border-b border-line py-2 text-sm"><span>{i+1}. {p.name}</span><span className="font-semibold">{p.quantity} · {money(p.revenue)}</span></div>):<p className="text-sm text-muted">{tr("No sales yet this month.","لا توجد مبيعات هذا الشهر بعد.")}</p>}
   </section>
   <section className="rounded-2xl border border-line bg-white p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">{tr("Recent orders","أحدث الطلبات")}</h2><Link className="text-sm font-semibold text-brand" to="/admin/orders">{tr("View all","عرض الكل")}</Link></div>
    {data.recentOrders.map(o=><div key={o.id} className="flex justify-between gap-3 border-b border-line py-2 text-sm"><span>#{o.id} · {o.name}<small className="block text-muted">{o.status.replaceAll("_"," ")}</small></span><b>{money(o.total)}</b></div>)}
   </section>
  </div>
 </div>;
}
