/**
 * downloadInvoice – generates a styled HTML invoice and opens the browser print dialog.
 *
 * @param {object} item   – income or expense entry  { title, amount, date, category, note, id }
 * @param {'income'|'expense'} type
 * @param {string}  companyName  – optional company name to display
 */
export function downloadInvoice(item, type = "income", companyName = "My Company") {
  const isExpense = type === "expense";
  const accentColor = isExpense ? "#e11d48" : "#059669";
  const accentLight = isExpense ? "#fff1f2" : "#ecfdf5";
  const label = isExpense ? "EXPENSE RECEIPT" : "INCOME RECEIPT";
  const signLabel = isExpense ? "Total Paid" : "Total Received";

  const invoiceNo = `INV-${String(item.id).padStart(5, "0")}`;
  const printDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const entryDate = item.date
    ? new Date(item.date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${label} – ${invoiceNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,.10);
    }
    /* Header */
    .header {
      background: ${accentColor};
      padding: 36px 40px 28px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      color: #fff;
    }
    .header-left .company { font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
    .header-left .sub { font-size: 12px; opacity: .8; margin-top: 4px; }
    .header-right { text-align: right; }
    .header-right .badge {
      display: inline-block;
      background: rgba(255,255,255,.18);
      border: 1px solid rgba(255,255,255,.35);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .8px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .header-right .inv-no { font-size: 22px; font-weight: 800; }
    /* Meta row */
    .meta {
      background: ${accentLight};
      padding: 18px 40px;
      display: flex;
      gap: 40px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-item .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: #94a3b8; }
    .meta-item .value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 3px; }
    /* Body */
    .body { padding: 32px 40px; }
    .section-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .6px; color: #94a3b8; margin-bottom: 12px;
    }
    /* Table */
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f1f5f9; }
    th {
      text-align: left; padding: 10px 14px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .5px; color: #64748b;
    }
    th:last-child { text-align: right; }
    td { padding: 14px; font-size: 13px; color: #334155; border-bottom: 1px solid #f1f5f9; }
    td:last-child { text-align: right; font-weight: 600; color: ${accentColor}; }
    tr:last-child td { border-bottom: none; }
    /* Total */
    .total-row {
      display: flex; justify-content: flex-end; margin-top: 20px;
    }
    .total-box {
      background: ${accentLight};
      border: 1.5px solid ${accentColor}22;
      border-radius: 12px;
      padding: 16px 24px;
      min-width: 220px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
    }
    .total-box .tl { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: #64748b; }
    .total-box .tv { font-size: 22px; font-weight: 800; color: ${accentColor}; }
    /* Notes */
    .note-box {
      margin-top: 24px;
      background: #f8fafc;
      border-radius: 10px;
      padding: 14px 18px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .note-box strong { color: #1e293b; }
    /* Footer */
    .footer {
      padding: 20px 40px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer .thank { font-size: 12px; color: #94a3b8; }
    .footer .stamp {
      background: ${accentColor};
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .6px;
      text-transform: uppercase;
      border-radius: 6px;
      padding: 5px 12px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="company">${companyName}</div>
        <div class="sub">Financial Management System</div>
      </div>
      <div class="header-right">
        <div class="badge">${label}</div>
        <div class="inv-no">${invoiceNo}</div>
      </div>
    </div>

    <!-- Meta -->
    <div class="meta">
      <div class="meta-item">
        <div class="label">Invoice No</div>
        <div class="value">${invoiceNo}</div>
      </div>
      <div class="meta-item">
        <div class="label">Entry Date</div>
        <div class="value">${entryDate}</div>
      </div>
      <div class="meta-item">
        <div class="label">Printed On</div>
        <div class="value">${printDate}</div>
      </div>
      ${item.category ? `
      <div class="meta-item">
        <div class="label">Category</div>
        <div class="value">${item.category}</div>
      </div>` : ""}
    </div>

    <!-- Body -->
    <div class="body">
      <div class="section-title">Details</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Type</th>
            <th>Amount (৳)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${item.title}</td>
            <td>${item.category || (isExpense ? "Expense" : "Income")}</td>
            <td>৳ ${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <!-- Total -->
      <div class="total-row">
        <div class="total-box">
          <span class="tl">${signLabel}</span>
          <span class="tv">৳ ${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      ${item.note ? `
      <div class="note-box">
        <strong>Note:</strong> ${item.note}
      </div>` : ""}
    </div>

    <!-- Footer -->
    <div class="footer">
      <span class="thank">Thank you for your record keeping!</span>
      <span class="stamp">${isExpense ? "Paid" : "Received"}</span>
    </div>
  </div>

  <script>
    window.onload = function () { window.print(); };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onafterprint = () => {
      URL.revokeObjectURL(url);
      win.close();
    };
  }
}
