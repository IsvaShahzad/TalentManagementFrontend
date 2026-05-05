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

const defaultAdvanced = {
  location: "",
  position: "",
  /** Minimum years of experience (candidate must be >= this value when set) */
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
    if (f.experience !== "" && f.experience != null && String(f.experience).trim() !== "") {
      const minE = parseFloat(String(f.experience), 10);
      const exp =
        parseFloat(
          String(c.experience_years ?? c.experience ?? "").replace(
            /[^\d.-]/g,
            "",
          ),
        ) || 0;
      if (!Number.isFinite(minE) || exp < minE) return false;
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

  const expMatches =
    query.match(/\b(\d+)\s*(yrs?|years?|exp|experience)\b/g) || [];
  const expNumbers = expMatches.map((match) => parseFloat(match));

  let queryText = query;
  expNumbers.forEach((num) => {
    queryText = queryText.replace(new RegExp(`\\b${num}\\b`, "g"), "");
  });

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
    const experienceText = `${expStr} years experience`.toLowerCase();
    const experience =
      parseFloat(
        String(c.experience || c.experience_years || "").replace(
          /[^\d.-]/g,
          "",
        ),
      ) || 0;

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

    const hasExperienceMatch = expNumbers.length
      ? expNumbers.some((num) => experience >= num)
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
