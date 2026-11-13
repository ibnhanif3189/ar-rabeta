/* AR-RABETA receipt viewer. */
(function () {
  "use strict";
  var ROOT_ID = "arr-receipt-root";
  var STYLE_ID = "arr-receipt-style";

  var CSS = [
    "#arr-receipt-root{position:fixed;inset:0;z-index:1000;background:rgba(10,20,16,.74);overflow:auto;padding:16px}",
    "#arr-receipt-root .arr-actions{max-width:560px;margin:0 auto 12px;display:flex;gap:10px}",
    "#arr-receipt-root .arr-actions button{flex:1;min-height:48px;border-radius:8px;border:0;font:inherit;font-weight:600;cursor:pointer}",
    "#arr-receipt-root .arr-print{background:#0E6B52;color:#fff}",
    "#arr-receipt-root .arr-close{background:#fff;color:#16241F}",
    "#arr-receipt-root .arr-paper{max-width:560px;margin:0 auto;background:#fff;color:#16241F;padding:26px 22px;border-radius:6px;font-family:system-ui, sans-serif;font-size:14px;line-height:1.5}",
    "#arr-receipt-root .arr-head{text-align:center;border-bottom:2px solid #0E6B52;padding-bottom:12px;margin-bottom:14px; position:relative}",
    "#arr-receipt-root .arr-logo{max-width:100px;max-height:80px;margin-bottom:8px;border-radius:8px}",
    "#arr-receipt-root .arr-title{font-weight:700;font-size:1.3rem;margin:4px 0 0;text-transform:uppercase}",
    "#arr-receipt-root .arr-meta{display:flex;justify-content:space-between;margin-bottom:10px;font-size:0.9rem}",
    "#arr-receipt-root .arr-member-info{display:flex;gap:12px;align-items:center;margin-bottom:12px;background:#f9f9f9;padding:10px;border-radius:6px}",
    "#arr-receipt-root .arr-member-pic{width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid #0E6B52}",
    "#arr-receipt-root .arr-rows{width:100%;border-collapse:collapse;margin-top:10px}",
    "#arr-receipt-root .arr-rows th,#arr-receipt-root .arr-rows td{text-align:left;padding:8px 4px;border-bottom:1px solid #D5DDD8}",
    "#arr-receipt-root .arr-rows th{width:35%;color:#55665F}",
    "#arr-receipt-root .arr-table{width:100%;border-collapse:collapse;margin-top:5px}",
    "#arr-receipt-root .arr-table td{padding:4px 0;border-bottom:1px dashed #ccc}",
    "#arr-receipt-root .arr-table td:last-child{text-align:right}",
    "#arr-receipt-root .arr-amount{margin:16px 0;padding:12px;border:2px solid #0E6B52;display:flex;justify-content:space-between;font-weight:bold}",
    "#arr-receipt-root .arr-sign{margin-top:40px;display:flex;justify-content:flex-end}",
    "#arr-receipt-root .arr-sign div{min-width:190px;text-align:center}",
    "#arr-receipt-root .arr-sign .nm{font-style:italic;font-size:1.1rem;min-height:34px}",
    "#arr-receipt-root .arr-sign .ln{border-top:1px solid #16241F;padding-top:4px;font-size:.85rem;color:#55665F}",
    "@media print{",
    "body>*:not(#arr-receipt-root){display:none!important}",
    "#arr-receipt-root{position:static;background:none;padding:0}",
    "#arr-receipt-root .arr-actions{display:none!important}",
    "}"
  ].join("\n");

  var nf = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 });
  var dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  var monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  
  var TYPES = {
    deposit: { title: "Deposit Receipt", label: "Member Deposit" },
    expense: { title: "Expense Voucher", label: "Expense" },
    investment: { title: "Investment Voucher", label: "Investment" },
    investment_return: { title: "Return Voucher", label: "Investment Return" },
    other_income: { title: "Income Voucher", label: "Other Income" }
  };

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function close() { var r = document.getElementById(ROOT_ID); if (r) r.parentNode.removeChild(r); }
  function addRow(tbody, k, v) { if (!v) return; var tr = el("tr"); tr.appendChild(el("th", null, k)); tr.appendChild(el("td", null, v)); tbody.appendChild(tr); }

  function show(r) {
    close();
    if (!document.getElementById(STYLE_ID)) { var st = el("style"); st.id = STYLE_ID; st.textContent = CSS; document.head.appendChild(st); }
    var t = TYPES[r.type] || { title: "Receipt", label: r.type };

    var root = el("div"); root.id = ROOT_ID;
    var actions = el("div", "arr-actions");
    var pbtn = el("button", "arr-print", "Print / Save PDF"); pbtn.onclick = function() { window.print(); };
    var cbtn = el("button", "arr-close", "Close"); cbtn.onclick = close;
    actions.appendChild(pbtn); actions.appendChild(cbtn); root.appendChild(actions);

    var paper = el("div", "arr-paper");
    
    var head = el("div", "arr-head");
    // আপনার লোগো এখানে যুক্ত করা হলো (রিপোজিটরিতে logo.jpg থাকলে দেখাবে)
    head.innerHTML = `<img src="logo.jpg" class="arr-logo" onerror="this.style.display='none'">`;
    head.appendChild(el("div", "arr-title", "AR-RABETA"));
    head.appendChild(el("div", null, t.title));
    paper.appendChild(head);

    var meta = el("div", "arr-meta");
    meta.appendChild(el("span", null, "Receipt No: " + r.receipt_no));
    meta.appendChild(el("span", null, "Date: " + dayFmt.format(new Date(r.date + "T00:00:00Z"))));
    paper.appendChild(meta);

    // সদস্যের বিস্তারিত তথ্য
    if (r.member) {
      var mInfo = el("div", "arr-member-info");
      if (r.member.photo) {
        var pic = el("img", "arr-member-pic"); pic.src = r.member.photo; mInfo.appendChild(pic);
      }
      var mText = el("div");
      mText.appendChild(el("div", null, "Member: " + r.member.name + " (" + r.member.no + ")"));
      if (r.member.phone) mText.appendChild(el("div", null, "Phone: " + r.member.phone));
      if (r.member.address) mText.appendChild(el("div", null, "Address: " + r.member.address));
      mInfo.appendChild(mText);
      paper.appendChild(mInfo);
    }

    var table = el("table", "arr-rows");
    var tb = el("tbody");
    addRow(tb, "Type", t.label);
    
    // বিনিয়োগকারীর তথ্য (যদি থাকে)
    if (r.investor_name) {
      addRow(tb, "Investor Name", r.investor_name);
      addRow(tb, "Investor Phone", r.investor_phone);
      addRow(tb, "Investor Address", r.investor_address);
      addRow(tb, "Investor NID", r.investor_nid);
    }
    
    // INV নম্বর
    if (r.investment_no) {
      addRow(tb, "Investment No", r.investment_no);
    }

    if (r.periods && r.periods.length > 0) {
      var trP = el("tr");
      trP.appendChild(el("th", null, "Months & Amounts"));
      var tdP = el("td");
      var tTable = el("table", "arr-table");
      r.periods.forEach(function(p) {
        var pTr = el("tr");
        pTr.appendChild(el("td", null, monthFmt.format(new Date(p.month + "T00:00:00Z"))));
        pTr.appendChild(el("td", null, nf.format(p.amount)));
        tTable.appendChild(pTr);
      });
      tdP.appendChild(tTable);
      trP.appendChild(tdP);
      tb.appendChild(trP);
    } else if (r.month) {
      addRow(tb, "Month", monthFmt.format(new Date(r.month + "T00:00:00Z")));
    }
    
    addRow(tb, "Category", r.category);
    addRow(tb, "Description", r.description);
    addRow(tb, "Reference", r.reference);
    table.appendChild(tb);
    paper.appendChild(table);

    var amt = el("div", "arr-amount");
    amt.appendChild(el("span", null, "Total Amount"));
    amt.appendChild(el("span", null, "BDT " + nf.format(Number(r.amount))));
    paper.appendChild(amt);

    var sign = el("div", "arr-sign");
    var box = el("div");
    box.appendChild(el("div", "nm", "Tanvir"));
    box.appendChild(el("div", "ln", "Finance Editor"));
    sign.appendChild(box);
    paper.appendChild(sign);

    root.appendChild(paper);
    document.body.appendChild(root);
  }

  window.ARReceipt = { show: show, close: close };
})();
