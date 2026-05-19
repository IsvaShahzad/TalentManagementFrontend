/** Fields that keep pill/chip styling in talent-pool tables (client request). */
export const INLINE_CHIP_FIELD_KEYS = new Set(["industry"]);

/** Legacy / import column names mapped to table edit fields. */
const FIELD_VALUE_ALIASES = {
  experience_years: ["experience"],
  position_applied: ["position"],
};

export const fieldUsesChipStyle = (fieldKey) =>
  INLINE_CHIP_FIELD_KEYS.has(fieldKey);

export const hasInlineFieldValue = (value) => {
  if (value == null) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  return String(value).trim() !== "";
};

export const formatInlineDisplayValue = (value) => {
  if (value == null) return "";
  if (typeof value === "number") return String(value);
  return String(value).trim();
};

/** Read display value from candidate (handles experience vs experience_years, etc.). */
export const resolveInlineFieldValue = (candidate, backendField) => {
  if (!candidate) return "";
  const primary = candidate[backendField];
  if (hasInlineFieldValue(primary)) {
    return formatInlineDisplayValue(primary);
  }
  const aliases = FIELD_VALUE_ALIASES[backendField] || [];
  for (const key of aliases) {
    const alt = candidate[key];
    if (hasInlineFieldValue(alt)) {
      return formatInlineDisplayValue(alt);
    }
  }
  return "";
};

/** Normalize list rows so populated legacy columns show in the grid. */
export const normalizeCandidateForTable = (candidate) => {
  if (!candidate) return candidate;
  const experience_years = resolveInlineFieldValue(
    candidate,
    "experience_years",
  );
  const position_applied = resolveInlineFieldValue(
    candidate,
    "position_applied",
  );
  return {
    ...candidate,
    experience_years: experience_years || candidate.experience_years || "",
    position_applied: position_applied || candidate.position_applied || "",
    current_last_salary: formatInlineDisplayValue(
      candidate.current_last_salary ?? "",
    ),
    expected_salary: formatInlineDisplayValue(
      candidate.expected_salary ?? "",
    ),
    industry: formatInlineDisplayValue(candidate.industry ?? ""),
    client_name: formatInlineDisplayValue(candidate.client_name ?? ""),
  };
};

export const normalizeCandidatesForTable = (list) =>
  Array.isArray(list) ? list.map(normalizeCandidateForTable) : [];

/** Pill style for industry (and other chip fields). */
export const skillPillStyle = {
  background: "var(--tms-chip-bg, #e8eef5)",
  color: "var(--tms-chip-color, #1f3c88)",
  padding: "3px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 500,
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  cursor: "pointer",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export const chipInlineInputStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "0.5rem",
  padding: "2px 6px",
  width: "100%",
  minWidth: "72px",
  maxWidth: "160px",
  fontSize: "0.8rem",
  marginTop: "2px",
};

export const plainInlineInputStyle = {
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  padding: "4px 6px",
  width: "100%",
  minWidth: "72px",
  maxWidth: "100%",
  fontSize: "0.8rem",
};

export const getInlineInputStyle = (fieldKey, useChip) => {
  const base = useChip ? chipInlineInputStyle : plainInlineInputStyle;
  if (fieldKey === "experience_years") {
    return { ...base, minWidth: "56px", maxWidth: "140px" };
  }
  return base;
};

export const getEditableDisplayClassName = (fieldKey, hasValue) => {
  if (fieldUsesChipStyle(fieldKey)) return "";
  return hasValue
    ? "tms-inline-editable tms-inline-editable--filled"
    : "tms-inline-editable tms-inline-editable--empty";
};

export const getEditableDisplayStyle = (fieldKey, hasValue) => {
  if (fieldUsesChipStyle(fieldKey)) {
    return skillPillStyle;
  }
  return undefined;
};
