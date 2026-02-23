import React from "react";
import { useLanguage } from "../../../lib/LanguageContext";
import { t } from "../../../lib/translations";

import "./VinylSpinner.scss";

const VinylSpinner: React.FC = () => {
  const { locale } = useLanguage();
  return (
    <div className="flex flex-col justify-center text-center">
      <div className="vinyl mb-6"></div>
      <p>{t(locale, "loading")}</p>
    </div>
  );
};

export default VinylSpinner;
