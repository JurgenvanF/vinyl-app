export const toReleasedDisplay = (iso: string) => {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  const [, yyyy, mm, dd] = match;
  return `${dd}-${mm}-${yyyy}`;
};

export const toReleasedInputDisplay = (isoLike: string) => {
  const trimmed = isoLike.trim();
  if (!trimmed) return "";
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  const month = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (month) return `${month[2]}-${month[1]}`;
  return toReleasedDisplay(trimmed);
};

export const parseReleasedInputToISO = (raw: string) => {
  const input = raw.trim();
  if (!input) return { iso: "", year: undefined, valid: true as const };

  const yyyyOnly = input.match(/^(\d{4})$/);
  if (yyyyOnly) {
    const year = Number.parseInt(yyyyOnly[1], 10);
    return {
      iso: yyyyOnly[1],
      year: Number.isFinite(year) ? year : undefined,
      valid: true as const,
    };
  }

  const monthYear = input.match(/^(\d{2})-(\d{4})$/);
  if (monthYear) {
    const mm = Number.parseInt(monthYear[1], 10);
    const year = Number.parseInt(monthYear[2], 10);
    if (mm < 1 || mm > 12) return { iso: "", year: undefined, valid: false as const };
    return {
      iso: `${monthYear[2]}-${monthYear[1]}`,
      year: Number.isFinite(year) ? year : undefined,
      valid: true as const,
    };
  }

  const ddmmyyyy = input.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const dd = Number.parseInt(ddmmyyyy[1], 10);
    const mm = Number.parseInt(ddmmyyyy[2], 10);
    const year = Number.parseInt(ddmmyyyy[3], 10);
    if (mm < 1 || mm > 12) return { iso: "", year: undefined, valid: false as const };
    if (dd < 1 || dd > 31) return { iso: "", year: undefined, valid: false as const };
    return {
      iso: `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`,
      year: Number.isFinite(year) ? year : undefined,
      valid: true as const,
    };
  }

  const isoLike = input.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (isoLike) {
    const year = Number.parseInt(isoLike[1], 10);
    const mm = Number.parseInt(isoLike[2], 10);
    const dd = isoLike[3] ? Number.parseInt(isoLike[3], 10) : undefined;
    if (mm < 1 || mm > 12) return { iso: "", year: undefined, valid: false as const };
    if (dd !== undefined && (dd < 1 || dd > 31))
      return { iso: "", year: undefined, valid: false as const };
    return {
      iso: input,
      year: Number.isFinite(year) ? year : undefined,
      valid: true as const,
    };
  }

  return { iso: "", year: undefined, valid: false as const };
};
