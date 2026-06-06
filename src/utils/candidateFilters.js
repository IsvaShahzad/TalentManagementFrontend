/**
 * Talent pool: optional advanced filters + same search behavior as SearchBarWithIcons.
 */

export function parseSalaryLoose(val) {
  if (val == null || val === "") return null;
  const s = String(val)
    .toLowerCase()
    .replace(/,/g, "")
    .trim();
  if (!s) return null;
  const kMatch = s.match(/^(\d+(?:\.\d+)?)\s*k$/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const n = parseFloat(s.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Min: primary salary (expected → current/last → current) must be >= min when min is set.
 * Max: every present salary field must be <= max (avoids showing someone whose current pay
 * is above max while expected is below).
 * Bounds are inclusive. If both are set but reversed, they are swapped.
 */
export function candidateMatchesSalaryRange(c, minStr, maxStr) {
  let min = minStr === "" || minStr == null ? null : parseSalaryLoose(minStr);
  let max = maxStr === "" || maxStr == null ? null : parseSalaryLoose(maxStr);
  if (min == null && max == null) return true;
  if (min != null && max != null && min > max) {
    const t = min;
    min = max;
    max = t;
  }
  const nums = [
    parseSalaryLoose(c.expected_salary),
    parseSalaryLoose(c.current_last_salary),
    parseSalaryLoose(c.current_salary),
  ].filter((v) => v != null);
  if (nums.length === 0) return false;

  if (min != null) {
    const primary =
      parseSalaryLoose(c.expected_salary) ??
      parseSalaryLoose(c.current_last_salary) ??
      parseSalaryLoose(c.current_salary);
    if (primary == null || primary < min) return false;
  }
  if (max != null && nums.some((n) => n > max)) return false;
  return true;
}

/**
 * Parse free-text experience (e.g. "2 years", "6 months", "2y 3m", "5") to total months.
 * Plain numbers are treated as years (legacy experience_years field).
 */
export function parseExperienceToMonths(val) {
  if (val == null || val === "") return null;
  const s = String(val).toLowerCase().replace(/,/g, "").trim();
  if (!s) return null;

  let months = 0;
  let matched = false;

  for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)\b/gi)) {
    months += parseFloat(m[1]) * 12;
    matched = true;
  }
  for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b/gi)) {
    months += parseFloat(m[1]);
    matched = true;
  }

  if (!matched) {
    for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*y\b/gi)) {
      months += parseFloat(m[1]) * 12;
      matched = true;
    }
    for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*m\b/gi)) {
      months += parseFloat(m[1]);
      matched = true;
    }
  }

  if (matched) return months;

  const numOnly = parseFloat(s.replace(/[^\d.-]/g, ""));
  if (Number.isFinite(numOnly) && /\d/.test(s)) {
    return numOnly * 12;
  }

  return null;
}

/** Minimum experience filter: supports years, months, or plain text contains. */
export function candidateMeetsMinExperience(candidate, minExperienceInput) {
  if (
    minExperienceInput == null ||
    String(minExperienceInput).trim() === ""
  ) {
    return true;
  }

  const raw = String(
    candidate.experience_years ?? candidate.experience ?? "",
  ).trim();
  const minMonths = parseExperienceToMonths(minExperienceInput);

  if (minMonths != null) {
    const candMonths = parseExperienceToMonths(raw);
    if (candMonths != null) {
      return candMonths >= minMonths;
    }
  }

  const needle = String(minExperienceInput).trim().toLowerCase();
  return raw.toLowerCase().includes(needle);
}

function extractExperienceRequirementsFromQuery(query) {
  const requirements = [];
  const re =
    /\b(\d+(?:\.\d+)?)\s*(years?|yrs?|months?|mos?|y|m)\b/gi;

  for (const match of query.matchAll(re)) {
    const num = parseFloat(match[1]);
    if (!Number.isFinite(num)) continue;
    const unit = match[2].toLowerCase();
    if (unit.startsWith("y")) requirements.push(num * 12);
    else if (unit.startsWith("m")) requirements.push(num);
  }

  return requirements;
}

