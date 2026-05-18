const formatNumber = (value) => {
  if (value === null || value === undefined) return "--";
  return Number(value).toLocaleString();
};

const setText = (id, value) => {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
};

const gainText = (item) => {
  const lastHour = item.last_hour_gain || 0;
  const today = item.today_gain || 0;
  return `+${formatNumber(lastHour)} last run, +${formatNumber(today)} today`;
};

const renderLeaderboard = (id, rows, emptyText = "No data yet.") => {
  const board = document.getElementById(id);
  if (!board) return;

  if (!rows || rows.length === 0) {
    board.innerHTML = `<div class="empty">${emptyText}</div>`;
    return;
  }

  board.innerHTML = rows.map((row, index) => `
    <div class="leader-row">
      <span class="rank">${index + 1}</span>
      <span class="name" title="${row.employee}">${row.employee}</span>
      <span class="score">${formatNumber(row.total)}</span>
      <span class="gain">${gainText(row)}</span>
    </div>
  `).join("");
};

const renderHandoverHistory = (rows) => {
  const container = document.getElementById("handoverHistory");
  if (!container) return;

  if (!rows || rows.length === 0) {
    container.innerHTML = '<div class="empty">No handover data yet.</div>';
    return;
  }

  container.innerHTML = rows.slice().reverse().map((row) => `
    <div class="history-item">
      <strong>${formatNumber(row.count)}</strong>
      <span class="meta">${row.timestamp}</span>
    </div>
  `).join("");
};

const loadDashboard = async () => {
  const response = await fetch("data/dashboard_data.json", { cache: "no-store" });
  const data = await response.json();

  setText("lastUpdate", data.latest_update || data.generated_at || "--");

  const handover = data.handover || {};
  setText("handoverCount", formatNumber(handover.latest_count));
  const handoverChange = handover.last_hour_change;
  setText(
    "handoverChange",
    handoverChange === null || handoverChange === undefined
      ? "No previous reading"
      : `${handoverChange >= 0 ? "+" : ""}${formatNumber(handoverChange)} since last run`
  );

  const topScan = (data.scan || [])[0];
  const topPutaway = (data.putaway || [])[0];
  setText("topScan", topScan ? topScan.employee : "--");
  setText("topScanDetail", topScan ? `${formatNumber(topScan.total)} total scans` : "No data yet");
  setText("topPutaway", topPutaway ? topPutaway.employee : "--");
  setText("topPutawayDetail", topPutaway ? `${formatNumber(topPutaway.total)} total putaway` : "0 total putaway this week");

  renderLeaderboard("scanBoard", data.scan || []);
  renderLeaderboard("putawayBoard", data.putaway || [], "0 putaway this week.");
  renderHandoverHistory((handover && handover.history) || []);
};

loadDashboard().catch((error) => {
  console.error(error);
  setText("lastUpdate", "Data unavailable");
});
