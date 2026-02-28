type Locale = "en" | "nl";

const countryNameToISO: Record<string, string> = {
  afghanistan: "AF",
  albania: "AL",
  algeria: "DZ",
  andorra: "AD",
  angola: "AO",
  argentina: "AR",
  armenia: "AM",
  australia: "AU",
  austria: "AT",
  azerbaijan: "AZ",
  bahamas: "BS",
  bahrain: "BH",
  bangladesh: "BD",
  belarus: "BY",
  belgium: "BE",
  belize: "BZ",
  benin: "BJ",
  bhutan: "BT",
  bolivia: "BO",
  "bosnia and herzegovina": "BA",
  botswana: "BW",
  brazil: "BR",
  bulgaria: "BG",
  cambodia: "KH",
  cameroon: "CM",
  canada: "CA",
  chile: "CL",
  china: "CN",
  colombia: "CO",
  croatia: "HR",
  cuba: "CU",
  cyprus: "CY",
  czechia: "CZ",
  denmark: "DK",
  ecuador: "EC",
  egypt: "EG",
  estonia: "EE",
  finland: "FI",
  france: "FR",
  georgia: "GE",
  germany: "DE",
  greece: "GR",
  hungary: "HU",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  iran: "IR",
  iraq: "IQ",
  ireland: "IE",
  israel: "IL",
  italy: "IT",
  japan: "JP",
  kazakhstan: "KZ",
  kenya: "KE",
  latvia: "LV",
  lithuania: "LT",
  luxembourg: "LU",
  malaysia: "MY",
  mexico: "MX",
  morocco: "MA",
  nepal: "NP",
  netherlands: "NL",
  "new zealand": "NZ",
  nigeria: "NG",
  norway: "NO",
  pakistan: "PK",
  peru: "PE",
  philippines: "PH",
  poland: "PL",
  portugal: "PT",
  romania: "RO",
  russia: "RU",
  serbia: "RS",
  singapore: "SG",
  slovakia: "SK",
  slovenia: "SI",
  "south africa": "ZA",
  "south korea": "KR",
  spain: "ES",
  sweden: "SE",
  switzerland: "CH",
  thailand: "TH",
  turkey: "TR",
  ukraine: "UA",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united states": "US",
  uruguay: "UY",
  venezuela: "VE",
  vietnam: "VN",
  zimbabwe: "ZW",
};

const aliasToISO: Record<string, string> = {
  uk: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  usa: "US",
};

function isoToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function resolveCountryISO(country?: string) {
  if (!country) return "";

  const normalized = country.trim().toLowerCase();

  if (/^[a-z]{2}$/i.test(normalized)) {
    if (normalized === "uk") return "GB";
    return normalized.toUpperCase();
  }

  if (aliasToISO[normalized]) {
    return aliasToISO[normalized];
  }

  if (countryNameToISO[normalized]) {
    return countryNameToISO[normalized];
  }

  return "";
}

export function getFlagEmoji(country?: string) {
  const iso = resolveCountryISO(country);
  if (!iso) return "";
  return isoToFlag(iso);
}

export function getLocalizedCountryName(country?: string, locale: Locale = "en") {
  if (!country) return "";
  const iso = resolveCountryISO(country);
  if (!iso) return country;

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(iso) || country;
  } catch {
    return country;
  }
}
