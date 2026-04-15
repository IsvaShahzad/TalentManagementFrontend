function escapeCsvCell(v) {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/**
 * Download currently visible/filtered candidates as CSV (client-side).
 */
export function downloadCandidatesCsv(rows, filename = "candidates-filtered.csv") {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Location",
    "Experience (years)",
    "Position",
    "Current Salary",
    "Expected Salary",
    "Client",
    "Sourced By",
    "Placement Status",
    "Status",
  ];

  const lines = [headers.join(",")];
  for (const c of rows || []) {
    lines.push(
      [
        escapeCsvCell(c.name),
        escapeCsvCell(c.email),
        escapeCsvCell(c.phone),
        escapeCsvCell(c.location),
        escapeCsvCell(c.experience_years ?? c.experience ?? ""),
        escapeCsvCell(c.position_applied ?? c.position ?? ""),
        escapeCsvCell(c.current_last_salary ?? c.current_salary ?? ""),
        escapeCsvCell(c.expected_salary ?? ""),
        escapeCsvCell(c._exportClientName ?? c.client_name ?? ""),
        escapeCsvCell(c.sourced_by_name ?? ""),
        escapeCsvCell(c.placement_status ?? ""),
        escapeCsvCell(c.candidate_status ?? ""),
      ].join(","),
    );
  }

  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
