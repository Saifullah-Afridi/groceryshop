import { Clock, CreditCard, MapPin, Phone, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "../components/Container";
import { ContactForm } from "../components/ContactForm";
import { ContactHero } from "../components/ContactHero";

import { STORE } from "../config";
import { useLanguage } from "../context/LanguageContext";

interface InfoCardProps {
  Icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}

// One card of store information, styled like the items in the footer
function InfoCard({ Icon, title, children }: InfoCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-[#DCEAE1] bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#CDEBDD] bg-[#F5FAF7] text-[#008F59]">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-sm font-bold text-[#173D30]">{title}</p>
        <div className="mt-1 text-sm leading-6 text-[#45675A]">{children}</div>
      </div>
    </div>
  );
}

// The store information column. It uses the same texts as the footer.
function StoreInfo() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-[#073B2B]">
          {t("contact.infoTitle")}
        </h2>

        <p className="mt-1 text-sm text-muted">{t("contact.infoText")}</p>
      </div>

      <InfoCard Icon={MapPin} title={t("footer.location")}>
        {t("footer.address")}
      </InfoCard>

      <InfoCard Icon={Clock} title={t("footer.openingHours")}>
        {t("footer.hours")}
      </InfoCard>

      <InfoCard Icon={Truck} title={t("footer.deliveryAreas")}>
        {t("footer.deliveryAreaText")}
      </InfoCard>

      <InfoCard Icon={CreditCard} title={t("footer.paymentMethods")}>
        {t("footer.paymentText")}
      </InfoCard>

      <InfoCard Icon={Phone} title={t("contact.callUs")}>
        <p>{t("footer.supportText")}</p>

        <a
          href={`tel:${STORE.phone}`}
          dir="ltr"
          className="mt-2 inline-block text-base font-bold text-[#008F59] transition-colors hover:text-[#073B2B]"
        >
          {STORE.phone}
        </a>
      </InfoCard>
    </div>
  );
}

export function ContactPage() {
  return (
    <>
      {/* Contact Hero */}
      <ContactHero />

      {/* Store information next to the message form */}
      <section className="bg-[#F5FAF7] py-12 lg:py-16">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-10">
            <StoreInfo />
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
