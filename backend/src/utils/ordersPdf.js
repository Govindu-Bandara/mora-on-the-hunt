// Server-side PDF generation for the admin orders export (compact table).
// Sri Lanka has no DST, so a fixed +05:30 offset is safe for "today" boundaries.
const COLOMBO_OFFSET_MIN = 330;

function shiftToColombo(date) {
  return new Date(date.getTime() + COLOMBO_OFFSET_MIN * 60000);
}

// Start/end (UTC instants) of the current Colombo calendar day.
function colomboDayRangeUtc(now = new Date()) {
  const c = shiftToColombo(now);
  const startMs = Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate()) - COLOMBO_OFFSET_MIN * 60000;
  return { start: new Date(startMs), end: new Date(startMs + 24 * 3600000 - 1) };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// YYYY-MM-DD in Colombo time (used for filenames).
function colomboDateString(date = new Date()) {
  const c = shiftToColombo(date);
  return `${c.getUTCFullYear()}-${pad2(c.getUTCMonth() + 1)}-${pad2(c.getUTCDate())}`;
}

// "13 Jul 2026, 14:30" in Colombo time (used in the header).
function colomboDateTimeString(date = new Date()) {
  const c = shiftToColombo(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${c.getUTCDate()} ${months[c.getUTCMonth()]} ${c.getUTCFullYear()}, ${pad2(c.getUTCHours())}:${pad2(c.getUTCMinutes())}`;
}

function abbreviateFaculty(faculty) {
  if (!faculty) return '';
  return faculty.replace(/^Faculty of\s+/i, '');
}

function summarizeItems(items = []) {
  return items
    .map((i) => `${i.quantity}× ${i.name}${i.size ? ` (${i.size})` : ''}`)
    .join(', ');
}

const COLUMNS = [
  { key: 'id', label: 'Order ID', x: 40, w: 66 },
  { key: 'name', label: 'Name', x: 106, w: 118 },
  { key: 'phone', label: 'Telephone', x: 224, w: 72 },
  { key: 'batch', label: 'Batch', x: 296, w: 38 },
  { key: 'faculty', label: 'Faculty', x: 334, w: 64 },
  { key: 'items', label: 'Items', x: 398, w: 205 },
  { key: 'total', label: 'Total', x: 603, w: 52 },
  { key: 'dist', label: 'Dist.', x: 655, w: 32 },
  { key: 'flag', label: 'Flag', x: 687, w: 30 },
  { key: 'date', label: 'Date', x: 717, w: 62 },
];

const CELL_PAD = 3;
const BODY_FONT_SIZE = 8;
const PAGE_BOTTOM = 595.28 - 40; // A4 landscape height minus bottom margin

function drawHeaderRow(doc, y) {
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#000000');
  COLUMNS.forEach((col) => {
    doc.text(col.label, col.x + CELL_PAD, y + CELL_PAD, { width: col.w - CELL_PAD * 2 });
  });
  const headerHeight = 16;
  doc
    .moveTo(40, y + headerHeight)
    .lineTo(779, y + headerHeight)
    .lineWidth(0.5)
    .strokeColor('#333333')
    .stroke();
  return y + headerHeight + 2;
}

function orderToCells(order) {
  return {
    id: order.orderId || '',
    name: order.fullName || '',
    phone: order.telephone || '',
    batch: order.batch || '',
    faculty: abbreviateFaculty(order.faculty),
    items: summarizeItems(order.items),
    total: `Rs. ${order.finalTotal ?? ''}`,
    dist: order.distributed ? 'Yes' : 'No',
    flag: order.flagged ? 'Yes' : '-',
    date: order.createdAt ? colomboDateString(new Date(order.createdAt)) : '',
  };
}

/**
 * Renders the orders report into an existing PDFKit document. Does NOT call
 * doc.end() — the caller owns the stream lifecycle.
 */
function renderOrdersPdf(doc, orders, { rangeLabel, generatedAt = new Date() }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);

  // Header block
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#000000').text('MORA on the Hunt – Orders', 40, 36);
  doc.font('Helvetica').fontSize(9).fillColor('#333333');
  doc.text(`Report: ${rangeLabel}`, 40, 62);
  doc.text(`Generated: ${colomboDateTimeString(generatedAt)} (Sri Lanka time)`, 40, 76);
  doc.text(`Orders: ${orders.length}     Total revenue: Rs. ${totalRevenue}`, 40, 90);

  let y = drawHeaderRow(doc, 112);

  if (orders.length === 0) {
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#666666').text('No orders in this range.', 40, y + 8);
    return;
  }

  doc.font('Helvetica').fontSize(BODY_FONT_SIZE).fillColor('#000000');

  orders.forEach((order) => {
    const cells = orderToCells(order);
    const rowHeight =
      Math.max(
        ...COLUMNS.map((col) =>
          doc.heightOfString(String(cells[col.key]), { width: col.w - CELL_PAD * 2 })
        )
      ) + CELL_PAD * 2;

    if (y + rowHeight > PAGE_BOTTOM) {
      doc.addPage();
      y = drawHeaderRow(doc, 40);
      doc.font('Helvetica').fontSize(BODY_FONT_SIZE).fillColor('#000000');
    }

    COLUMNS.forEach((col) => {
      doc.text(String(cells[col.key]), col.x + CELL_PAD, y + CELL_PAD, {
        width: col.w - CELL_PAD * 2,
      });
    });

    doc
      .moveTo(40, y + rowHeight)
      .lineTo(779, y + rowHeight)
      .lineWidth(0.25)
      .strokeColor('#dddddd')
      .stroke();

    y += rowHeight;
  });
}

module.exports = {
  renderOrdersPdf,
  colomboDayRangeUtc,
  colomboDateString,
};