function stripExperienceFromQuery(query) {
  return query
    .replace(
      /\b(\d+(?:\.\d+)?)\s*(?:years?|yrs?|months?|mos?|y|m)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

const defaultAdvanced = {
  location: "",
  position: "",
  /** Minimum experience — years, months, or free text (e.g. "2 years", "6 months") */
  experience: "",
  salaryMin: "",
  salaryMax: "",
  /** Substring match on candidate.client_name (talent pool) */
  clientName: "",
  clientId: "",
};

export function applyAdvancedFilters(candidates, filters = {}) {
  const f = { ...defaultAdvanced, ...filters };
  return (candidates || []).filter((c) => {
    if (f.location?.trim()) {
      const loc = (c.location || "").toLowerCase();
      if (!loc.includes(f.location.trim().toLowerCase())) return false;
    }
    if (f.position?.trim()) {
      const pos = (c.position_applied || c.position || "").toLowerCase();
      if (!pos.includes(f.position.trim().toLowerCase())) return false;
    }
    if (
      f.experience !== "" &&
      f.experience != null &&
      String(f.experience).trim() !== ""
    ) {
      if (!candidateMeetsMinExperience(c, f.experience)) return false;
    }
    if (f.skills?.trim()) {
      const skillList = f.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const candidateSkills = (
        c.skills ||
        c.key_skills ||
        c.skill_set ||
        ""
      )
        .toLowerCase()
        .split(",")
        .map((s) => s.trim());

      if (!skillList.every((s) => candidateSkills.includes(s))) return false;
    }
    if (f.industry?.trim()) {
      const industry = (c.industry || "").toLowerCase();
      if (!industry.includes(f.industry.trim().toLowerCase())) return false;
    }
    if (f.clientName?.trim()) {
      const needle = f.clientName.trim().toLowerCase();
      const name = (c.client_name || "").toLowerCase();
      if (!name.includes(needle)) return false;
    } else if (f.clientId) {
      if ((c.clientassigned_id || "") !== f.clientId) return false;
    }
    if (!candidateMatchesSalaryRange(c, f.salaryMin, f.salaryMax)) return false;
    return true;
  });
}

/** Same logic as SearchBarWithIcons (search box). */
export function filterCandidatesBySearchQuery(candidates, searchQuery) {
  const query = (searchQuery || "").toLowerCase().trim();
  if (!query) return [...(candidates || [])];

  const expRequirements = extractExperienceRequirementsFromQuery(query);

  let queryText = stripExperienceFromQuery(query);

  const queryWords = queryText.split(/\s+/).filter(Boolean);

  const softWords = [
    "developer",
    "dev",
    "experience",
    "exp",
    "with",
    "for",
    "of",
    "in",
    "at",
    "as",
    "and",
    "to",
    "from",
    "on",
    "by",
    "the",
    "a",
    "an",
  ];

  const coreWords = queryWords.filter((w) => !softWords.includes(w));

  return (candidates || []).filter((c) => {
    const name = (c.name || "").toLowerCase();
    const email = (c.email || "").toLowerCase();
    const position = (c.position || c.position_applied || "").toLowerCase();
    const location = (c.location || "").toLowerCase();
    const description = (c.profileSummary || "").toLowerCase();
    const expStr = String(c.experience_years ?? c.experience ?? "");
    const experienceText = expStr.toLowerCase();
    const candMonths = parseExperienceToMonths(expStr);

    const searchable = [
      name,
      email,
      position,
      location,
      description,
      experienceText,
    ].join(" ");

    const hasCoreMatch = coreWords.length
      ? coreWords.every((word) => searchable.includes(word))
      : true;

    const hasExperienceMatch = expRequirements.length
      ? expRequirements.some(
          (minMonths) => candMonths != null && candMonths >= minMonths,
        )
      : true;

    if (coreWords.length > 0) {
      if (!hasCoreMatch || !hasExperienceMatch) return false;
    } else {
      if (!hasExperienceMatch) return false;
    }

    if (
      coreWords.length === 0 &&
      queryWords.some((word) => softWords.includes(word))
    ) {
      const softMatch = queryWords.some((word) => {
        if (softWords.includes(word)) {
          const regex = new RegExp(`\\b${word}\\b`, "i");
          return regex.test(searchable);
        }
        return false;
      });
      if (!softMatch) return false;
    }

    return true;
  });
}

export function filterTalentPool(localCandidates, advancedFilters, searchQuery) {
  let list = applyAdvancedFilters(localCandidates, advancedFilters);
  list = filterCandidatesBySearchQuery(list, searchQuery);
  return list;
}

export function getCandidateClientDisplayName(candidate, clients = []) {
  if (!candidate) return "";
  const id = candidate.clientassigned_id;
  if (id) {
    const u = clients.find((cl) => cl.user_id === id);
    if (u?.full_name) return u.full_name;
  }
  return candidate.client_name || "";
}
