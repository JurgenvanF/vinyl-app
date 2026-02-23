import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";

import "./Footer.scss";

export default function Footer() {
  const { locale } = useLanguage();

  return (
    <footer className="site-footer w-full px-6 py-4 bg-gray-50">
      <div className="w-97/100 max-w-400 mx-auto text-center text-sm text-gray-700">
        © {new Date().getFullYear()} Vinyl Vault - {t(locale, "by")}{" "}
        <a
          href="https://www.jurgenvanfraeijenhove.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors"
        >
          Jurgen van Fraeijenhove
        </a>
      </div>
    </footer>
  );
}
