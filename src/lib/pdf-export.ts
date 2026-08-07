import { format } from "date-fns";
import type { Profile } from "./store";
import { FLOW_LEVELS, SYMPTOMS } from "./store";

export function generateDoctorPdf(profile: Profile, includeNotes: boolean = false) {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups in your browser to download the Doctor PDF Summary.");
    return;
  }

  const s = profile.settings;
  const symptomsMap = new Map(SYMPTOMS.map((item) => [item.id, item]));
  const flowsMap = new Map(FLOW_LEVELS.map((item) => [item.id, item]));

  const SYMPTOM_ALIASES: Record<string, { emoji: string; label: string }> = {
    fatigue: { emoji: "😴", label: "Tired" },
    tired: { emoji: "😴", label: "Tired" },
    normal: { emoji: "😐", label: "Normal" },
  };

  const getSymptomMeta = (id: string) =>
    symptomsMap.get(id as any) ?? SYMPTOM_ALIASES[id] ?? { emoji: "📍", label: id };

  // Collect all unique dates with symptoms, moods, flows, or notes
  const datesSet = new Set<string>([
    ...Object.keys(profile.symptoms ?? {}),
    ...Object.keys(profile.moods ?? {}),
    ...Object.keys(profile.flows ?? {}),
    ...(includeNotes ? Object.keys(profile.notes ?? {}) : []),
  ]);

  const sortedDates = Array.from(datesSet).sort().reverse();

  // Symptom counts for summary statistics
  const symptomCounts: Record<string, number> = {};
  sortedDates.forEach((dt) => {
    const syms = profile.symptoms[dt] ?? (profile.moods[dt] ? [profile.moods[dt]] : []);
    syms.forEach((symId) => {
      symptomCounts[symId] = (symptomCounts[symId] || 0) + 1;
    });
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>HerCycle — Doctor Summary Report (${profile.name})</title>
  <style>
    @media print {
      @page { margin: 12mm; size: A4; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
      background: #fff;
    }
    .header {
      border-bottom: 2px solid #f43f5e;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title { font-size: 24px; font-weight: bold; color: #be123c; margin: 0; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .meta-box { font-size: 12px; text-align: right; color: #475569; }
    
    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #9f1239;
      margin-top: 20px;
      margin-bottom: 10px;
      border-left: 4px solid #f43f5e;
      padding-left: 8px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .stat-card {
      background: #fff1f2;
      border: 1px solid #fecdd3;
      border-radius: 8px;
      padding: 10px;
      text-align: center;
    }
    .stat-val { font-size: 16px; font-weight: bold; color: #be123c; }
    .stat-lbl { font-size: 10px; color: #881337; text-transform: uppercase; letter-spacing: 0.5px; }

    .symptom-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .tag {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 12px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 12px;
    }
    th {
      background: #f8fafc;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
      padding: 8px 10px;
      font-weight: 600;
      color: #334155;
    }
    td {
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 10px;
      vertical-align: top;
    }
    tr:nth-child(even) { background: #f8fafc; }

    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1 class="title">HerCycle ❤️ Gynecological Summary</h1>
      <div class="subtitle">Personal Period & Symptom Medical Report</div>
    </div>
    <div class="meta-box">
      <div><strong>Profile:</strong> ${profile.name}</div>
      <div><strong>Report Date:</strong> ${format(new Date(), "MMM dd, yyyy")}</div>
    </div>
  </div>

  <div class="section-title">1. Cycle Parameters</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-val">${s.cycleLength} Days</div>
      <div class="stat-lbl">Avg Cycle Length</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${s.periodLength} Days</div>
      <div class="stat-lbl">Period Duration</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${s.lastPeriodStart}</div>
      <div class="stat-lbl">Last Period Start</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${sortedDates.length} Days</div>
      <div class="stat-lbl">Total Logged Days</div>
    </div>
  </div>

  <div class="section-title">2. Symptom Frequency Summary</div>
  <div class="symptom-tags">
    ${
      Object.keys(symptomCounts).length === 0
        ? '<div style="font-size: 12px; color: #64748b;">No symptoms logged yet.</div>'
        : Object.entries(symptomCounts)
            .map(([symId, cnt]) => {
              const meta = getSymptomMeta(symId);
              return `<div class="tag">${meta.emoji} <strong>${meta.label}:</strong> ${cnt} times</div>`;
            })
            .join("")
    }
  </div>

  <div class="section-title">3. Detailed Date-by-Date Log History</div>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Date</th>
        <th style="width: 45%;">Logged Symptoms & Feelings</th>
        <th style="width: 37%;">Flow Level</th>
        ${includeNotes ? '<th style="width: 30%;">Journal Notes</th>' : ""}
      </tr>
    </thead>
    <tbody>
      ${
        sortedDates.length === 0
          ? `<tr><td colspan="${includeNotes ? 4 : 3}" style="text-align: center; color: #64748b;">No detailed logs recorded.</td></tr>`
          : sortedDates
              .map((dt) => {
                const syms = profile.symptoms[dt] ?? (profile.moods[dt] ? [profile.moods[dt]] : []);
                const symsStr = syms
                  .map((id) => {
                    const item = getSymptomMeta(id);
                    return `${item.emoji} ${item.label}`;
                  })
                  .join(", ");

                const flow = profile.flows[dt];
                const flowMeta = flow ? flowsMap.get(flow) : null;
                const flowStr = flowMeta ? `${flowMeta.icon} ${flowMeta.label}` : "—";
                const noteStr = profile.notes[dt] || "—";

                return `<tr>
                  <td><strong>${dt}</strong></td>
                  <td>${symsStr || "—"}</td>
                  <td>${flowStr}</td>
                  ${includeNotes ? `<td>${noteStr}</td>` : ""}
                </tr>`;
              })
              .join("")
      }
    </tbody>
  </table>

  <div class="footer">
    Confidential Medical Summary — Generated for physician review via HerCycle Companion.
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
