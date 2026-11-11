import { Link } from "react-router-dom";
import { Container } from "../components/Container";
import { useLanguage } from "../context/LanguageContext";

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <Container className="py-24 pt-40 text-center">
      <h1 className="text-3xl font-bold">{t("pageNotFound")}</h1>
      <p className="mt-2 text-muted">{t("pageNotFoundText")}</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white"
      >
        {t("backToStore")}
      </Link>
    </Container>
  );
}
