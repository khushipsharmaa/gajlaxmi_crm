(() => {
  const F = window.SocietyFinance;
  const STORE_KEY = "gajlaxmi-bank-demo-v1";
  const DEMO_CURRENCY = "INR";
  const pages = {
    overview: "Overview", members: "Members", agents: "Agent portal", collections: "Collections",
    savings: "Savings", loans: "Loans", deposits: "RD & FD", reports: "Reports",
    schemes: "Schemes & controls", demo: "Demo workspace"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const today = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const id = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const amount = (minor) => F.money(minor || 0, DEMO_CURRENCY);
  const numberInput = (value) => F.fromMinor(value || 0).toFixed(2);
  const niceDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
  const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const normalize = (value) => String(value || "").toLowerCase().replace(/[_-]+/g, " ");

  function seededState() {
    const members = [
      { id: "MB-24018", name: "Maya Chen", phone: "+1 202 555 0138", email: "maya.chen@example.test", joined: "2025-03-12", status: "Active", address: "18 Orchard Walk", nominee: "Lin Chen · Sister", nomineeRelation: "Sister", verification: "Verified", documents: ["Identity document", "Address proof"] },
      { id: "MB-24019", name: "Jonah Reyes", phone: "+1 202 555 0164", email: "jonah.reyes@example.test", joined: "2025-04-02", status: "Active", address: "7 Cedar Lane", nominee: "Elena Reyes · Spouse", nomineeRelation: "Spouse", verification: "Verified", documents: ["Identity document"] },
      { id: "MB-24020", name: "Amina Patel", phone: "+1 202 555 0149", email: "amina.patel@example.test", joined: "2025-05-18", status: "Active", address: "52 Market Street", nominee: "Ravi Patel · Parent", nomineeRelation: "Parent", verification: "Review needed", documents: ["Identity document", "Address proof"] },
      { id: "MB-24021", name: "Oliver Brooks", phone: "+1 202 555 0192", email: "oliver.brooks@example.test", joined: "2025-06-21", status: "Active", address: "103 Mill Road", nominee: "Tess Brooks · Partner", nomineeRelation: "Partner", verification: "Verified", documents: ["Identity document", "Address proof"] },
      { id: "MB-24022", name: "Priya Nair", phone: "+1 202 555 0171", email: "priya.nair@example.test", joined: "2025-07-09", status: "Active", address: "4 Willow Court", nominee: "Anil Nair · Parent", nomineeRelation: "Parent", verification: "Verified", documents: ["Identity document"] },
      { id: "MB-24023", name: "Sam Okafor", phone: "+1 202 555 0115", email: "sam.okafor@example.test", joined: "2025-08-14", status: "Active", address: "28 Greenway", nominee: "Ada Okafor · Spouse", nomineeRelation: "Spouse", verification: "Review needed", documents: [] },
      { id: "MB-24024", name: "Lena Fischer", phone: "+1 202 555 0180", email: "lena.fischer@example.test", joined: "2025-09-27", status: "Active", address: "9 River Terrace", nominee: "Max Fischer · Parent", nomineeRelation: "Parent", verification: "Verified", documents: ["Identity document", "Address proof"] },
      { id: "MB-24025", name: "Elias Ward", phone: "+1 202 555 0126", email: "elias.ward@example.test", joined: "2025-10-11", status: "Active", address: "61 Station Road", nominee: "Nora Ward · Spouse", nomineeRelation: "Spouse", verification: "Verified", documents: ["Identity document", "Address proof"] }
    ];
    const agents = [
      { id: "AG-004", name: "Nora James", phone: "+1 202 555 0107", area: "North district", active: true, attendance: "Present" },
      { id: "AG-006", name: "Leo Martin", phone: "+1 202 555 0128", area: "Market district", active: true, attendance: "Present" },
      { id: "AG-009", name: "Zara Ali", phone: "+1 202 555 0156", area: "Riverside", active: true, attendance: "Not checked in" }
    ];
    members.forEach((member, index) => { member.agentId = agents[index % agents.length].id; });
    const schemes = {
      savings: [{ id: "SCH-S01", name: "Everyday Saver · illustrative", annualRate: 2.5, withdrawalApproval: true, overdraftAllowed: false, active: true, note: "Example terms only; confirm actual policy." }],
      loans: [
        { id: "SCH-L01", name: "Steady Steps · illustrative", annualRate: 10, method: "reducing", frequency: "monthly", graceDays: 5, lateFeeMinor: 500, active: true },
        { id: "SCH-L02", name: "Flat Rate Example · illustrative", annualRate: 8, method: "flat", frequency: "monthly", graceDays: 5, lateFeeMinor: 500, active: true }
      ],
      rd: [{ id: "SCH-R01", name: "Monthly Builder · illustrative", annualRate: 5, compounding: 12, frequency: "monthly", penaltyMinor: 0, active: true }],
      fd: [{ id: "SCH-F01", name: "Term Deposit · illustrative", annualRate: 6, compounding: 4, payoutFrequency: "at maturity", active: true }]
    };
    const state = { members, agents, schemes, savings: [], loans: [], rds: [], fds: [], collections: [], requests: [], handovers: [], transactions: [], activity: [], sequence: 410, lastPage: "overview" };

    const addPosted = ({ reference, kind, memberId = null, accountId = null, amountMinor, entries, metadata = {} }) => {
      state.transactions.push({ id: id("TX"), reference, kind, memberId, accountId, amountMinor, entries, metadata, status: "posted", createdAt: new Date().toISOString(), reversalOf: null });
    };
    const journal = (amountMinor, debit, credit) => [
      { account: debit, debitMinor: amountMinor, creditMinor: 0 },
      { account: credit, debitMinor: 0, creditMinor: amountMinor }
    ];
    members.forEach((member, index) => {
      const account = { id: `SA-${24018 + index}`, number: `1000 ${String(3180 + index).padStart(4, "0")}`, memberId: member.id, schemeId: "SCH-S01", opened: member.joined, openingBalanceMinor: F.toMinor([780, 420, 1260, 950, 580, 300, 1630, 740][index]), schemeSnapshot: { name: schemes.savings[0].name, annualRate: schemes.savings[0].annualRate, withdrawalApproval: true, overdraftAllowed: false } };
      state.savings.push(account);
      addPosted({ reference: `OPEN-${account.number.replace(/\s/g, "")}`, kind: "opening_balance", memberId: member.id, accountId: account.id, amountMinor: account.openingBalanceMinor, entries: journal(account.openingBalanceMinor, "Cash at bank", "Member savings liability"), metadata: { openingDate: account.opened } });
    });
    addPosted({ reference: "DEP-409", kind: "deposit", memberId: "MB-24018", accountId: "SA-24018", amountMinor: F.toMinor(120), entries: journal(F.toMinor(120), "Cash at bank", "Member savings liability"), metadata: { paymentMode: "Bank transfer" } });
    addPosted({ reference: "COL-408", kind: "collection_savings", memberId: "MB-24019", accountId: "SA-24019", amountMinor: F.toMinor(40), entries: journal(F.toMinor(40), "Cash on hand", "Member savings liability"), metadata: { paymentMode: "Cash", agentId: "AG-004" } });
    const loan = { id: "LN-801", memberId: "MB-24020", applicationDate: "2026-01-12", purpose: "Tools for home studio", requestedMinor: F.toMinor(2400), approvedMinor: F.toMinor(2400), tenureMonths: 12, schemeId: "SCH-L01", schemeSnapshot: { name: schemes.loans[0].name, annualRate: 10, method: "reducing", frequency: "monthly", graceDays: 5, lateFeeMinor: 500 }, status: "Active", disbursed: true, disbursedDate: "2026-01-15", firstDueDate: "2026-02-15", principalOutstandingMinor: F.toMinor(1600), totalDueMinor: 0, guarantor: "Jonah Reyes", documents: ["Application form", "Income note"], schedule: [] , payments: [] };
    loan.schedule = F.loanSchedule({ principalMinor: loan.approvedMinor, annualRate: 10, months: 12, method: "reducing", firstDueDate: loan.firstDueDate });
    loan.schedule.slice(0, 2).forEach((row) => { row.status = "Paid"; });
    loan.schedule[2].status = "Overdue";
    loan.schedule[3].status = "Due";
    loan.schedule.slice(4).forEach((row) => { row.status = "Upcoming"; });
    state.loans.push(loan);
    addPosted({ reference: "DISB-801", kind: "loan_disbursement", memberId: loan.memberId, accountId: loan.id, amountMinor: loan.approvedMinor, entries: journal(loan.approvedMinor, "Loans receivable · principal", "Cash at bank"), metadata: { disbursedDate: loan.disbursedDate, schemeSnapshot: loan.schemeSnapshot } });
    const secondLoan = { id: "LN-802", memberId: "MB-24024", applicationDate: "2026-03-02", purpose: "Seasonal inventory", requestedMinor: F.toMinor(1600), approvedMinor: 0, tenureMonths: 10, status: "Under review", disbursed: false, guarantor: "Oliver Brooks", documents: ["Application form"] };
    state.loans.push(secondLoan);
    const rd = { id: "RD-301", number: "RD-00301", memberId: "MB-24022", schemeId: "SCH-R01", schemeSnapshot: { name: schemes.rd[0].name, annualRate: 5, compounding: 12, frequency: "monthly", dayCount: "Actual/365", rounding: "Nearest cent" }, installmentMinor: F.toMinor(80), frequency: "monthly", installments: 12, startDate: "2025-11-15", maturityDate: "2026-11-15", status: "Active", schedule: [], paidMinor: F.toMinor(560), payoutHistory: [] };
    rd.schedule = Array.from({ length: rd.installments }, (_, index) => ({ installment: index + 1, dueDate: new Date(new Date(`${rd.startDate}T12:00:00`).setMonth(new Date(`${rd.startDate}T12:00:00`).getMonth() + index + 1)).toISOString().slice(0, 10), amountMinor: rd.installmentMinor, status: index < 7 ? "Paid" : index === 7 ? "Overdue" : "Upcoming" }));
    state.rds.push(rd);
    const fd = { id: "FD-201", certificate: "FD-00201", memberId: "MB-24025", schemeId: "SCH-F01", schemeSnapshot: { name: schemes.fd[0].name, annualRate: 6, compounding: 4, payoutFrequency: "at maturity", dayCount: "Actual/365", rounding: "Nearest cent" }, principalMinor: F.toMinor(1800), bookingDate: "2025-12-03", tenureYears: 1, maturityDate: "2026-12-03", payoutOption: "Cumulative", status: "Active", payoutHistory: [], renewedFrom: null };
    state.fds.push(fd);
    const collected = [
      { memberId: "MB-24018", accountId: "SA-24018", agentId: "AG-004", amountMinor: F.toMinor(32), paymentMode: "Cash", status: "Posted", date: today(), receipt: "RC-4101", product: "Savings", time: "09:18", location: "North market" },
      { memberId: "MB-24019", accountId: "SA-24019", agentId: "AG-006", amountMinor: F.toMinor(24), paymentMode: "Mobile transfer", status: "Posted", date: today(), receipt: "RC-4102", product: "Savings", time: "10:06", location: "Market square" },
      { memberId: "MB-24022", accountId: rd.id, agentId: "AG-004", amountMinor: F.toMinor(80), paymentMode: "Cash", status: "Pending verification", date: today(), receipt: "RC-4103", product: "RD", time: "10:42", location: "Willow Court" }
    ];
    state.collections = collected;
    addPosted({ reference: "RC-4101", kind: "collection_savings", memberId: "MB-24018", accountId: "SA-24018", amountMinor: F.toMinor(32), entries: journal(F.toMinor(32), "Cash on hand", "Member savings liability"), metadata: { paymentMode: "Cash", agentId: "AG-004" } });
    addPosted({ reference: "RC-4102", kind: "collection_savings", memberId: "MB-24019", accountId: "SA-24019", amountMinor: F.toMinor(24), entries: journal(F.toMinor(24), "Cash at bank", "Member savings liability"), metadata: { paymentMode: "Mobile transfer", agentId: "AG-006" } });
    state.requests = [
      { id: "RQ-001", type: "savings_withdrawal", memberId: "MB-24021", accountId: "SA-24021", amountMinor: F.toMinor(60), status: "Pending", createdAt: new Date().toISOString(), maker: "Admin desk", note: "Member counter request" },
      { id: "RQ-002", type: "collection", collectionIndex: 2, memberId: "MB-24022", accountId: rd.id, amountMinor: F.toMinor(80), status: "Pending", createdAt: new Date().toISOString(), maker: "Nora James", note: "Collection RC-4103 awaiting verification" }
    ];
    state.handovers = [{ id: "HO-092", agentId: "AG-004", date: today(), amountMinor: F.toMinor(32), status: "Awaiting reconciliation", receipts: ["RC-4101"], createdAt: new Date().toISOString() }];
    state.activity = [
      { date: new Date().toISOString(), title: "Daily collection recorded", detail: "Receipt RC-4103 · awaiting verification", actor: "Nora James" },
      { date: new Date().toISOString(), title: "Savings withdrawal submitted", detail: "MB-24021 · approval required", actor: "Admin desk" },
      { date: new Date(Date.now() - 86400000).toISOString(), title: "Loan disbursed", detail: "LN-801 · illustrative reducing-balance terms", actor: "Admin desk" }
    ];
    return state;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && Array.isArray(saved.members) && Array.isArray(saved.transactions)) return saved;
      }
    } catch (error) {
      console.warn("Demo data could not be restored", error);
    }
    return seededState();
  }
  let state = loadState();
  const isAgentPortal = document.body.dataset.portal === "agent";
  let currentPage = isAgentPortal ? "agents" : state.lastPage || "overview";
  state.members.forEach((member, index) => {
    if (!member.agentId && state.agents.length) member.agentId = state.agents[index % state.agents.length].id;
  });
  let memberSearch = "";
  let collectionFilter = "All";
  let selectedAgent = "AG-004";
  let reportFilter = "All";
  let demoScenario = "";
  let locationWatchId = null;

  function save() {
    if (!isAgentPortal) state.lastPage = currentPage;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (error) { toast("Browser storage is full; this change may not persist after closing the tab.", true); }
  }
  function getMember(memberId) { return state.members.find((member) => member.id === memberId) || { id: memberId || "—", name: "Unknown member", phone: "", status: "Unknown" }; }
  function getSavings(accountId) { return state.savings.find((account) => account.id === accountId); }
  function getProduct(accountId) { return getSavings(accountId) || state.rds.find((account) => account.id === accountId) || state.fds.find((account) => account.id === accountId) || state.loans.find((account) => account.id === accountId); }
  function getAgent(agentId) { return state.agents.find((agent) => agent.id === agentId) || { name: "Unassigned" }; }
  function ledger() { return new F.Ledger(state.transactions); }
  function accountBalance(accountId) { return ledger().accountBalance(accountId); }
  function accountNumber(accountId) { const item = getProduct(accountId); return item?.number || item?.certificate || item?.id || accountId || "—"; }
  function activity(title, detail, actor = "Admin desk") { state.activity.unshift({ date: new Date().toISOString(), title, detail, actor }); state.activity = state.activity.slice(0, 80); }
  function journal(amountMinor, debit, credit) { return [{ account: debit, debitMinor: amountMinor, creditMinor: 0 }, { account: credit, debitMinor: 0, creditMinor: amountMinor }]; }
  function postTransaction({ reference, kind, memberId, accountId, amountMinor, entries, metadata = {} }) {
    const book = ledger();
    const result = book.post({ reference, kind, memberId, accountId, amountMinor, entries, metadata });
    if (result.duplicate) return result;
    state.transactions = book.records;
    save();
    return result;
  }
  function currencySum(records, key = "amountMinor") { return records.reduce((sum, item) => sum + (item[key] || 0), 0); }
  function toast(message, error = false) {
    const node = document.createElement("div");
    node.className = `toast${error ? " toast-error" : ""}`;
    node.textContent = message;
    $("#toast-region").append(node);
    setTimeout(() => node.remove(), 3600);
  }
  function showDialog(content) {
    $("#dialog-content").innerHTML = content;
    const dialog = $("#app-dialog");
    if (!dialog.open) dialog.showModal();
  }
  function closeDialog() { $("#app-dialog").close(); }
  function navigate(page) {
    if (!pages[page]) return;
    if (isAgentPortal && !["agents", "collections"].includes(page)) return toast("This page is available in the admin panel.", true);
    currentPage = page;
    save();
    $$(".nav-link").forEach((item) => item.classList.toggle("is-active", item.dataset.page === page));
    $("#page-crumb").textContent = pages[page];
    $("#sidebar").classList.remove("is-open");
    renderPage();
  }
  function pageHeader(title, description, actions = "", eyebrow = "Society operations") {
    return `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p>${esc(description)}</p></div><div class="heading-actions">${actions}</div></div>`;
  }
  function metric(label, value, foot, symbol, tone = "") {
    return `<div class="metric-card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-symbol ${tone}">${symbol}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></div>`;
  }
  function statusPill(status) { const normalized = normalize(status).replace(/\s/g, "-"); return `<span class="status status-${esc(normalized)}">${esc(status || "Unknown")}</span>`; }
  function memberLink(memberId) {
    const member = getMember(memberId);
    return `<button class="member-name-button" data-action="member-detail" data-id="${esc(member.id)}"><span class="member-cell"><span class="member-initials">${esc(initials(member.name))}</span><span><span class="table-main">${esc(member.name)}</span><span class="table-sub">${esc(member.id)}</span></span></span></button>`;
  }
  function sectionTitle(title, detail = "", action = "") {
    return `<div class="section-title-row"><div><h2>${title}</h2>${detail ? `<p>${detail}</p>` : ""}</div>${action}</div>`;
  }
  function recordsTable(headers, rows, emptyTitle, emptyDetail) {
    return `<div class="panel table-wrap"><table class="data-table"><thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead><tbody>${rows || `<tr><td class="empty-cell" colspan="${headers.length}"><div class="empty-state"><strong>${emptyTitle}</strong><p>${emptyDetail}</p></div></td></tr>`}</tbody></table></div>`;
  }
  function pendingRequests(type) { return state.requests.filter((request) => request.status === "Pending" && (!type || request.type === type)); }
  function requestActions(request) {
    return `<button class="button button-small button-primary" data-action="approve-request" data-id="${esc(request.id)}">Approve</button> <button class="button button-small button-danger" data-action="reject-request" data-id="${esc(request.id)}">Reject</button>`;
  }
  function requestLabel(request) {
    return ({ savings_withdrawal: "Savings withdrawal", savings_deposit: "Savings deposit", collection: "Collection verification", disbursement: "Loan disbursement", reversal: "Transaction reversal", maturity_payout: "Maturity payout", interest_payout: "Interest payout", rd_closure: "RD premature closure", fd_closure: "FD premature closure", loan_closure: "Loan closure" })[request.type] || normalize(request.type);
  }
  function requestRows(requests = pendingRequests()) {
    return requests.map((request) => `<tr><td><span class="table-main">${requestLabel(request)}</span><span class="table-sub">${esc(request.id)} · ${niceDate(request.createdAt.slice(0, 10))}</span></td><td>${memberLink(request.memberId)}</td><td>${esc(accountNumber(request.accountId))}</td><td class="money">${amount(request.amountMinor)}</td><td>${statusPill(request.status)}</td><td>${requestActions(request)}</td></tr>`).join("");
  }
  function ledgerRows(records, includeMember = true) {
    return records.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((record) => `<tr><td><span class="table-main">${esc(normalize(record.kind))}</span><span class="table-sub">${esc(record.reference)}</span></td>${includeMember ? `<td>${memberLink(record.memberId)}</td>` : ""}<td>${esc(accountNumber(record.accountId))}</td><td class="money ${record.kind === "withdrawal" || record.kind === "loan_disbursement" ? "money-negative" : "money-positive"}">${amount(record.amountMinor)}</td><td>${statusPill(record.status)}</td><td>${niceDate(record.createdAt.slice(0, 10))}</td><td>${record.status === "posted" && !record.reversedBy && record.kind !== "reversal" ? `<button class="button button-small" data-action="reverse-transaction" data-reference="${esc(record.reference)}">Request correction</button>` : record.reversalOf ? `<span class="table-sub">Reverses ${esc(record.reversalOf)}</span>` : "—"}</td></tr>`).join("");
  }
  function renderOverview() {
    const members = state.members.length;
    const savingsTotal = state.savings.reduce((sum, account) => sum + accountBalance(account.id), 0);
    const activeLoans = state.loans.filter((loan) => loan.disbursed && loan.status === "Active");
    const principalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.principalOutstandingMinor, 0);
    const postedToday = state.collections.filter((item) => item.status === "Posted" && item.date === today());
    const pending = pendingRequests().length;
    const activeAgentCount = state.agents.filter((agent) => agent.active).length;
    const fieldAgentCount = state.agents.filter((agent) => agent.active && agent.attendance === "Present").length;
    const agentsWithReceiptsToday = new Set(state.collections.filter((collection) => collection.date === today()).map((collection) => collection.agentId)).size;
    const cashPostedToday = currencySum(state.collections.filter((collection) => collection.date === today() && collection.status === "Posted" && collection.paymentMode === "Cash"));
    const chart = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - offset));
      const dateKey = date.toISOString().slice(0, 10);
      const posted = state.collections.filter((item) => item.date === dateKey && item.status === "Posted");
      const savings = posted.filter((item) => item.product === "Savings").reduce((sum, item) => sum + item.amountMinor, 0);
      const credit = posted.filter((item) => item.product !== "Savings").reduce((sum, item) => sum + item.amountMinor, 0);
      const max = Math.max(1, ...state.collections.filter((item) => item.status === "Posted").map((item) => item.amountMinor * 3));
      const a = Math.max(savings ? 11 : 3, Math.min(100, savings / max * 480));
      const b = Math.max(credit ? 11 : 3, Math.min(100, credit / max * 480));
      return `<div class="chart-day"><div class="chart-bars"><span class="chart-bar" style="height:${a}%" title="${amount(savings)} savings"></span><span class="chart-bar chart-bar-secondary" style="height:${b}%" title="${amount(credit)} RD / loan"></span></div><span class="chart-label">${date.toLocaleDateString("en-US", { weekday: "short" })}</span></div>`;
    }).join("");
    const due = state.loans.filter((loan) => loan.disbursed).flatMap((loan) => loan.schedule.filter((row) => row.status === "Due" || row.status === "Overdue"));
    const dueTotal = due.reduce((sum, row) => sum + row.paymentMinor, 0);
    const maturityAccounts = [...state.rds, ...state.fds].filter((account) => account.status === "Active" && account.maturityDate <= new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10));
    const recent = state.transactions.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const quickActions = [
      ["＋", "Add a member", "Create a member profile", "new-member"], ["↗", "Record collection", "Issue a demo receipt", "new-collection"],
      ["▤", "Open savings", "Create a member account", "new-savings"], ["↙", "New loan application", "Preview before review", "new-loan"]
    ].map(([icon, title, sub, action]) => `<button class="quick-action" data-action="${action}"><span class="quick-action-icon">${icon}</span><span><strong>${title}</strong><small>${sub}</small></span></button>`).join("");
    const rows = recent.map((record) => `<tr><td><span class="table-main">${esc(normalize(record.kind))}</span><span class="table-sub">${esc(record.reference)}</span></td><td>${memberLink(record.memberId)}</td><td class="money">${amount(record.amountMinor)}</td><td>${statusPill(record.status)}</td></tr>`).join("");
    const actions = `<button class="button" data-action="export-transactions">↓ Export</button><button class="button button-primary" data-action="new-collection">＋ Record collection</button>`;
    const fieldTeam = `<section class="section-block field-team-panel"><div class="section-title-row"><div><h2>Field team today</h2><p>Agent activity and cash are from today's shared receipt records.</p></div><button class="text-button" data-page="agents">Manage agents &amp; locations →</button></div><div class="metric-grid">${metric("Active agents", activeAgentCount, "Enabled for collection", "◎")}${metric("Out in field", fieldAgentCount, "Active · checked in", "↗")}${metric("Agents with receipts", agentsWithReceiptsToday, "At least one receipt recorded", "▤")}${metric("Cash posted", amount(cashPostedToday), "Cash receipts only · posted", "₹")}</div></section>`;
    return `${pageHeader("Good morning, Admin desk", "A single view of members, field activity and society finances.", actions, "Friday · operations overview")}
      ${fieldTeam}
      <div class="metric-grid">
        ${metric("Total members", members, `<span class="positive">${state.members.filter((member) => member.verification === "Verified").length} verified</span> · ${state.members.filter((member) => member.verification !== "Verified").length} need review`, "♧")}
        ${metric("Savings balances", amount(savingsTotal), `${state.savings.length} active accounts · posted only`, "▤")}
        ${metric("Today's collections", amount(currencySum(postedToday)), `<span class="warning">${pendingRequests("collection").length} pending verification</span>`, "↗")}
        ${metric("Loan principal outstanding", amount(principalOutstanding), `${activeLoans.length} active loans · ${amount(dueTotal)} due`, "↙")}
      </div>
      <div class="content-grid"><div>
        <section class="section-block">${sectionTitle("Collections this week", "Posted field collections · illustrative demo currency", `<div class="chart-legend"><span class="legend-item"><span class="legend-dot"></span>Savings</span><span class="legend-item"><span class="legend-dot legend-dot-amber"></span>RD / loan</span></div>`)}<div class="panel chart-panel"><div class="collection-chart">${chart}</div><div class="chart-scale"><span>${amount(0)}</span><span>Daily activity</span><span>${amount(Math.max(...state.collections.map((item) => item.amountMinor), F.toMinor(100)) * 3)}</span></div></div></section>
        <section class="section-block">${sectionTitle("Recent posted activity", "Member-facing balances derive from these posted entries.", `<button class="text-button" data-page="reports">View ledger →</button>`)}${recordsTable(["Transaction", "Member", "Amount", "Status"], rows, "No posted transactions", "Approved financial transactions will appear here.")}</section>
      </div><div>
        <section class="section-block">${sectionTitle("Needs attention", "Maker and approver actions stay separate.", `<button class="text-button" data-page="collections">View all →</button>`)}<div class="panel panel-pad">${pending ? `<div class="product-list">${pendingRequests().slice(0, 4).map((request) => `<div class="product-row"><span class="product-icon">!</span><span class="product-row-copy"><strong>${requestLabel(request)}</strong><small>${esc(getMember(request.memberId).name)} · ${esc(accountNumber(request.accountId))}</small></span><span class="product-row-value"><strong>${amount(request.amountMinor)}</strong><small>${statusPill(request.status)}</small></span></div>`).join("")}</div>` : `<div class="empty-state"><strong>All caught up</strong><p>There are no approval requests waiting.</p></div>`}</div></section>
        <section class="section-block">${sectionTitle("Common actions", "") }<div class="quick-actions">${quickActions}</div></section>
        <section class="section-block">${sectionTitle("Portfolio snapshot", "Active product accounts") }<div class="panel panel-pad"><div class="product-list"><div class="product-row"><span class="product-icon">▤</span><span class="product-row-copy"><strong>Savings</strong><small>${state.savings.length} accounts</small></span><span class="product-row-value"><strong>${amount(savingsTotal)}</strong><small>posted balance</small></span></div><div class="product-row"><span class="product-icon">↙</span><span class="product-row-copy"><strong>Loans</strong><small>${activeLoans.length} active · ${state.loans.filter((loan) => loan.status === "Under review").length} in review</small></span><span class="product-row-value"><strong>${amount(principalOutstanding)}</strong><small>principal due</small></span></div><div class="product-row"><span class="product-icon">◷</span><span class="product-row-copy"><strong>RD &amp; FD</strong><small>${state.rds.filter((item) => item.status === "Active").length} RD · ${state.fds.filter((item) => item.status === "Active").length} FD</small></span><span class="product-row-value"><strong>${maturityAccounts.length}</strong><small>maturities in 45d</small></span></div></div></div></section>
      </div></div>`;
  }
  function renderMembers() {
    const filtered = state.members.filter((member) => `${member.name} ${member.id} ${member.phone}`.toLowerCase().includes(memberSearch.toLowerCase()));
    const rows = filtered.map((member) => {
      const savings = state.savings.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + accountBalance(item.id), 0);
      const products = state.loans.filter((item) => item.memberId === member.id).length + state.rds.filter((item) => item.memberId === member.id).length + state.fds.filter((item) => item.memberId === member.id).length;
      const agentOptions = state.agents.map((agent) => `<option value="${esc(agent.id)}" ${member.agentId === agent.id ? "selected" : ""}>${esc(agent.name)}</option>`).join("");
      return `<tr><td>${memberLink(member.id)}</td><td>${esc(member.phone)}</td><td>${niceDate(member.joined)}</td><td>${statusPill(member.verification)}</td><td><select class="filter-select assignment-select" data-member-agent data-member-id="${esc(member.id)}">${agentOptions}</select></td><td>${state.savings.filter((item) => item.memberId === member.id).length + products} accounts</td><td class="money">${amount(savings)}</td><td><button class="button button-small" data-action="member-detail" data-id="${esc(member.id)}">Open profile</button></td></tr>`;
    }).join("");
    return `${pageHeader("Members", "Consolidated identity, product accounts and activity.", `<button class="button" data-action="export-members">↓ Export</button><button class="button button-primary" data-action="new-member">＋ Add member</button>`, "Member register")}
      <div class="filter-bar"><label class="search-box"><span aria-hidden="true">⌕</span><input id="member-search" type="search" placeholder="Search name, ID or phone" value="${esc(memberSearch)}"></label><select class="filter-select" id="member-verification-filter"><option>All verification</option><option>Verified</option><option>Review needed</option></select></div>
      <section class="section-block">${sectionTitle(`${filtered.length} members`, "Assign each member to an agent; the agent portal only shows that route.")}${recordsTable(["Member", "Phone", "Joined", "Verification", "Collection agent", "Products", "Savings balance", ""], rows, "No members found", "Adjust the search or add a member.")}</section>`;
  }
  function loanDues(loan, asOf = today()) {
    const graceDays = Number(loan.schemeSnapshot?.graceDays || 0);
    const lateFeeMinor = Number(loan.schemeSnapshot?.lateFeeMinor || 0);
    const paidPenaltyMinor = (loan.payments || []).reduce((sum, payment) => sum + (payment.penaltyMinor || 0), 0);
    const rows = (loan.schedule || []).filter((row) => row.status !== "Paid" && row.dueDate <= asOf);
    const graceCutoff = new Date(`${asOf}T12:00:00`);
    graceCutoff.setDate(graceCutoff.getDate() - graceDays);
    const overdueRows = rows.filter((row) => new Date(`${row.dueDate}T12:00:00`) < graceCutoff);
    return {
      rows,
      overdueRows,
      penaltyDueMinor: Math.max(0, overdueRows.length * lateFeeMinor - paidPenaltyMinor),
      emiDueMinor: rows.reduce((sum, row) => sum + Math.max(0, row.paymentMinor - (row.principalPaidMinor || 0) - (row.interestPaidMinor || 0)), 0),
      interestDueMinor: rows.reduce((sum, row) => sum + Math.max(0, row.interestMinor - (row.interestPaidMinor || 0)), 0)
    };
  }
  function renderAgents() {
    const agent = getAgent(selectedAgent);
    const assignedMembers = state.members.filter((member) => member.agentId === selectedAgent);
    const todayRows = state.collections.filter((collection) => collection.agentId === selectedAgent && collection.date === today());
    const posted = todayRows.filter((collection) => collection.status === "Posted");
    const pending = todayRows.filter((collection) => collection.status !== "Posted");
    const assignedIds = new Set(assignedMembers.map((member) => member.id));
    const workItems = [];
    state.loans.filter((loan) => loan.disbursed && assignedIds.has(loan.memberId)).forEach((loan) => {
      const dues = loanDues(loan);
      dues.rows.forEach((row) => workItems.push({ memberId: loan.memberId, accountId: loan.id, product: "Loan EMI", amountMinor: row.paymentMinor, dueDate: row.dueDate, status: dues.overdueRows.includes(row) ? "Overdue" : "Due" }));
    });
    state.rds.filter((rd) => rd.status === "Active" && assignedIds.has(rd.memberId)).forEach((rd) => {
      rd.schedule.filter((row) => row.status !== "Paid" && row.dueDate <= today()).forEach((row) => workItems.push({ memberId: rd.memberId, accountId: rd.id, product: "RD instalment", amountMinor: row.amountMinor, dueDate: row.dueDate, status: row.status === "Missed" || row.dueDate < today() ? "Overdue" : "Due" }));
    });
    workItems.sort((first, second) => first.dueDate.localeCompare(second.dueDate));
    const workRows = workItems.map((item) => `<tr><td>${memberLink(item.memberId)}</td><td>${esc(item.product)}<span class="table-sub">${esc(accountNumber(item.accountId))}</span></td><td>${niceDate(item.dueDate)}</td><td>${statusPill(item.status)}</td><td class="money">${amount(item.amountMinor)}</td><td><button class="button button-small button-primary" data-action="collect-due" data-account-id="${esc(item.accountId)}" data-amount-minor="${item.amountMinor}">Record collection</button></td></tr>`).join("");
    const agentOptions = state.agents.map((item) => `<option value="${esc(item.id)}" ${item.id === selectedAgent ? "selected" : ""}>${esc(item.name)} · ${esc(item.area)}</option>`).join("");
    const portalActions = isAgentPortal ? `<span class="agent-identity">${esc(agent.name)} · ${esc(agent.area)}</span>` : `<a class="button" href="agent.html" target="_blank" rel="noopener">↗ Open separate agent portal</a><select class="filter-select" id="agent-select">${agentOptions}</select>`;
    const locationStatus = agent.locationSharing ? "Sharing live location" : agent.location?.updatedAt ? `Last location ${new Date(agent.location.updatedAt).toLocaleTimeString()}` : "Location not shared";
    const inactiveNotice = !agent.active ? `<div class="notice notice-warn" style="margin:12px 0"><span>!</span><span>This agent is inactive. New collections and location sharing are disabled; history remains visible to admin.</span></div>` : "";
    const adminAgentRows = !isAgentPortal ? state.agents.map((item) => {
      const point = item.location;
      const coordinates = point ? `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : "No location shared";
      const mapLink = point ? `<a class="text-button" href="https://www.openstreetmap.org/?mlat=${point.latitude}&mlon=${point.longitude}#map=16/${point.latitude}/${point.longitude}" target="_blank" rel="noopener">${coordinates} ↗</a><span class="table-sub">Updated ${new Date(point.updatedAt).toLocaleString()} · ±${Math.round(point.accuracy)}m</span>` : `<span class="table-sub">${esc(item.locationStatus || "Waiting for agent permission")}</span>`;
      return `<tr><td><span class="table-main">${esc(item.name)}</span><span class="table-sub">${esc(item.id)} · ${esc(item.area)}</span></td><td>${assignedMembers.length && item.id === selectedAgent ? assignedMembers.length : state.members.filter((member) => member.agentId === item.id).length}</td><td>${statusPill(item.active ? "Active" : "Inactive")}</td><td>${mapLink}</td><td><button class="button button-small ${item.active ? "button-danger" : "button-primary"}" data-action="toggle-agent-status" data-id="${esc(item.id)}">${item.active ? "Deactivate" : "Activate"}</button></td></tr>`;
    }).join("") : "";
    const rows = todayRows.map((item) => `<tr><td><button class="member-name-button" data-action="view-receipt" data-receipt="${esc(item.receipt)}"><span class="table-main">${esc(item.receipt)}</span></button><span class="table-sub">${esc(item.time)} · ${esc(item.location || "Location unavailable")}</span></td><td>${memberLink(item.memberId)}</td><td>${esc(item.product)}<span class="table-sub">${esc(accountNumber(item.accountId))}</span></td><td class="money">${amount(item.amountMinor)}</td><td>${esc(item.paymentMode)}</td><td>${statusPill(item.status)}</td></tr>`).join("");
    const handovers = state.handovers.filter((handover) => handover.agentId === selectedAgent).map((handover) => `<tr><td><span class="table-main">${esc(handover.id)}</span><span class="table-sub">${niceDate(handover.date)} · ${handover.receipts.length} receipt${handover.receipts.length === 1 ? "" : "s"}</span></td><td class="money">${amount(handover.amountMinor)}</td><td>${statusPill(handover.status)}</td><td>${handover.status === "Awaiting reconciliation" ? `<button class="button button-small button-primary" data-action="reconcile-handover" data-id="${esc(handover.id)}">Reconcile</button>` : "—"}</td></tr>`).join("");
    return `${pageHeader("Collection agent portal", "Responsive field desk for attendance, assigned members and receipts.", portalActions, "Field operations")}
      ${inactiveNotice}<div class="agent-highlight"><div><p class="eyebrow">Today's route · ${esc(agent.area)}</p><h2>${esc(agent.name)}</h2><p>Record a member payment against the correct product account. Pending verification is not part of posted balances.</p><span class="attendance-mark"><span class="dot"></span>Attendance: ${esc(agent.attendance)}</span><span class="attendance-mark" style="margin-left:12px"><span class="dot"></span>${esc(locationStatus)}</span></div><span class="heading-actions"><button class="button" data-action="toggle-attendance" ${agent.active ? "" : "disabled"}>${agent.attendance === "Present" ? "Check out" : "Check in"}</button><button class="button" data-action="toggle-live-location" ${agent.active ? "" : "disabled"}>${agent.locationSharing ? "Stop location" : "Share live location"}</button></span></div>
      <div class="metric-grid" style="margin-top:13px">${metric("Collected today", amount(currencySum(posted)), `${posted.length} posted receipts`, "↗")}${metric("Pending verification", amount(currencySum(pending)), `${pending.length} receipt${pending.length === 1 ? "" : "s"} not posted`, "◷")}${metric("Cash to hand over", amount(currencySum(todayRows.filter((item) => item.paymentMode === "Cash" && item.status === "Posted"))), "Posted cash receipts only", "▤")}${metric("Members on route", assignedMembers.length, "Assigned by admin", "♧")}</div>
      ${!isAgentPortal ? `<section class="section-block">${sectionTitle("Agent status & live locations", "Agent location is shared only after permission; the latest point may not be current.")}${recordsTable(["Agent", "Assigned members", "Status", "Latest location", ""], adminAgentRows, "No agents", "Create agent profiles in the admin workspace.")}</section>` : ""}
      <section class="section-block">${sectionTitle("Today's scheduled collections", "Contractual EMI and RD dues only; no daily savings frequency is assumed.")}${recordsTable(["Member", "Due product", "Due date", "Status", "Expected", ""], workRows, "No scheduled dues today", "Assigned members with a due or overdue loan instalment or RD payment will appear here.")}</section>
      <div class="agent-shell"><div><section class="section-block">${sectionTitle("Today's route collections", "Receipts include mode, time and available location.", `<button class="button button-primary" data-action="new-collection">＋ New collection</button>`)}${recordsTable(["Receipt", "Member", "Product", "Amount", "Mode", "Status"], rows, "No collections recorded", "Record a field payment to issue a demo receipt.")}</section><section class="section-block">${sectionTitle("Cash handovers", "Handover reconciles cash; it never credits member accounts.", `<button class="button" data-action="new-handover">⇄ Prepare handover</button>`)}${recordsTable(["Handover", "Cash total", "Status", ""], handovers, "No cash handovers", "Posted cash receipts can be grouped for admin reconciliation.")}</section></div><aside><section class="section-block">${sectionTitle("Assigned members", "Search and open a consolidated profile") }<div class="panel panel-pad"><label class="search-box"><span>⌕</span><input id="agent-member-search" type="search" placeholder="Find a member"></label><div class="product-list" id="assigned-members">${assignedMembers.slice(0, 5).map((member) => `<div class="product-row"><span class="member-initials">${esc(initials(member.name))}</span><span class="product-row-copy"><strong>${esc(member.name)}</strong><small>${esc(member.id)} · ${state.savings.filter((item) => item.memberId === member.id).length} savings account</small></span><button class="text-button" data-action="member-detail" data-id="${esc(member.id)}">Open</button></div>`).join("") || `<p class="field-help">No members assigned yet. Ask an admin to assign members to this route.</p>`}</div></div></section></aside></div>`;
  }
  function renderCollections() {
    const all = state.collections.filter((item) => collectionFilter === "All" || item.status === collectionFilter);
    const rows = all.slice().sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).map((item) => `<tr><td><button class="member-name-button" data-action="view-receipt" data-receipt="${esc(item.receipt)}"><span class="table-main">${esc(item.receipt)}</span></button><span class="table-sub">${niceDate(item.date)} · ${esc(item.time)} · ${esc(item.location || "Location unavailable")}</span></td><td>${memberLink(item.memberId)}</td><td>${esc(item.product)}<span class="table-sub">${esc(accountNumber(item.accountId))}</span></td><td>${esc(getAgent(item.agentId).name)}</td><td class="money">${amount(item.amountMinor)}</td><td>${esc(item.paymentMode)}</td><td>${statusPill(item.status)}</td><td><button class="button button-small" data-action="view-receipt" data-receipt="${esc(item.receipt)}">View receipt</button> ${item.status === "Pending verification" ? `<button class="button button-small button-primary" data-action="verify-collection" data-receipt="${esc(item.receipt)}">Verify &amp; post</button>` : ""}</td></tr>`).join("");
    const pending = state.collections.filter((item) => item.status === "Pending verification");
    const handovers = state.handovers.map((item) => `<tr><td><span class="table-main">${esc(item.id)}</span><span class="table-sub">${esc(getAgent(item.agentId).name)} · ${niceDate(item.date)}</span></td><td>${item.receipts.map(esc).join(", ")}</td><td class="money">${amount(item.amountMinor)}</td><td>${statusPill(item.status)}</td><td>${item.status === "Awaiting reconciliation" ? `<button class="button button-small button-primary" data-action="reconcile-handover" data-id="${esc(item.id)}">Reconcile cash</button>` : "—"}</td></tr>`).join("");
    const options = ["All", "Posted", "Pending verification"].map((value) => `<option ${collectionFilter === value ? "selected" : ""}>${value}</option>`).join("");
    return `${pageHeader("Collections & reconciliation", "Capture, verify and reconcile field collections without double-crediting accounts.", `<button class="button" data-action="new-handover">⇄ Cash handover</button><button class="button button-primary" data-action="new-collection">＋ Record collection</button>`, "Field ledger")}
      <div class="summary-strip"><div class="summary-cell"><span>Posted today</span><strong>${amount(currencySum(state.collections.filter((item) => item.status === "Posted" && item.date === today())))}</strong></div><div class="summary-cell"><span>Pending verification</span><strong>${amount(currencySum(pending))}</strong></div><div class="summary-cell"><span>Cash handovers to reconcile</span><strong>${state.handovers.filter((item) => item.status === "Awaiting reconciliation").length}</strong></div></div>
      <section class="section-block">${sectionTitle("Collection receipts", "Agents receive receipts immediately; admins can view the same receipt here. Only verified receipts create a posting.", `<select id="collection-filter" class="filter-select">${options}</select>`)}${recordsTable(["Receipt / time / location", "Member", "Product", "Agent", "Amount", "Mode", "Status", ""], rows, "No collection receipts", "Record a new collection from the agent portal or admin desk.")}</section>
      <section class="section-block">${sectionTitle("Cash handovers", "Handover is an operational reconciliation only; receipt postings remain unchanged.")}${recordsTable(["Handover", "Included receipts", "Cash", "Status", ""], handovers, "No handovers", "Cash receipts from a field agent can be grouped and reconciled here.")}</section>`;
  }
  function renderSavings() {
    const rows = state.savings.map((account) => {
      const member = getMember(account.memberId);
      const pending = state.requests.filter((request) => request.accountId === account.id && request.status === "Pending").length;
      return `<tr><td><span class="table-main">${esc(account.number)}</span><span class="table-sub">${esc(account.id)} · opened ${niceDate(account.opened)}</span></td><td>${memberLink(account.memberId)}</td><td>${esc(account.schemeSnapshot.name)}</td><td class="money">${amount(accountBalance(account.id))}</td><td>${pending ? `<span class="status status-pending">${pending} pending</span>` : statusPill("Active")}</td><td><button class="button button-small" data-action="statement" data-id="${esc(account.id)}">Statement</button> <button class="button button-small" data-action="savings-entry" data-id="${esc(account.id)}">Entry</button></td></tr>`;
    }).join("");
    const requests = pendingRequests().filter((request) => request.type === "savings_withdrawal" || request.type === "savings_deposit");
    const transactions = state.transactions.filter((item) => state.savings.some((account) => account.id === item.accountId));
    return `${pageHeader("Savings accounts", "Posted deposits and approved withdrawals determine each running balance.", `<button class="button" data-action="export-savings">↓ Statements</button><button class="button button-primary" data-action="new-savings">＋ Open account</button>`, "Member deposits")}
      <div class="summary-strip"><div class="summary-cell"><span>Posted savings balance</span><strong>${amount(state.savings.reduce((sum, account) => sum + accountBalance(account.id), 0))}</strong></div><div class="summary-cell"><span>Active accounts</span><strong>${state.savings.length}</strong></div><div class="summary-cell"><span>Withdrawal approvals</span><strong>${requests.length}</strong></div></div>
      <section class="section-block">${sectionTitle("Member accounts", "Each account keeps its opening balance and scheme terms snapshot.")}${recordsTable(["Account", "Member", "Scheme snapshot", "Available balance", "Status", ""], rows, "No savings accounts", "Open an account for a member to begin a statement.")}</section>
      <section class="section-block">${sectionTitle("Pending savings requests", "Only approved, posted transactions affect balances.")}${recordsTable(["Request", "Member", "Account", "Amount", "Status", ""], requestRows(requests), "No pending requests", "Deposit and withdrawal requests will be listed here until approval.")}</section>
      <section class="section-block">${sectionTitle("Savings account ledger", "The same posted records power statements and reports.", `<button class="text-button" data-action="export-transactions">Export ledger →</button>`)}${recordsTable(["Transaction", "Member", "Account", "Amount", "Status", "Date", "Correction"], ledgerRows(transactions), "No posted entries", "Account opening balances and approved activity appear here.")}</section>`;
  }
  function renderLoans() {
    const applications = state.loans.map((loan) => {
      const principal = loan.disbursed ? loan.principalOutstandingMinor : 0;
      const dues = loan.disbursed ? loanDues(loan) : { emiDueMinor: 0, penaltyDueMinor: 0 };
      const due = dues.emiDueMinor;
      return `<tr><td><span class="table-main">${esc(loan.id)}</span><span class="table-sub">${esc(loan.purpose)}</span></td><td>${memberLink(loan.memberId)}</td><td class="money">${amount(loan.approvedMinor || loan.requestedMinor)}</td><td>${loan.tenureMonths} mo</td><td>${statusPill(loan.status)}</td><td class="money">${loan.disbursed ? amount(principal) : "—"}</td><td class="money">${loan.disbursed ? amount(due) : "—"}</td><td class="money">${loan.disbursed ? amount(dues.penaltyDueMinor) : "—"}</td><td>${loan.status === "Under review" ? `<button class="button button-small button-primary" data-action="review-loan" data-id="${esc(loan.id)}">Review</button>` : loan.status === "Approved" ? `<button class="button button-small button-primary" data-action="disburse-loan" data-id="${esc(loan.id)}">Disburse</button>` : loan.disbursed ? `<button class="button button-small" data-action="loan-detail" data-id="${esc(loan.id)}">Details</button> <button class="button button-small" data-action="loan-payment" data-id="${esc(loan.id)}">Repay</button> ${dues.penaltyDueMinor ? `<button class="button button-small button-danger" data-action="loan-penalty" data-id="${esc(loan.id)}">Post penalty</button>` : ""}` : "—"}</td></tr>`;
    }).join("");
    const requests = pendingRequests("disbursement");
    const rows = requests.map((request) => `<tr><td><span class="table-main">Disbursement · ${esc(request.accountId)}</span><span class="table-sub">${esc(request.id)}</span></td><td>${memberLink(request.memberId)}</td><td class="money">${amount(request.amountMinor)}</td><td>${statusPill(request.status)}</td><td>${requestActions(request)}</td></tr>`).join("");
    const paidDue = state.loans.filter((loan) => loan.disbursed).flatMap((loan) => loan.schedule.filter((row) => ["Due", "Overdue"].includes(row.status)));
    const dueAmount = paidDue.reduce((sum, row) => sum + row.paymentMinor, 0);
    const penaltyDueTotal = state.loans.filter((loan) => loan.disbursed).reduce((sum, loan) => sum + loanDues(loan).penaltyDueMinor, 0);
    return `${pageHeader("Loans & repayments", "Review applications, preview schedules and keep principal distinct from amount due.", `<button class="button button-primary" data-action="new-loan">＋ Loan application</button>`, "Credit portfolio")}
      <div class="summary-strip"><div class="summary-cell"><span>Active loans</span><strong>${state.loans.filter((loan) => loan.status === "Active").length}</strong></div><div class="summary-cell"><span>Principal outstanding</span><strong>${amount(state.loans.filter((loan) => loan.disbursed).reduce((sum, loan) => sum + loan.principalOutstandingMinor, 0))}</strong></div><div class="summary-cell"><span>EMI due / overdue</span><strong>${amount(dueAmount)}</strong></div><div class="summary-cell"><span>Configured penalty due</span><strong>${amount(penaltyDueTotal)}</strong></div></div>
      <section class="section-block">${sectionTitle("Applications and active loans", "Approval does not disburse; repayments are blocked until disbursement. Penalties use the loan's snapshotted illustrative grace and fee terms.")}${recordsTable(["Loan", "Member", "Requested / approved", "Tenure", "Status", "Principal out.", "EMI due", "Penalty due", ""], applications, "No loan records", "Create a linked application to start the loan workflow.")}</section>
      <section class="section-block">${sectionTitle("Pending disbursement approvals", "A maker request and separate approver action are required before posting.")}${recordsTable(["Request", "Member", "Amount", "Status", ""], rows, "No disbursements pending", "Approved loans can be submitted for a separately approved disbursement.")}</section>
      <section class="section-block">${sectionTitle("Repayment schedule & payment history", "Allocation priority: penalty → fee → interest → principal.")}${state.loans.filter((loan) => loan.disbursed).map((loan) => loanSchedulePanel(loan)).join("") || `<div class="panel empty-state"><strong>No disbursed schedules</strong><p>Loan schedules are generated at review and snapshotted at disbursement.</p></div>`}</section>`;
  }
  function loanSchedulePanel(loan) {
    const nextRows = loan.schedule.slice(0, 5).map((row) => `<tr><td>${row.installment}</td><td>${niceDate(row.dueDate)}</td><td class="money">${amount(row.principalMinor)}</td><td class="money">${amount(row.interestMinor)}</td><td class="money">${amount(row.paymentMinor)}</td><td class="money">${amount(row.balanceMinor)}</td><td>${statusPill(row.status)}</td></tr>`).join("");
    const payments = loan.payments || [];
    return `<div class="panel panel-pad" style="margin-bottom:12px"><div class="section-title-row"><div><h2>${esc(loan.id)} · ${esc(getMember(loan.memberId).name)}</h2><p>Principal outstanding ${amount(loan.principalOutstandingMinor)} · ${esc(loan.schemeSnapshot?.method || "terms pending")} balance</p></div><span class="heading-actions"><button class="button button-small" data-action="loan-detail" data-id="${esc(loan.id)}">Full statement</button><button class="button button-small" data-action="loan-close" data-id="${esc(loan.id)}">Request closure</button></span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>#</th><th>Due date</th><th>Principal</th><th>Interest</th><th>Payment due</th><th>Principal balance</th><th>Status</th></tr></thead><tbody>${nextRows}</tbody></table></div>${payments.length ? `<p class="field-help">${payments.length} payment${payments.length === 1 ? "" : "s"} recorded · last ${niceDate(payments[payments.length - 1].date)}</p>` : ""}</div>`;
  }
  function renderDeposits() {
    const rdRows = state.rds.map((rd) => {
      const projection = F.recurringDepositProjection({ installmentMinor: rd.installmentMinor, annualRate: rd.schemeSnapshot.annualRate, installments: rd.installments, periodsPerYear: rd.schemeSnapshot.compounding });
      const next = rd.schedule.find((row) => row.status !== "Paid");
      return `<tr><td><span class="table-main">${esc(rd.number)}</span><span class="table-sub">${esc(rd.schemeSnapshot.name)}</span></td><td>${memberLink(rd.memberId)}</td><td class="money">${amount(rd.installmentMinor)} / ${esc(rd.frequency)}</td><td class="money">${amount(rd.paidMinor)}</td><td>${next ? `${niceDate(next.dueDate)} · ${statusPill(next.status)}` : "Complete"}</td><td>${niceDate(rd.maturityDate)}</td><td class="money">${amount(projection.maturityMinor)}<span class="table-sub">projected · not payable</span></td><td><button class="button button-small" data-action="rd-detail" data-id="${esc(rd.id)}">Details</button> <button class="button button-small button-primary" data-action="rd-installment" data-id="${esc(rd.id)}">Pay</button> <button class="button button-small" data-action="rd-actions" data-id="${esc(rd.id)}">Manage</button></td></tr>`;
    }).join("");
    const fdRows = state.fds.map((fd) => {
      const projection = F.compoundProjection({ principalMinor: fd.principalMinor, annualRate: fd.schemeSnapshot.annualRate, periodsPerYear: fd.schemeSnapshot.compounding, years: fd.tenureYears });
      return `<tr><td><span class="table-main">${esc(fd.certificate)}</span><span class="table-sub">${esc(fd.schemeSnapshot.name)}</span></td><td>${memberLink(fd.memberId)}</td><td class="money">${amount(fd.principalMinor)}</td><td>${esc(fd.payoutOption)}</td><td>${niceDate(fd.bookingDate)}</td><td>${niceDate(fd.maturityDate)}</td><td class="money">${amount(projection.maturityMinor)}<span class="table-sub">projected · not payable</span></td><td><button class="button button-small" data-action="fd-detail" data-id="${esc(fd.id)}">Details</button> <button class="button button-small" data-action="fd-actions" data-id="${esc(fd.id)}">Manage</button></td></tr>`;
    }).join("");
    const pending = pendingRequests().filter((item) => ["maturity_payout", "interest_payout", "rd_closure", "fd_closure"].includes(item.type));
    return `${pageHeader("Recurring & fixed deposits", "Schedules and projections show assumptions separately from verified payable amounts.", `<button class="button" data-action="new-rd">＋ Open RD</button><button class="button button-primary" data-action="new-fd">＋ Book FD</button>`, "Term deposits")}
      <div class="notice" style="margin-bottom:14px"><span>i</span><span>Interest projections are illustrative. A projected maturity is not a payout instruction or verified payable amount.</span></div>
      <section class="section-block">${sectionTitle("Recurring deposits", "Expected instalments, paid / missed states and maturity projection.", `<button class="text-button" data-action="export-rd">Export RD →</button>`)}${recordsTable(["RD account", "Member", "Instalment", "Paid to date", "Next instalment", "Maturity", "Projected maturity", ""], rdRows, "No RD accounts", "Open an RD account to generate its expected schedule.")}</section>
      <section class="section-block">${sectionTitle("Fixed deposits", "Renewal creates a new linked record; the original certificate remains intact.", `<button class="text-button" data-action="export-fd">Export FD →</button>`)}${recordsTable(["Certificate", "Member", "Principal", "Payout option", "Booked", "Maturity", "Projected value", ""], fdRows, "No FD accounts", "Book a member-linked deposit and snapshot the current scheme terms.")}</section>
      <section class="section-block">${sectionTitle("Maturity and closure approvals", "Payouts remain pending until separately verified and approved.")}${recordsTable(["Request", "Member", "Account", "Amount", "Status", ""], requestRows(pending), "No pending payouts", "No maturity or premature closure approvals are waiting.")}</section>`;
  }
  function transactionAccountOptions() {
    return [...state.savings.map((account) => ({ id: account.id, memberId: account.memberId, kind: "Savings", label: `${account.number} · ${getMember(account.memberId).name}` })), ...state.rds.map((account) => ({ id: account.id, memberId: account.memberId, kind: "RD", label: `${account.number} · ${getMember(account.memberId).name}` })), ...state.loans.filter((loan) => loan.disbursed).map((account) => ({ id: account.id, memberId: account.memberId, kind: "Loan", label: `${account.id} · ${getMember(account.memberId).name}` }))];
  }
  function reportRows() {
    const type = reportFilter;
    return state.transactions.filter((transaction) => type === "All" || normalize(transaction.kind).includes(normalize(type))).map((transaction) => `<tr><td><span class="table-main">${esc(transaction.reference)}</span><span class="table-sub">${esc(normalize(transaction.kind))}</span></td><td>${memberLink(transaction.memberId)}</td><td>${esc(accountNumber(transaction.accountId))}</td><td class="money">${amount(transaction.amountMinor)}</td><td>${statusPill(transaction.status)}</td><td>${niceDate(transaction.createdAt.slice(0, 10))}</td></tr>`).join("");
  }
  function renderReports() {
    const posted = state.transactions.filter((item) => item.status === "posted");
    const cash = posted.filter((item) => item.entries.some((entry) => /cash/i.test(entry.account))).reduce((sum, item) => sum + item.amountMinor, 0);
    const bank = posted.filter((item) => item.entries.some((entry) => /bank/i.test(entry.account))).reduce((sum, item) => sum + item.amountMinor, 0);
    const byProduct = transactionAccountOptions().map((account) => ({ account, balance: accountBalance(account.id) }));
    const consolidated = state.members.map((member) => {
      const savings = state.savings.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + accountBalance(item.id), 0);
      const loan = state.loans.filter((item) => item.memberId === member.id && item.disbursed).reduce((sum, item) => sum + item.principalOutstandingMinor, 0);
      const rd = state.rds.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + item.paidMinor, 0);
      const fd = state.fds.filter((item) => item.memberId === member.id && item.status === "Active").reduce((sum, item) => sum + item.principalMinor, 0);
      return `<tr><td>${memberLink(member.id)}</td><td class="money">${amount(savings)}</td><td class="money">${amount(loan)}</td><td class="money">${amount(rd)}</td><td class="money">${amount(fd)}</td><td class="money">${amount(savings + rd + fd - loan)}</td></tr>`;
    }).join("");
    const maturity = [...state.rds, ...state.fds].filter((item) => item.status === "Active").map((item) => `<tr><td>${memberLink(item.memberId)}</td><td>${esc(item.number || item.certificate)}</td><td>${item.schemeSnapshot.name.includes("Builder") ? "RD" : "FD"}</td><td>${niceDate(item.maturityDate)}</td><td>${statusPill(item.status)}</td></tr>`).join("");
    const options = ["All", "deposit", "withdrawal", "collection", "loan", "rd", "fd", "reversal"].map((value) => `<option value="${esc(value)}" ${reportFilter === value ? "selected" : ""}>${value === "All" ? "All products" : esc(value[0].toUpperCase() + value.slice(1))}</option>`).join("");
    return `${pageHeader("Reports & statements", "Member portfolio, account statements and exports from the posted financial record.", `<button class="button button-primary" data-action="export-report">↓ Excel-compatible export</button>`, "Financial reporting")}
      <div class="summary-strip"><div class="summary-cell"><span>Cash postings</span><strong>${amount(cash)}</strong></div><div class="summary-cell"><span>Bank postings</span><strong>${amount(bank)}</strong></div><div class="summary-cell"><span>Posted ledger entries</span><strong>${posted.length}</strong></div></div>
      <section class="section-block">${sectionTitle("Member-wise consolidated portfolio", "Savings + RD paid + FD principal − loan principal outstanding.")}${recordsTable(["Member", "Savings", "Loan principal", "RD paid", "FD principal", "Net portfolio"], consolidated, "No member portfolios", "Member data will appear after adding members.")}</section>
      <section class="section-block">${sectionTitle("Posted transaction register", "Filtered export includes the same records used by account statements.", `<select class="filter-select" id="report-filter">${options}</select>`)}${recordsTable(["Reference", "Member", "Account", "Amount", "Status", "Date"], reportRows(), "No matching transactions", "Change the product filter to see other entries.")}</section>
      <section class="section-block">${sectionTitle("Upcoming product maturities", "Projected value remains separate from approved payout.")}${recordsTable(["Member", "Account", "Product", "Maturity date", "Status"], maturity, "No active deposits", "RD and FD maturity dates appear here.")}</section>`;
  }
  function renderSchemes() {
    const cards = Object.entries(state.schemes).map(([type, schemes]) => `<section class="section-block">${sectionTitle(`${type.toUpperCase()} schemes`, "Illustrative settings · edits affect new contracts only.", `<button class="button button-small" data-action="new-scheme" data-kind="${type}">＋ Add scheme</button>`)}<div class="panel panel-pad"><div class="product-list">${schemes.map((scheme) => `<div class="product-row"><span class="product-icon">${type === "savings" ? "▤" : type === "loans" ? "↙" : "◷"}</span><span class="product-row-copy"><strong>${esc(scheme.name)}</strong><small>${type === "loans" ? `${scheme.method} · ${scheme.frequency} · ${scheme.graceDays} day grace · fee ${amount(scheme.lateFeeMinor)}` : type === "savings" ? `${scheme.annualRate}% annual · withdrawal approval ${scheme.withdrawalApproval ? "on" : "off"} · overdraft ${scheme.overdraftAllowed ? "allowed" : "blocked"}` : `${scheme.annualRate}% annual · compounds ${scheme.compounding}× / year · ${scheme.frequency || scheme.payoutFrequency}`}</small></span><span class="product-row-value"><strong>${scheme.annualRate}%</strong><small>${scheme.active ? "Active · demo" : "Archived"}</small></span><button class="button button-small" data-action="edit-scheme" data-kind="${type}" data-id="${esc(scheme.id)}">Edit</button></div>`).join("")}</div></div></section>`).join("");
    return `${pageHeader("Schemes & calculation controls", "Configure example terms, allocation rules and rounding assumptions.", "", "Admin controls")}
      <div class="notice notice-warn" style="margin-bottom:15px"><span>i</span><span><strong>Policies are not preselected on your behalf.</strong> Rates, day count, grace period, penalties and closure rules below are labeled examples. Have the society approve actual terms before production use.</span></div>
      <div class="content-grid"><div>${cards}</div><div><section class="section-block">${sectionTitle("Calculation assumptions", "Shown with each projection") }<div class="panel panel-pad"><div class="detail-list" style="grid-template-columns:1fr"><div class="detail-item"><span>Demo currency</span><strong>USD · illustrative units</strong></div><div class="detail-item"><span>Money storage</span><strong>Integer minor units · cents</strong></div><div class="detail-item"><span>Rounding</span><strong>Nearest cent, half up</strong></div><div class="detail-item"><span>Loan payment allocation</span><strong>Penalty → fee → interest → principal</strong></div><div class="detail-item"><span>Day count</span><strong>Actual/365 where shown</strong></div><div class="detail-item"><span>Overdraft policy</span><strong>Blocked unless explicitly enabled</strong></div><div class="detail-item"><span>Interest engine</span><strong>Example schedule; validate before use</strong></div></div></div></section><section class="section-block">${sectionTitle("Existing contract snapshots", "Future scheme changes do not rewrite account terms") }<div class="panel panel-pad"><p class="field-help">Opened savings, RD, FD and disbursed loans keep a copy of scheme terms at creation or disbursement. Editing a scheme only changes future accounts and applications.</p></div></section></div></div>`;
  }
  function renderDemo() {
    const cards = [
      ["♧", "Members & profiles", "Add a member, assign savings, nominee and verification details, then inspect the consolidated profile.", "new-member", "Open a member profile"],
      ["↗", "Field collections", "Capture a receipt with payment mode, time, optional location and product account; verify it before posting.", "new-collection", "Record a collection"],
      ["▤", "Savings & approvals", "Submit a deposit or withdrawal, approve it separately, and inspect the running statement.", "new-savings", "Open savings"],
      ["↙", "Loan lifecycle", "Preview flat or reducing schedules, review an application, then request and approve disbursement separately.", "new-loan", "Start application"],
      ["◷", "RD & FD projections", "Open a recurring or fixed deposit and compare projected value with approved maturity payout.", "new-rd", "Open RD"],
      ["▥", "Reports & controls", "Filter posted records, export an Excel-compatible file, and edit clearly illustrative scheme terms.", "export-report", "Export ledger"]
    ];
    return `${pageHeader("Demo workspace", "Explore connected workflows using illustrative records stored in this browser.", `<button class="button button-danger" data-action="reset-demo">↻ Reset demo data</button>`, "Guided demo")}
      <div class="notice" style="margin-bottom:15px"><span>i</span><span><strong>Sandbox only.</strong> Demo records persist in this browser's local storage. No card processing, bank connection or external messaging is configured.</span></div>
      <div class="demo-grid">${cards.map(([mark, title, copy, action, cta]) => `<article class="demo-card"><span class="demo-card-mark">${mark}</span><h3>${title}</h3><p>${copy}</p><button class="button button-small" data-action="${action}">${cta} →</button></article>`).join("")}</div>
      <section class="section-block" style="margin-top:22px">${sectionTitle("Production readiness", "Required before handling real member funds") }<div class="panel panel-pad"><div class="demo-requirements"><div class="requirement"><span class="requirement-mark">✓</span><span><strong>Backend and durable transactional storage</strong><small>This browser demo stores data locally and offers no cross-device durability, backups or server-side ledger transaction boundary.</small></span></div><div class="requirement"><span class="requirement-mark">✓</span><span><strong>Server-side access controls</strong><small>Demo role labels are not authentication or authorization. Enforce agent, maker, approver and admin permissions on the server.</small></span></div><div class="requirement"><span class="requirement-mark">✓</span><span><strong>Society policy validation</strong><small>Confirm currency, interest methods, rates, day-count convention, rounding, penalties, approval thresholds and closure rules with the society.</small></span></div><div class="requirement"><span class="requirement-mark">✓</span><span><strong>Independent financial review</strong><small>Reconcile journal mappings, schedules, receipts, taxes, member statements, audit retention and jurisdictional requirements before launch.</small></span></div></div></div></section>
      <section class="section-block">${sectionTitle("Recent activity", "Audit trail for demo actions") }<div class="panel panel-pad"><div class="product-list">${state.activity.slice(0, 5).map((item) => `<div class="product-row"><span class="product-icon">·</span><span class="product-row-copy"><strong>${esc(item.title)}</strong><small>${esc(item.detail)} · ${esc(item.actor)}</small></span><span class="product-row-value"><small>${new Date(item.date).toLocaleString()}</small></span></div>`).join("")}</div></div></section>`;
  }
  function renderPage() {
    const root = $("#page-content");
    root.innerHTML = ({ overview: renderOverview, members: renderMembers, agents: renderAgents, collections: renderCollections, savings: renderSavings, loans: renderLoans, deposits: renderDeposits, reports: renderReports, schemes: renderSchemes, demo: renderDemo })[currentPage]();
    root.innerHTML = root.innerHTML.replaceAll("USD", "INR").replace("INR · illustrative units", "INR · Indian rupees (illustrative)");
    $("#member-count").textContent = state.members.length;
    $("#collection-count").textContent = pendingRequests().length;
    $("#today-label").textContent = new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }

  function memberOptions(selected = "") {
    return state.members.map((member) => `<option value="${esc(member.id)}" ${member.id === selected ? "selected" : ""}>${esc(member.name)} · ${esc(member.id)}</option>`).join("");
  }
  function field(label, name, content, help = "", full = false) {
    return `<label class="form-field${full ? " full" : ""}"><span class="field-label">${label.replaceAll("USD", "INR")}</span>${content}${help ? `<span class="field-help">${help.replaceAll("USD", "INR")}</span>` : ""}</label>`;
  }
  function input(name, label, value = "", type = "text", attrs = "", help = "") {
    return field(label, name, `<input class="field-input" name="${name}" type="${type}" value="${esc(value)}" ${attrs}>`, help);
  }
  function selectField(name, label, options, help = "", full = false) {
    return field(label, name, `<select class="field-select" name="${name}">${options}</select>`, help, full);
  }
  function dialog(title, description, form, submitLabel = "Save") {
    return `<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Demo workflow</p><h2 id="dialog-title">${title}</h2><p>${description}</p></div>${form}<div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">Cancel</button><button type="submit" class="button button-primary">${submitLabel}</button></div></div>`;
  }
  function openForm(title, description, fields, action, submitLabel = "Save", hidden = "") {
    showDialog(`<form data-form="${action}">${hidden}<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Demo workflow</p><h2 id="dialog-title">${title}</h2><p>${description}</p></div><div class="form-grid">${fields}</div><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">Cancel</button><button type="submit" class="button button-primary">${submitLabel}</button></div></div></form>`);
  }
  function openNewMember() {
    const agentOptions = state.agents.filter((agent) => agent.active).map((agent) => `<option value="${esc(agent.id)}">${esc(agent.name)} · ${esc(agent.area)}</option>`).join("");
    openForm("Add member", "Personal, nominee and collection-route details are stored in this browser demo.", `${input("name", "Full name", "", "text", "required")}${input("phone", "Phone", "", "tel", "required")}${input("email", "Email", "", "email", "autocomplete=\"email\"")}${input("joined", "Join date", today(), "date", "required")}${input("address", "Address", "", "text", "required")}${input("nominee", "Nominee name", "", "text", "required")}${selectField("nomineeRelation", "Nominee relationship", ["Spouse", "Parent", "Child", "Sibling", "Partner", "Other"].map((v) => `<option>${v}</option>`).join(""))}${selectField("verification", "Verification status", ["Review needed", "Verified"].map((v) => `<option>${v}</option>`).join(""))}${selectField("agentId", "Collection agent", agentOptions)}`, "new-member", "Create member");
  }
  function openNewSavings(memberId = "") {
    const schemeOptions = state.schemes.savings.filter((scheme) => scheme.active).map((scheme) => `<option value="${esc(scheme.id)}">${esc(scheme.name)} · ${scheme.annualRate}% p.a.</option>`).join("");
    openForm("Open savings account", "Terms are copied from the selected scheme. Opening balance is posted as an opening entry.", `${selectField("memberId", "Member", memberOptions(memberId))}${selectField("schemeId", "Illustrative scheme", schemeOptions, "Configure the society's actual scheme before production.", true)}${input("openingBalance", "Opening balance · demo USD", "0.00", "number", "min=\"0\" step=\"0.01\" required")}${input("opened", "Opening date", today(), "date", "required")}`, "new-savings", "Open account");
  }
  function openSavingsEntry(accountId = "") {
    const accounts = state.savings.map((item) => `<option value="${esc(item.id)}" ${item.id === accountId ? "selected" : ""}>${esc(item.number)} · ${esc(getMember(item.memberId).name)} · balance ${amount(accountBalance(item.id))}</option>`).join("");
    openForm("Savings transaction", "Deposits and withdrawals start as requests. Only approved postings change the balance.", `${selectField("accountId", "Savings account", accounts, "Available balance: posted ledger only.", true)}${selectField("direction", "Entry type", `<option value="deposit">Deposit</option><option value="withdrawal">Withdrawal · approval required</option>`)}${input("amount", "Amount · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("paymentMode", "Payment mode", ["Cash", "Bank transfer", "Mobile transfer", "Cheque"].map((v) => `<option>${v}</option>`).join(""))}${input("note", "Reference / note", "", "text", "maxlength=\"80\"")}`, "savings-entry", "Submit request");
  }
  function openCollection(prefill = {}) {
    const allowedAgents = state.agents.filter((agent) => agent.active && (!isAgentPortal || agent.id === selectedAgent));
    const allowedMemberIds = new Set(state.members.filter((member) => allowedAgents.some((agent) => agent.id === member.agentId)).map((member) => member.id));
    const options = transactionAccountOptions().filter((account) => allowedMemberIds.has(account.memberId)).map((account) => `<option value="${esc(account.id)}" data-member="${esc(account.memberId)}" data-product="${esc(account.kind)}" ${account.id === prefill.accountId ? "selected" : ""}>${esc(account.kind)} · ${esc(account.label)}</option>`).join("");
    const agentOptions = allowedAgents.map((agent) => `<option value="${esc(agent.id)}" ${agent.id === (prefill.agentId || selectedAgent) ? "selected" : ""}>${esc(agent.name)} · ${esc(agent.area)}</option>`).join("");
      openForm("Record field collection", "A unique receipt is issued now. The member balance changes only after verification and posting.", `${selectField("accountId", "Assigned member account", options, "Only accounts assigned to the selected active agent appear here.", true)}${selectField("agentId", "Collection agent", agentOptions)}${input("amount", "Amount · demo USD", prefill.amountMinor ? numberInput(prefill.amountMinor) : "", "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("paymentMode", "Payment mode", ["Cash", "Bank transfer", "Mobile transfer", "Cheque"].map((v) => `<option>${v}</option>`).join(""))}${input("date", "Collection date", today(), "date", "required")}${input("time", "Time", new Date().toTimeString().slice(0, 5), "time", "required")}${input("location", "Available location", "", "text", "maxlength=\"100\"", "Optional; you can enter a route landmark or use the location button below.")}${field("Receipt photo", "photo", `<input class=\"field-input\" style=\"padding-top:7px\" name=\"photo\" type=\"file\" accept=\"image/*\" capture=\"environment\">`, "Image filename is retained in the demo receipt; file is not uploaded.")}${field("Location", "location-tool", `<button type=\"button\" class=\"button button-small\" data-action=\"capture-location\">◎ Use available location</button>`, "Browser may request location permission.")}`, "new-collection", "Issue receipt");
    openForm("Record field collection", "A unique receipt is issued now. The member balance changes only after verification and posting.", `${selectField("accountId", "Product account", options, "Savings, RD or a disbursed loan account only.", true)}${selectField("agentId", "Collection agent", agentOptions)}${input("amount", "Amount · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("paymentMode", "Payment mode", ["Cash", "Bank transfer", "Mobile transfer", "Cheque"].map((v) => `<option>${v}</option>`).join(""))}${input("date", "Collection date", today(), "date", "required")}${input("time", "Time", new Date().toTimeString().slice(0, 5), "time", "required")}${input("location", "Available location", "", "text", "maxlength=\"100\"", "Optional; you can enter a route landmark or use the location button below.")}${field("Receipt photo", "photo", `<input class="field-input" style="padding-top:7px" name="photo" type="file" accept="image/*" capture="environment">`, "Image filename is retained in the demo receipt; file is not uploaded.")}${field("Location", "location-tool", `<button type="button" class="button button-small" data-action="capture-location">◎ Use available location</button>`, "Browser may request location permission.")}`, "new-collection", "Issue receipt");
  }
  function receiptMessage(collection) {
    const member = getMember(collection.memberId);
    return ["Gajlaxmi Bank collection receipt", `Receipt: ${collection.receipt}`, `Member: ${member.name} (${member.id})`, `Amount: ${amount(collection.amountMinor)}`, `Account: ${collection.product} · ${accountNumber(collection.accountId)}`, `Payment mode: ${collection.paymentMode}`, `Collected by: ${getAgent(collection.agentId).name}`, `Date/time: ${niceDate(collection.date)} · ${collection.time}`, `Status: ${collection.status === "Posted" ? "Verified and posted" : "Received; pending verification"}`, "Pending verification means the amount is not yet posted to the account."].join("\n");
  }
  async function shareReceipt(receiptId) {
    const collection = state.collections.find((item) => item.receipt === receiptId);
    const member = collection && getMember(collection.memberId);
    if (!collection || !member?.phone) return toast("Add the member's phone number before sharing this receipt.", true);
    try {
      if (navigator.share) await navigator.share({ title: `Gajlaxmi Bank receipt ${collection.receipt}`, text: receiptMessage(collection) });
      else if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(receiptMessage(collection));
      else return toast("Sharing is unavailable in this browser. Use Print receipt instead.", true);
      collection.memberShareStatus = navigator.share ? "Share sheet opened · delivery unconfirmed" : "Copied for sharing · not sent";
      collection.memberShareAt = new Date().toISOString();
      save(); openReceipt(collection);
      toast("Receipt prepared. Confirm the member and send in your share app.");
    } catch (error) { if (error.name !== "AbortError") toast("Could not open the share sheet.", true); }
  }
  function textReceipt(receiptId) {
    const collection = state.collections.find((item) => item.receipt === receiptId);
    const member = collection && getMember(collection.memberId);
    if (!collection || !member?.phone) return toast("Add the member's phone number before sharing this receipt.", true);
    collection.memberShareStatus = "SMS composer opened · not sent";
    collection.memberShareAt = new Date().toISOString();
    save();
    window.location.href = `sms:${member.phone.replace(/[^\d+]/g, "")}?body=${encodeURIComponent(receiptMessage(collection))}`;
    toast(`SMS composer opened for ${member.phone}. Agent must tap Send.`);
  }
  function openReceipt(receiptOrId) {
    const collection = typeof receiptOrId === "string" ? state.collections.find((item) => item.receipt === receiptOrId) : receiptOrId;
    if (!collection) return toast("Receipt not found.", true);
    const member = getMember(collection.memberId);
    showDialog(`<div class="dialog-content"><div class="receipt-printable"><div class="receipt-brand"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span><span><strong>Gajlaxmi Bank</strong><small>Member collection receipt · illustrative demo</small></span></div><div class="receipt-heading"><span>Receipt</span><strong>${esc(collection.receipt)}</strong></div><div class="receipt-amount">${amount(collection.amountMinor)}</div><p class="receipt-caption">Amount received from member</p><div class="receipt-details"><div><span>Member</span><strong>${esc(member.name)} · ${esc(member.id)}</strong></div><div><span>Member phone</span><strong>${esc(member.phone || "Not recorded")}</strong></div><div><span>Product account</span><strong>${esc(collection.product)} · ${esc(accountNumber(collection.accountId))}</strong></div><div><span>Payment mode</span><strong>${esc(collection.paymentMode)}</strong></div><div><span>Collected by</span><strong>${esc(getAgent(collection.agentId).name)}</strong></div><div><span>Date &amp; time</span><strong>${niceDate(collection.date)} · ${esc(collection.time)}</strong></div><div><span>Location</span><strong>${esc(collection.location || "Not available")}</strong></div><div><span>Member share</span><strong>${esc(collection.memberShareStatus || "Not shared yet")}</strong></div></div><div class="receipt-status"><span>${statusPill(collection.status)}</span><strong>${collection.status === "Posted" ? "Payment verified and posted" : "Received · pending verification"}</strong></div><p class="receipt-footnote">Keep this receipt for your records. A pending receipt confirms collection only; it does not mean the amount has posted to the member account. Sharing is not proof of delivery. This demo does not send messages automatically.</p></div><div class="dialog-actions receipt-actions"><button class="button" data-action="close-dialog">Close</button><button class="button" data-action="text-receipt" data-receipt="${esc(collection.receipt)}">Text member</button><button class="button" data-action="share-receipt" data-receipt="${esc(collection.receipt)}">Share receipt</button><button class="button button-primary" data-action="print-receipt">▣ Print receipt</button></div></div>`);
  }

  function openHandover(agentId = selectedAgent) {
    const eligible = state.collections.filter((item) => item.agentId === agentId && item.status === "Posted" && item.paymentMode === "Cash" && item.date === today() && !state.handovers.some((handover) => handover.receipts.includes(item.receipt)));
    const receipts = eligible.map((item) => `<label class="check-field"><input name="receipts" type="checkbox" value="${esc(item.receipt)}" checked><span>${esc(item.receipt)} · ${esc(getMember(item.memberId).name)} · ${amount(item.amountMinor)}</span></label>`).join("") || `<p class="field-help">No unreconciled cash receipts for this agent today.</p>`;
    showDialog(`<form data-form="new-handover"><input type="hidden" name="agentId" value="${esc(agentId)}"><div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Cash control</p><h2 id="dialog-title">Prepare cash handover</h2><p>Group posted cash receipts for admin reconciliation. This action does not post or credit any member account.</p></div><div class="form-grid"><div class="form-field full"><span class="field-label">Receipts to include</span><div class="panel panel-pad">${receipts}</div></div>${selectField("agentIdDisplay", "Submitting agent", `<option>${esc(getAgent(agentId).name)}</option>`)}</div><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">Cancel</button><button type="submit" class="button button-primary" ${eligible.length ? "" : "disabled"}>Create handover</button></div></div></form>`);
  }
  function openLoanApplication() {
    const loanSchemes = state.schemes.loans.filter((scheme) => scheme.active).map((scheme) => `<option value="${esc(scheme.id)}">${esc(scheme.name)} · ${scheme.method}, ${scheme.annualRate}%</option>`).join("");
    openForm("Loan application", "Link the request to a member. Review generates a repayment preview; approval does not disburse.", `${selectField("memberId", "Member", memberOptions())}${input("amount", "Requested amount · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${input("purpose", "Purpose", "", "text", "required maxlength=\"120\"")}${input("tenure", "Tenure · months", "12", "number", "min=\"1\" max=\"360\" required")}${selectField("schemeId", "Illustrative loan scheme", loanSchemes)}${input("guarantor", "Guarantor details", "", "text", "maxlength=\"100\"")}${field("Supporting document", "document", `<input class="field-input" style="padding-top:7px" name="document" type="file">`, "File name only is retained in this browser demo.")}`, "new-loan", "Create application");
  }
  function openLoanReview(loanId) {
    const loan = state.loans.find((item) => item.id === loanId);
    const scheme = state.schemes.loans.find((item) => item.id === loan.schemeId) || state.schemes.loans[0];
    const preview = F.loanSchedule({ principalMinor: loan.requestedMinor, annualRate: scheme.annualRate, months: loan.tenureMonths, method: scheme.method, frequency: scheme.frequency, firstDueDate: today() });
    const totalInterest = preview.reduce((sum, row) => sum + row.interestMinor, 0);
    const rows = preview.slice(0, 4).map((row) => `<tr><td>${row.installment}</td><td>${niceDate(row.dueDate)}</td><td>${amount(row.principalMinor)}</td><td>${amount(row.interestMinor)}</td><td>${amount(row.paymentMinor)}</td></tr>`).join("");
    showDialog(`<form data-form="review-loan"><input type="hidden" name="loanId" value="${esc(loan.id)}"><div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Application review · ${esc(loan.id)}</p><h2 id="dialog-title">Review ${esc(getMember(loan.memberId).name)}</h2><p>${esc(loan.purpose)} · requested ${amount(loan.requestedMinor)} · ${loan.tenureMonths} months.</p></div><div class="form-grid">${input("approvedAmount", "Approved amount · demo USD", numberInput(loan.requestedMinor), "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("schemeId", "Interest method and scheme", state.schemes.loans.filter((item) => item.active).map((item) => `<option value="${esc(item.id)}" ${item.id === scheme.id ? "selected" : ""}>${esc(item.name)} · ${item.method}, ${item.annualRate}% p.a.</option>`).join(""))}${input("tenure", "Approved tenure · months", String(loan.tenureMonths), "number", "min=\"1\" required")}${input("firstDueDate", "First due date", today(), "date", "required")}${input("charges", "One-time charges · demo USD", "0.00", "number", "min=\"0\" step=\"0.01\"")}${input("guarantor", "Guarantor", loan.guarantor || "", "text")}</div><div class="formula-box" style="margin-top:12px"><strong>Schedule preview · ${esc(scheme.method)} balance · ${scheme.annualRate}% annual</strong><br>Estimated interest ${amount(totalInterest)} · ${preview.length} instalments. First rows below. Preview is illustrative until scheme terms are validated.<div class="table-wrap" style="margin-top:8px"><table class="data-table"><thead><tr><th>#</th><th>Due</th><th>Principal</th><th>Interest</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="form-actions" style="justify-content:space-between"><button type="button" class="button button-danger" data-action="reject-loan" data-id="${esc(loan.id)}">Reject application</button><button type="submit" class="button button-primary">Approve terms</button></div></div></form>`);
  }
  function openDisbursement(loanId) {
    const loan = state.loans.find((item) => item.id === loanId);
    showDialog(`<form data-form="request-disbursement"><input type="hidden" name="loanId" value="${esc(loan.id)}"><div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Separate approval required</p><h2 id="dialog-title">Request loan disbursement</h2><p>Approval is complete, but this loan has not been disbursed. Repayments cannot be posted until disbursement is approved.</p></div><div class="detail-list"><div class="detail-item"><span>Member</span><strong>${esc(getMember(loan.memberId).name)}</strong></div><div class="detail-item"><span>Approved principal</span><strong>${amount(loan.approvedMinor)}</strong></div><div class="detail-item"><span>Interest terms</span><strong>${esc(loan.schemeSnapshot.name)} · ${loan.schemeSnapshot.annualRate}%</strong></div></div><div class="form-grid" style="margin-top:12px">${input("date", "Disbursement date", today(), "date", "required")}${input("reference", "Bank / voucher reference", id("VCH"), "text", "required")}</div><div class="dialog-actions"><button type="button" class="button" data-action="close-dialog">Cancel</button><button type="submit" class="button button-primary">Submit disbursement request</button></div></div></form>`);
  }
  function openLoanPayment(loanId, penaltyOnly = false) {
    const loan = state.loans.find((item) => item.id === loanId);
    if (!loan?.disbursed) return toast("This loan has not been disbursed; repayment is blocked.", true);
    const dues = loanDues(loan);
    const interest = penaltyOnly ? 0 : dues.interestDueMinor;
    const penalty = dues.penaltyDueMinor;
    if (penaltyOnly && !penalty) return toast("There is no configured unpaid penalty on this loan.", true);
    openForm(penaltyOnly ? "Post late-payment penalty" : "Record loan repayment", `Principal outstanding ${amount(loan.principalOutstandingMinor)} · EMI due ${amount(dues.emiDueMinor)} · configured penalty due ${amount(dues.penaltyDueMinor)}. ${penaltyOnly ? "This action posts only the verified configured penalty." : "Allocation priority: penalty → fee → interest → principal."}`, `${input("loanIdDisplay", "Loan account", `${loan.id} · ${getMember(loan.memberId).name}`, "text", "readonly")}${input("amount", "Payment amount · demo INR", penaltyOnly ? numberInput(penalty) : "", "number", "min=\"0.01\" step=\"0.01\" required")}${input("penalty", "Penalty due · demo INR", numberInput(penalty), "number", "min=\"0\" step=\"0.01\"")}${input("fee", "Fee due · demo INR", "0.00", "number", "min=\"0\" step=\"0.01\"")}${input("interest", "Interest due · demo INR", numberInput(interest), "number", "min=\"0\" step=\"0.01\"")}${selectField("paymentMode", "Payment mode", ["Cash", "Bank transfer", "Mobile transfer", "Cheque"].map((v) => `<option>${v}</option>`).join(""))}`, "loan-payment", penaltyOnly ? "Post penalty" : "Post repayment", `<input type="hidden" name="loanId" value="${esc(loan.id)}"><input type="hidden" name="penaltyOnly" value="${penaltyOnly}">`);
  }
  function openRD() {
    const options = state.schemes.rd.filter((scheme) => scheme.active).map((scheme) => `<option value="${esc(scheme.id)}">${esc(scheme.name)} · ${scheme.annualRate}% p.a.</option>`).join("");
    openForm("Open recurring deposit", "Creates the expected instalment schedule and snapshots the selected illustrative scheme.", `${selectField("memberId", "Member", memberOptions())}${selectField("schemeId", "Illustrative RD scheme", options)}${input("installment", "Instalment · demo USD", "50.00", "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("frequency", "Instalment frequency", ["monthly", "weekly", "fortnightly"].map((value) => `<option>${value}</option>`).join(""))}${input("installments", "Number of instalments", "12", "number", "min=\"1\" max=\"600\" required")}${input("startDate", "Start date", today(), "date", "required")}`, "new-rd", "Create RD");
  }
  function openFD() {
    const options = state.schemes.fd.filter((scheme) => scheme.active).map((scheme) => `<option value="${esc(scheme.id)}">${esc(scheme.name)} · ${scheme.annualRate}% p.a.</option>`).join("");
    openForm("Book fixed deposit", "Cumulative projections use explicit compounding; payout history is recorded separately.", `${selectField("memberId", "Member", memberOptions())}${selectField("schemeId", "Illustrative FD scheme", options)}${input("principal", "Principal · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${input("bookingDate", "Booking date", today(), "date", "required")}${input("tenureYears", "Tenure · years", "1", "number", "min=\"0.25\" step=\"0.25\" required")}${selectField("payoutOption", "Interest payout", `<option value="Cumulative">Cumulative · at maturity</option><option value="Periodic">Periodic interest payout</option>`)}${selectField("payoutFrequency", "Payout frequency", ["monthly", "quarterly", "annually", "at maturity"].map((value) => `<option>${value}</option>`).join(""))}`, "new-fd", "Book FD");
  }
  function openRDDetail(rdId) {
    const rd = state.rds.find((item) => item.id === rdId);
    const projection = F.recurringDepositProjection({ installmentMinor: rd.installmentMinor, annualRate: rd.schemeSnapshot.annualRate, installments: rd.installments, periodsPerYear: rd.schemeSnapshot.compounding });
    const rows = rd.schedule.map((row) => `<tr><td>${row.installment}</td><td>${niceDate(row.dueDate)}</td><td class="money">${amount(row.amountMinor)}</td><td>${statusPill(row.status)}</td></tr>`).join("");
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">RD statement · ${esc(rd.number)}</p><h2 id="dialog-title">${esc(getMember(rd.memberId).name)}</h2><p>${esc(rd.schemeSnapshot.name)} · ${rd.schemeSnapshot.annualRate}% p.a. · ${rd.schemeSnapshot.compounding} compounds / year</p></div><div class="detail-list"><div class="detail-item"><span>Paid instalments</span><strong>${amount(rd.paidMinor)}</strong></div><div class="detail-item"><span>Projected maturity</span><strong>${amount(projection.maturityMinor)}</strong></div><div class="detail-item"><span>Projected interest</span><strong>${amount(projection.interestMinor)}</strong></div><div class="detail-item"><span>Maturity date</span><strong>${niceDate(rd.maturityDate)}</strong></div></div><div class="formula-box" style="margin:12px 0"><strong>Formula &amp; assumptions:</strong> ${esc(projection.formula)}. Rate ${rd.schemeSnapshot.annualRate}% annual; compounding ${rd.schemeSnapshot.compounding} periods/year; nearest-cent rounding; actual payable requires verification.</div>${recordsTable(["#", "Expected date", "Instalment", "Status"], rows, "No schedule", "") }<div class="dialog-actions"><button class="button" data-action="close-dialog">Close</button><button class="button button-primary" data-action="rd-installment" data-id="${esc(rd.id)}">Record instalment</button></div></div>`);
  }
  function openFDDetail(fdId) {
    const fd = state.fds.find((item) => item.id === fdId);
    const projection = F.compoundProjection({ principalMinor: fd.principalMinor, annualRate: fd.schemeSnapshot.annualRate, periodsPerYear: fd.schemeSnapshot.compounding, years: fd.tenureYears });
    const history = fd.payoutHistory || [];
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">FD certificate · ${esc(fd.certificate)}</p><h2 id="dialog-title">${esc(getMember(fd.memberId).name)}</h2><p>${esc(fd.schemeSnapshot.name)} · ${fd.schemeSnapshot.annualRate}% p.a. · ${fd.payoutOption} payout</p></div><div class="detail-list"><div class="detail-item"><span>Principal</span><strong>${amount(fd.principalMinor)}</strong></div><div class="detail-item"><span>Projected maturity</span><strong>${amount(projection.maturityMinor)}</strong></div><div class="detail-item"><span>Projected interest</span><strong>${amount(projection.interestMinor)}</strong></div><div class="detail-item"><span>Maturity date</span><strong>${niceDate(fd.maturityDate)}</strong></div><div class="detail-item"><span>Status</span><strong>${esc(fd.status)}</strong></div><div class="detail-item"><span>Renewed from</span><strong>${esc(fd.renewedFrom || "Original deposit")}</strong></div></div><div class="formula-box" style="margin:12px 0"><strong>Formula:</strong> <code>${projection.formula}</code>. Inputs: ${amount(fd.principalMinor)} × (1 + ${fd.schemeSnapshot.annualRate}% / ${fd.schemeSnapshot.compounding}) ^ (${fd.schemeSnapshot.compounding} × ${fd.tenureYears}). Assumes fixed annual rate and compounding schedule; not a payout quote.</div>${recordsTable(["Payout reference", "Date", "Type", "Amount", "Status"], history.map((item) => `<tr><td>${esc(item.reference)}</td><td>${niceDate(item.date)}</td><td>${esc(item.type)}</td><td class="money">${amount(item.amountMinor)}</td><td>${statusPill(item.status)}</td></tr>`).join(""), "No payout history", "Verified payouts appear here.")}<div class="dialog-actions"><button class="button" data-action="close-dialog">Close</button></div></div>`);
  }

  function openMemberDetail(memberId) {
    const member = getMember(memberId);
    const savings = state.savings.filter((item) => item.memberId === memberId);
    const loans = state.loans.filter((item) => item.memberId === memberId);
    const rds = state.rds.filter((item) => item.memberId === memberId);
    const fds = state.fds.filter((item) => item.memberId === memberId);
    const receiptRows = state.collections.filter((item) => item.memberId === memberId).map((item) => `<tr><td>${esc(item.receipt)}</td><td>${esc(item.product)}</td><td class="money">${amount(item.amountMinor)}</td><td>${niceDate(item.date)}</td><td>${statusPill(item.status)}</td></tr>`).join("");
    const transactions = state.transactions.filter((item) => item.memberId === memberId).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const loanPortfolio = loans.reduce((sum, item) => sum + (item.disbursed ? item.principalOutstandingMinor : 0), 0);
    const rows = transactions.map((item) => `<tr><td>${esc(item.reference)}</td><td>${esc(normalize(item.kind))}</td><td>${esc(accountNumber(item.accountId))}</td><td class="money">${amount(item.amountMinor)}</td><td>${statusPill(item.status)}</td></tr>`).join("");
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Member profile · ${esc(member.id)}</p><h2 id="dialog-title">${esc(member.name)}</h2><p>${esc(member.phone)} · ${esc(member.email || "No email on file")} · Joined ${niceDate(member.joined)}</p></div><div class="detail-list"><div class="detail-item"><span>Verification</span><strong>${esc(member.verification)}</strong></div><div class="detail-item"><span>Nominee</span><strong>${esc(member.nominee || "Not recorded")}</strong></div><div class="detail-item"><span>Address</span><strong>${esc(member.address || "Not recorded")}</strong></div><div class="detail-item"><span>Savings</span><strong>${amount(savings.reduce((sum, item) => sum + accountBalance(item.id), 0))} · ${savings.length} account(s)</strong></div><div class="detail-item"><span>Loan principal out.</span><strong>${amount(loanPortfolio)} · ${loans.length} loan(s)</strong></div><div class="detail-item"><span>RD &amp; FD</span><strong>${rds.length} RD · ${fds.length} FD</strong></div></div><div class="tabs" style="margin-top:15px"><button class="tab-button is-active" data-action="profile-tab" data-tab="products">Products &amp; docs</button><button class="tab-button" data-action="profile-tab" data-tab="receipts">Receipts</button><button class="tab-button" data-action="profile-tab" data-tab="activity">Statement</button></div><div id="profile-tab-content">${renderMemberProducts(member, savings, loans, rds, fds)}</div><div class="dialog-actions"><button class="button" data-action="close-dialog">Close profile</button><button class="button button-primary" data-action="savings-entry" data-id="${savings[0]?.id || ""}">Savings entry</button></div><div id="profile-receipt-data" hidden>${receiptRows || "<tr><td colspan=\"5\">No receipts</td></tr>"}</div><div id="profile-statement-data" hidden>${rows || "<tr><td colspan=\"5\">No posted transactions</td></tr>"}</div></div>`);
  }
  function renderMemberProducts(member, savings, loans, rds, fds) {
    const docs = (member.documents || []).map((item) => `<span class="status status-approved">${esc(item)}</span>`).join(" ") || `<span class="status status-pending">No documents</span>`;
    const rows = [
      ...savings.map((item) => `<tr><td>Savings · ${esc(item.number)}</td><td>${esc(item.schemeSnapshot.name)}</td><td class="money">${amount(accountBalance(item.id))}</td><td>${statusPill("Active")}</td></tr>`),
      ...loans.map((item) => `<tr><td>Loan · ${esc(item.id)}</td><td>${esc(item.purpose)}</td><td class="money">${item.disbursed ? amount(item.principalOutstandingMinor) : "Not disbursed"}</td><td>${statusPill(item.status)}</td></tr>`),
      ...rds.map((item) => `<tr><td>RD · ${esc(item.number)}</td><td>${esc(item.schemeSnapshot.name)}</td><td class="money">${amount(item.paidMinor)}</td><td>${statusPill(item.status)}</td></tr>`),
      ...fds.map((item) => `<tr><td>FD · ${esc(item.certificate)}</td><td>${esc(item.schemeSnapshot.name)} · ${esc(item.payoutOption)}</td><td class="money">${amount(item.principalMinor)}</td><td>${statusPill(item.status)}</td></tr>`)
    ].join("");
    return `<div style="margin-bottom:9px"><span class="field-label">Documents</span>${docs}<span class="table-sub">Verification: ${esc(member.verification)}</span></div>${recordsTable(["Product", "Scheme / purpose", "Balance / principal", "Status"], rows, "No product accounts", "Open a savings, loan, RD or FD account for this member.")}`;
  }

  function openStatement(accountId) {
    const account = getProduct(accountId);
    if (!account) return toast("Account not found.", true);
    const entries = state.transactions.filter((item) => item.accountId === accountId).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let running = 0;
    const rows = entries.map((record) => {
      const delta = ledger().accountBalance(accountId);
      const inflows = ["opening_balance", "deposit", "collection_savings", "rd_deposit", "fd_booking"];
      let effect = inflows.includes(record.kind) ? record.amountMinor : -record.amountMinor;
      if (record.kind === "reversal") {
        const original = state.transactions.find((item) => item.reference === record.reversalOf);
        effect = (original && inflows.includes(original.kind) ? -1 : 1) * record.amountMinor;
      }
      running += effect;
      const unused = delta;
      void unused;
      return `<tr><td>${niceDate(record.createdAt.slice(0, 10))}</td><td><span class="table-main">${esc(record.reference)}</span><span class="table-sub">${esc(normalize(record.kind))}</span></td><td class="money">${effect < 0 ? amount(-effect) : "—"}</td><td class="money">${effect > 0 ? amount(effect) : "—"}</td><td class="money">${amount(running)}</td></tr>`;
    }).join("");
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">Account statement</p><h2 id="dialog-title">${esc(accountNumber(accountId))}</h2><p>${esc(getMember(account.memberId).name)} · ${esc(account.schemeSnapshot?.name || "Account")} · ${esc(account.schemeSnapshot?.annualRate ?? "")}% p.a. snapshot</p></div><div class="summary-strip"><div class="summary-cell"><span>Current posted balance</span><strong>${amount(accountBalance(accountId))}</strong></div><div class="summary-cell"><span>Transactions</span><strong>${entries.length}</strong></div><div class="summary-cell"><span>Opening date</span><strong>${niceDate(account.opened || account.bookingDate || account.startDate)}</strong></div></div>${recordsTable(["Date", "Reference / type", "Debit", "Credit", "Running balance"], rows, "No transactions", "Posted transactions are listed here.")}<div class="dialog-actions"><button class="button" data-action="close-dialog">Close</button><button class="button button-primary" data-action="export-account" data-id="${esc(accountId)}">Export statement</button></div></div>`);
  }

  function handleClick(event) {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) { navigate(pageButton.dataset.page); return; }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const itemId = button.dataset.id;
    if (action === "close-dialog") { closeDialog(); return; }
    if (action === "view-receipt") { openReceipt(button.dataset.receipt); return; }
    if (action === "share-receipt") { shareReceipt(button.dataset.receipt); return; }
    if (action === "text-receipt") { textReceipt(button.dataset.receipt); return; }
    if (action === "print-receipt") { window.print(); return; }
    if (action === "new-member") { openNewMember(); return; }
    if (action === "new-savings") { openNewSavings(); return; }
    if (action === "savings-entry") { openSavingsEntry(itemId); return; }
    if (action === "new-collection") { openCollection(); return; }
    if (action === "new-handover") { openHandover(selectedAgent); return; }
    if (action === "new-loan") { openLoanApplication(); return; }
    if (action === "new-rd") { openRD(); return; }
    if (action === "new-fd") { openFD(); return; }
    if (action === "member-detail") { openMemberDetail(itemId); return; }
    if (action === "statement") { openStatement(itemId); return; }
    if (action === "review-loan") { openLoanReview(itemId); return; }
    if (action === "disburse-loan") { openDisbursement(itemId); return; }
    if (action === "loan-payment") { openLoanPayment(itemId); return; }
    if (action === "loan-penalty") { openLoanPayment(itemId, true); return; }
    if (action === "loan-detail") { const loan = state.loans.find((item) => item.id === itemId); openLoanReview(itemId); if (loan?.disbursed) { const dialogContent = $("#dialog-content"); dialogContent.querySelector(".dialog-heading .eyebrow").textContent = `Loan statement · ${loan.id}`; } return; }
    if (action === "rd-detail") { openRDDetail(itemId); return; }
    if (action === "fd-detail") { openFDDetail(itemId); return; }
    if (action === "rd-installment") { openRDInstallment(itemId); return; }
    if (action === "fd-actions") { openFDActions(itemId); return; }
    if (action === "approve-request") { processRequest(itemId, "approve"); return; }
    if (action === "reject-request") { processRequest(itemId, "reject"); return; }
    if (action === "verify-collection") { verifyCollection(button.dataset.receipt); return; }
    if (action === "reconcile-handover") { reconcileHandover(itemId); return; }
    if (action === "toggle-attendance") { toggleAttendance(); return; }
    if (action === "toggle-agent-status") { toggleAgentStatus(itemId); return; }
    if (action === "toggle-live-location") { toggleLiveLocation(); return; }
    if (action === "collect-due") { openCollection({ accountId: button.dataset.accountId, amountMinor: Number(button.dataset.amountMinor), agentId: selectedAgent }); return; }
    if (action === "capture-location") { captureLocation(); return; }
    if (action === "reject-loan") { rejectLoan(itemId); return; }
    if (action === "profile-tab") { switchProfileTab(button.dataset.tab); return; }
    if (action === "export-report" || action === "export-transactions") { exportTransactions(); return; }
    if (action === "export-members") { exportMembers(); return; }
    if (action === "export-savings") { exportSavings(); return; }
    if (action === "export-rd") { exportRD(); return; }
    if (action === "export-fd") { exportFD(); return; }
    if (action === "export-account") { exportAccount(itemId); return; }
    if (action === "reset-demo") { confirmReset(); return; }
    if (action === "new-scheme") { openSchemeForm(button.dataset.kind); return; }
    if (action === "edit-scheme") { openSchemeForm(button.dataset.kind, itemId); return; }
    if (action === "capture-location") { captureLocation(); return; }
  }
  function createRequest(data) {
    if (data.accountId && data.amountMinor > accountBalance(data.accountId) && data.type === "savings_withdrawal") {
      const account = getSavings(data.accountId);
      const scheme = state.schemes.savings.find((item) => item.id === account?.schemeId);
      if (!scheme?.overdraftAllowed) throw new Error("Withdrawal exceeds available posted balance; this scheme blocks overdrafts.");
    }
    const request = { id: id("RQ"), status: "Pending", createdAt: new Date().toISOString(), maker: "Admin desk", ...data };
    state.requests.unshift(request);
    activity(`${requestLabel(request)} submitted`, `${getMember(request.memberId).name} · ${amount(request.amountMinor)} · awaiting approval`);
    save();
    renderPage();
    toast("Request submitted for separate approval.");
    return request;
  }
  function postSavingsRequest(request) {
    const withdrawal = request.type === "savings_withdrawal";
    const result = postTransaction({
      reference: request.id.replace("RQ-", "SAV-"), kind: withdrawal ? "withdrawal" : "deposit", memberId: request.memberId, accountId: request.accountId, amountMinor: request.amountMinor,
      entries: withdrawal ? journal(request.amountMinor, "Member savings liability", "Cash at bank") : journal(request.amountMinor, "Cash at bank", "Member savings liability"),
      metadata: { requestId: request.id, paymentMode: request.paymentMode, note: request.note }
    });
    if (result.duplicate) return toast("This request was already posted; no duplicate entry was created.", true);
    request.status = "Approved · posted";
    activity(withdrawal ? "Savings withdrawal approved and posted" : "Savings deposit approved and posted", `${getMember(request.memberId).name} · ${amount(request.amountMinor)}`);
  }
  function postCollection(collection) {
    if (collection.status === "Posted") return toast("This receipt is already posted; no duplicate credit was made.", true);
    const product = collection.product;
    const account = getProduct(collection.accountId);
    if (!account || account.memberId !== collection.memberId) throw new Error("Receipt member and product account do not match.");
    if (product === "Loan") {
      const loan = state.loans.find((item) => item.id === account.id);
      if (!loan?.disbursed) throw new Error("Cannot post repayment to an undisbursed loan.");
      applyLoanPayment(loan, collection.amountMinor, { paymentMode: collection.paymentMode, reference: collection.receipt, agentId: collection.agentId });
    } else {
      postTransaction({ reference: collection.receipt, kind: product === "RD" ? "rd_deposit" : "collection_savings", memberId: collection.memberId, accountId: collection.accountId, amountMinor: collection.amountMinor, entries: journal(collection.amountMinor, collection.paymentMode === "Cash" ? "Cash on hand" : "Cash at bank", product === "RD" ? "Recurring deposit liability" : "Member savings liability"), metadata: { paymentMode: collection.paymentMode, agentId: collection.agentId, receipt: collection.receipt, photo: collection.photo || "", location: collection.location || "" } });
      if (product === "RD") {
        const rd = state.rds.find((item) => item.id === collection.accountId);
        if (rd) { rd.paidMinor += collection.amountMinor; const next = rd.schedule.find((item) => item.status !== "Paid"); if (next) next.status = collection.amountMinor < next.amountMinor ? "Partial" : "Paid"; }
      }
    }
    collection.status = "Posted";
    const request = state.requests.find((item) => item.type === "collection" && item.collectionIndex >= 0 && state.collections[item.collectionIndex] === collection && item.status === "Pending");
    if (request) request.status = "Approved · posted";
    activity("Collection verified and posted", `${collection.receipt} · ${getMember(collection.memberId).name} · ${amount(collection.amountMinor)}`, getAgent(collection.agentId).name);
    save();
    renderPage();
    toast("Receipt verified and posted once to the selected account.");
  }
  function applyLoanPayment(loan, amountMinor, extra = {}) {
    if (!loan.disbursed) throw new Error("Cannot record repayment against an undisbursed loan.");
    const duePenalty = extra.penaltyMinor ?? 0;
    const fee = extra.feeMinor ?? 0;
    const interestDue = extra.interestDueMinor ?? loanDues(loan).interestDueMinor;
    const allocation = F.allocateLoanPayment({ amountMinor, principalOutstandingMinor: loan.principalOutstandingMinor, interestDueMinor: interestDue, feeDueMinor: fee, penaltyDueMinor: duePenalty });
    if (allocation.unappliedMinor) throw new Error("Payment exceeds principal and amounts currently due; split it into an explicit advance payment.");
    const liabilities = allocation.principalMinor + allocation.interestMinor + allocation.feeMinor + allocation.penaltyMinor;
    const entries = [{ account: "Cash at bank", debitMinor: amountMinor, creditMinor: 0 }];
    if (allocation.principalMinor) entries.push({ account: "Loans receivable · principal", debitMinor: 0, creditMinor: allocation.principalMinor });
    if (allocation.interestMinor) entries.push({ account: "Interest income", debitMinor: 0, creditMinor: allocation.interestMinor });
    if (allocation.feeMinor) entries.push({ account: "Fee income", debitMinor: 0, creditMinor: allocation.feeMinor });
    if (allocation.penaltyMinor) entries.push({ account: "Penalty income", debitMinor: 0, creditMinor: allocation.penaltyMinor });
    if (liabilities !== amountMinor) throw new Error("Repayment allocation must account for the full payment before posting.");
    const reference = extra.reference || id("EMI");
    const result = postTransaction({ reference, kind: "loan_repayment", memberId: loan.memberId, accountId: loan.id, amountMinor, entries, metadata: { ...allocation, paymentMode: extra.paymentMode || "Cash", agentId: extra.agentId || null } });
    if (result.duplicate) return toast("This payment reference was already posted; no duplicate was recorded.", true);
    loan.principalOutstandingMinor = Math.max(0, loan.principalOutstandingMinor - allocation.principalMinor);
    loan.payments = loan.payments || [];
    loan.payments.push({ reference, date: today(), amountMinor, ...allocation });
    let remainingInterest = allocation.interestMinor;
    let remainingPrincipal = allocation.principalMinor;
    let scheduledPrincipalApplied = 0;
    for (const row of loan.schedule) {
      if (row.status === "Paid" || row.dueDate > today()) continue;
      const interestRemaining = Math.max(0, row.interestMinor - (row.interestPaidMinor || 0));
      const principalRemaining = Math.max(0, row.principalMinor - (row.principalPaidMinor || 0));
      const interestApplied = Math.min(remainingInterest, interestRemaining);
      remainingInterest -= interestApplied;
      row.interestPaidMinor = (row.interestPaidMinor || 0) + interestApplied;
      const principalApplied = Math.min(remainingPrincipal, principalRemaining);
      remainingPrincipal -= principalApplied;
      scheduledPrincipalApplied += principalApplied;
      row.principalPaidMinor = (row.principalPaidMinor || 0) + principalApplied;
      row.paidMinor = row.interestPaidMinor + row.principalPaidMinor;
      row.status = row.paidMinor >= row.paymentMinor ? "Paid" : row.paidMinor ? "Partial" : loanDues(loan).overdueRows.includes(row) ? "Overdue" : "Due";
      row.balanceMinor = Math.min(row.balanceMinor, loan.principalOutstandingMinor);
    }
    const advancePrincipalMinor = allocation.principalMinor - scheduledPrincipalApplied;
    if (advancePrincipalMinor > 0) result.record.metadata.advancePrincipalMinor = advancePrincipalMinor;
    activity("Loan repayment posted", `${loan.id} · ${amount(amountMinor)} · ${amount(allocation.penaltyMinor)} penalty, ${amount(allocation.feeMinor)} fee, ${amount(allocation.interestMinor)} interest, ${amount(allocation.principalMinor)} principal`);
    save();
  }
  function processRequest(requestId, action) {
    const request = state.requests.find((item) => item.id === requestId);
    if (!request || request.status !== "Pending") return toast("This request has already been handled.", true);
    if (action === "reject") {
      const reason = window.prompt("Enter an audit reason for rejection:");
      if (!reason?.trim()) return;
      request.status = "Rejected";
      request.reason = reason.trim();
      activity(`${requestLabel(request)} rejected`, `${getMember(request.memberId).name} · ${reason.trim()}`);
      save(); renderPage(); toast("Request rejected; no financial posting was created."); return;
    }
    try {
      if (request.type === "savings_withdrawal" || request.type === "savings_deposit") postSavingsRequest(request);
      else if (request.type === "collection") {
        const collection = state.collections.find((item) => item.receipt === state.requests.find((entry) => entry.id === requestId)?.receipt) || state.collections.find((item) => item.status === "Pending verification" && item.memberId === request.memberId && item.accountId === request.accountId);
        if (!collection) throw new Error("Collection receipt not found.");
        postCollection(collection);
      } else if (request.type === "disbursement") {
        const loan = state.loans.find((item) => item.id === request.accountId);
        if (!loan || loan.disbursed || loan.status !== "Approved") throw new Error("Loan is not eligible for disbursement.");
        const reference = request.reference || id("DISB");
        const result = postTransaction({ reference, kind: "loan_disbursement", memberId: loan.memberId, accountId: loan.id, amountMinor: loan.approvedMinor, entries: journal(loan.approvedMinor, "Loans receivable · principal", "Cash at bank"), metadata: { requestId, date: request.date, schemeSnapshot: loan.schemeSnapshot } });
        if (result.duplicate) throw new Error("Disbursement was already posted.");
        loan.disbursed = true; loan.status = "Active"; loan.disbursedDate = request.date; loan.principalOutstandingMinor = loan.approvedMinor;
        loan.schedule = F.loanSchedule({ principalMinor: loan.approvedMinor, annualRate: loan.schemeSnapshot.annualRate, months: loan.tenureMonths, method: loan.schemeSnapshot.method, frequency: loan.schemeSnapshot.frequency, firstDueDate: loan.firstDueDate });
        loan.schedule.forEach((row) => { row.status = "Upcoming"; });
        request.status = "Approved · posted";
        activity("Loan disbursement approved and posted", `${loan.id} · ${amount(loan.approvedMinor)}`);
      } else if (request.type === "reversal") {
        const source = state.transactions.find((item) => item.reference === request.reference);
        if (!source) throw new Error("Original transaction not found.");
        const book = ledger();
        const result = book.reverse(request.reference, request.reversalReference, request.reason);
        if (result.duplicate) throw new Error("Reversal reference already exists.");
        state.transactions = book.records; request.status = "Approved · posted";
        activity("Transaction reversal approved and posted", `${request.reference} reversed · ${request.reason}`);
      } else if (["maturity_payout", "interest_payout", "rd_closure", "fd_closure", "loan_closure"].includes(request.type)) {
        postPayoutRequest(request);
      }
      save(); renderPage(); toast("Approved and posted. An audit record was retained.");
    } catch (error) { toast(error.message, true); }
  }
  function postPayoutRequest(request) {
    const ref = request.reference || id("PAY");
    const product = getProduct(request.accountId);
    if (request.type === "maturity_payout" && product && product.payoutHistory?.some((payout) => payout.type === "Maturity" && payout.status === "Posted")) throw new Error("Maturity payout already exists; duplicate payout blocked.");
    const debit = request.type === "interest_payout" ? "Interest payable" : request.type === "loan_closure" ? "Loans receivable · principal" : "Member deposit liability";
    const result = postTransaction({ reference: ref, kind: request.type, memberId: request.memberId, accountId: request.accountId, amountMinor: request.amountMinor, entries: journal(request.amountMinor, debit, "Cash at bank"), metadata: { requestId: request.id, reason: request.note || request.reason || "Approved payout" } });
    if (result.duplicate) throw new Error("Payout reference already posted.");
    request.status = "Approved · posted";
    if (product?.payoutHistory) product.payoutHistory.push({ reference: ref, date: today(), type: request.type === "interest_payout" ? "Interest" : "Maturity", amountMinor: request.amountMinor, status: "Posted" });
    if (request.type === "maturity_payout" || request.type === "fd_closure") product.status = request.type === "fd_closure" ? "Closed early" : "Matured";
    if (request.type === "rd_closure") product.status = "Closed early";
    if (request.type === "loan_closure") product.status = "Closed";
    activity(`${requestLabel(request)} approved and posted`, `${accountNumber(request.accountId)} · ${amount(request.amountMinor)}`);
  }
  function verifyCollection(receipt) {
    const collection = state.collections.find((item) => item.receipt === receipt);
    if (!collection) return toast("Receipt not found.", true);
    try { postCollection(collection); }
    catch (error) { toast(error.message, true); }
  }
  function reconcileHandover(handoverId) {
    const handover = state.handovers.find((item) => item.id === handoverId);
    if (!handover || handover.status !== "Awaiting reconciliation") return toast("Handover is already reconciled.", true);
    const receipts = handover.receipts.map((reference) => state.collections.find((item) => item.receipt === reference));
    if (receipts.some((item) => !item || item.status !== "Posted" || item.paymentMode !== "Cash")) return toast("Only posted cash receipts may be reconciled.", true);
    const expected = currencySum(receipts);
    const counted = Number(window.prompt(`Expected cash ${amount(expected)}. Enter counted cash in demo INR:`));
    if (!Number.isFinite(counted) || F.toMinor(counted) !== expected) return toast("Cash total does not match; handover remains open for review.", true);
    handover.status = "Reconciled"; handover.reconciledAt = new Date().toISOString(); handover.reconciledBy = "Admin desk";
    activity("Agent cash handover reconciled", `${handover.id} · ${amount(expected)} · no member account posted`);
    save(); renderPage(); toast("Cash handover reconciled. Member balances were not changed.");
  }
  function toggleAttendance() {
    const agent = getAgent(selectedAgent);
    if (!agent.active) return toast("This agent is inactive. Ask an admin to reactivate the account.", true);
    agent.attendance = agent.attendance === "Present" ? "Checked out" : "Present";
    activity(`Agent ${agent.attendance.toLowerCase()}`, `${agent.name} · ${today()}`, agent.name);
    save(); renderPage();
  }
  function toggleAgentStatus(agentId) {
    if (isAgentPortal) return toast("Only an admin can change agent status.", true);
    const agent = getAgent(agentId);
    agent.active = !agent.active;
    if (!agent.active) {
      agent.locationSharing = false;
      agent.locationStatus = "Sharing stopped · agent inactive";
      if (agent.id === selectedAgent && locationWatchId !== null) navigator.geolocation?.clearWatch(locationWatchId);
      if (agent.id === selectedAgent) locationWatchId = null;
    }
    activity(`Agent marked ${agent.active ? "active" : "inactive"}`, agent.name);
    save(); renderPage();
    toast(`${agent.name} is now ${agent.active ? "active" : "inactive"}.`);
  }
  function toggleLiveLocation() {
    const agent = getAgent(selectedAgent);
    if (!isAgentPortal) return toast("Location sharing is controlled from the agent portal.", true);
    if (!agent.active) return toast("An inactive agent cannot share location.", true);
    if (agent.locationSharing) {
      navigator.geolocation?.clearWatch(locationWatchId);
      locationWatchId = null;
      agent.locationSharing = false;
      agent.locationStatus = "Sharing stopped by agent";
      activity("Agent stopped live location sharing", agent.name, agent.name);
      save(); renderPage();
      return toast("Live location sharing stopped.");
    }
    if (!navigator.geolocation) return toast("Live location is unavailable in this browser.", true);
    agent.locationStatus = "Waiting for location permission";
    navigator.geolocation.getCurrentPosition((position) => {
      agent.locationSharing = true;
      agent.location = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, updatedAt: new Date(position.timestamp).toISOString() };
      agent.locationStatus = "Live location sharing";
      activity("Agent started live location sharing", agent.name, agent.name);
      save(); renderPage();
      if (locationWatchId === null) locationWatchId = navigator.geolocation.watchPosition((nextPosition) => {
        if (!agent.active || !agent.locationSharing) return;
        agent.location = { latitude: nextPosition.coords.latitude, longitude: nextPosition.coords.longitude, accuracy: nextPosition.coords.accuracy, updatedAt: new Date(nextPosition.timestamp).toISOString() };
        save();
      }, (error) => {
        agent.locationSharing = false;
        agent.locationStatus = `Location unavailable · ${error.message}`;
        locationWatchId = null;
        save(); renderPage();
      }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
    }, (error) => {
      agent.locationSharing = false;
      agent.locationStatus = `Permission unavailable · ${error.message}`;
      save(); renderPage();
      toast("Location permission was not granted; the agent can continue without sharing.", true);
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 });
  }
  function captureLocation() {
    if (!navigator.geolocation) return toast("Location is unavailable in this browser.", true);
    navigator.geolocation.getCurrentPosition((position) => {
      const inputField = $("#app-dialog [name=location]");
      if (inputField) inputField.value = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
      toast("Available location added to the receipt.");
    }, () => toast("Location permission was not granted; continue without it.", true), { timeout: 6000, maximumAge: 60000 });
  }
  function rejectLoan(loanId) {
    const reason = window.prompt("Enter an audit reason for rejecting this application:");
    if (!reason?.trim()) return;
    const loan = state.loans.find((item) => item.id === loanId);
    if (!loan || loan.status !== "Under review") return toast("Application is no longer under review.", true);
    loan.status = "Rejected"; loan.rejectionReason = reason.trim();
    activity("Loan application rejected", `${loan.id} · ${reason.trim()}`);
    save(); closeDialog(); renderPage(); toast("Application rejected; no disbursement was posted.");
  }
  function openRDInstallment(rdId) {
    const rd = state.rds.find((item) => item.id === rdId);
    if (!rd || rd.status !== "Active") return toast("This RD is not active.", true);
    openForm("Record RD instalment", `Expected ${amount(rd.installmentMinor)} · paid to date ${amount(rd.paidMinor)}. Maturity projection is not a verified payable amount.`, `${input("account", "RD account", `${rd.number} · ${getMember(rd.memberId).name}`, "text", "readonly")}${input("amount", "Amount · demo USD", numberInput(rd.installmentMinor), "number", "min=\"0.01\" step=\"0.01\" required")}${selectField("paymentMode", "Payment mode", ["Cash", "Bank transfer", "Mobile transfer"].map((value) => `<option>${value}</option>`).join(""))}`, "rd-installment", "Post instalment", `<input type="hidden" name="rdId" value="${esc(rd.id)}">`);
  }
  function openFDActions(fdId) {
    const fd = state.fds.find((item) => item.id === fdId);
    const projection = F.compoundProjection({ principalMinor: fd.principalMinor, annualRate: fd.schemeSnapshot.annualRate, periodsPerYear: fd.schemeSnapshot.compounding, years: fd.tenureYears });
    const atMaturity = fd.maturityDate <= today();
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">FD operations · ${esc(fd.certificate)}</p><h2 id="dialog-title">${esc(getMember(fd.memberId).name)}</h2><p>Principal ${amount(fd.principalMinor)} · projected maturity ${amount(projection.maturityMinor)} · ${atMaturity ? "maturity date reached" : `matures ${niceDate(fd.maturityDate)}`}</p></div><div class="notice notice-warn" style="margin-bottom:12px"><span>i</span><span>Maturity and premature closure requests require separate approval. Projected interest is not a verified payout amount.</span></div><div class="quick-actions"><button class="quick-action" data-action="request-fd-maturity" data-id="${esc(fd.id)}"><span class="quick-action-icon">✓</span><span><strong>Request maturity payout</strong><small>${atMaturity ? "Submit for verification" : "Only if maturity is verified"}</small></span></button><button class="quick-action" data-action="request-fd-interest" data-id="${esc(fd.id)}"><span class="quick-action-icon">↗</span><span><strong>Interest payout</strong><small>Enter verified amount and reference</small></span></button><button class="quick-action" data-action="renew-fd" data-id="${esc(fd.id)}"><span class="quick-action-icon">↻</span><span><strong>Renew deposit</strong><small>Creates a linked new certificate</small></span></button><button class="quick-action" data-action="premature-fd" data-id="${esc(fd.id)}"><span class="quick-action-icon">⇥</span><span><strong>Premature closure</strong><small>Illustrative deduction entered explicitly</small></span></button></div><div class="dialog-actions"><button class="button" data-action="close-dialog">Close</button></div></div>`);
  }
  function openMaturityRequest(fdId) {
    const fd = state.fds.find((item) => item.id === fdId);
    const projection = F.compoundProjection({ principalMinor: fd.principalMinor, annualRate: fd.schemeSnapshot.annualRate, periodsPerYear: fd.schemeSnapshot.compounding, years: fd.tenureYears });
    const verifiedDefault = fd.maturityDate <= today() ? numberInput(projection.maturityMinor) : "";
    openForm("Request FD maturity payout", `Projected ${amount(projection.maturityMinor)} is not payable until the maturity amount has been independently verified.`, `${input("fdDisplay", "Certificate", fd.certificate, "text", "readonly")}${input("verifiedAmount", "Verified payable amount · demo USD", verifiedDefault, "number", "min=\"0.01\" step=\"0.01\" required")}${input("verificationReference", "Calculation / verification reference", "", "text", "required")}${input("date", "Requested payout date", today(), "date", "required")}`, "maturity-request", "Submit for approval", `<input type="hidden" name="fdId" value="${esc(fd.id)}">`);
  }
  function openFDAmountRequest(fdId, type) {
    const fd = state.fds.find((item) => item.id === fdId);
    openForm(type === "interest_payout" ? "Request interest payout" : "Request premature closure", "Enter an amount verified under the society's approved terms; this demo does not calculate actual closure policy.", `${input("account", "Certificate", fd.certificate, "text", "readonly")}${input("verifiedAmount", "Verified payable amount · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${input("note", "Policy / verification reference", "", "text", "required")}`, type === "interest_payout" ? "interest-request" : "premature-fd-request", "Submit for approval", `<input type="hidden" name="fdId" value="${esc(fd.id)}">`);
  }
  function openRenewFD(fdId) {
    const fd = state.fds.find((item) => item.id === fdId);
    openForm("Renew fixed deposit", "Creates a new linked deposit record; original certificate remains unchanged. Verify rollover and payout instructions before approval.", `${input("source", "Original certificate", fd.certificate, "text", "readonly")}${input("principal", "New principal · demo USD", numberInput(fd.principalMinor), "number", "min=\"0.01\" step=\"0.01\" required")}${input("tenureYears", "New term · years", String(fd.tenureYears), "number", "min=\"0.25\" step=\"0.25\" required")}${input("bookingDate", "Renewal date", today(), "date", "required")}`, "renew-fd", "Create linked renewal", `<input type="hidden" name="fdId" value="${esc(fd.id)}">`);
  }
  function openRDClose(rdId) {
    const rd = state.rds.find((item) => item.id === rdId);
    openForm("Request premature RD closure", "Enter a verified payable amount after applying the approved scheme's deduction. This demo does not invent a deduction rule.", `${input("account", "RD account", rd.number, "text", "readonly")}${input("verifiedAmount", "Verified payable amount · demo USD", numberInput(rd.paidMinor), "number", "min=\"0\" step=\"0.01\" required")}${input("deduction", "Verified deduction · demo USD", "0.00", "number", "min=\"0\" step=\"0.01\"")}${input("note", "Approved policy / verification reference", "", "text", "required")}`, "rd-close", "Submit for approval", `<input type="hidden" name="rdId" value="${esc(rd.id)}">`);
  }
  function openLoanClosure(loanId) {
    const loan = state.loans.find((item) => item.id === loanId);
    openForm("Request loan closure", "Enter a verified foreclosure amount; actual fees and interest rules must be configured and approved by the society.", `${input("loan", "Loan", `${loan.id} · ${getMember(loan.memberId).name}`, "text", "readonly")}${input("amount", "Verified closure amount · demo USD", numberInput(loan.principalOutstandingMinor), "number", "min=\"0.01\" step=\"0.01\" required")}${input("note", "Policy / calculation reference", "", "text", "required")}`, "loan-close", "Submit for approval", `<input type="hidden" name="loanId" value="${esc(loan.id)}">`);
  }
  function openSchemeForm(kind, schemeId = "") {
    const scheme = state.schemes[kind].find((item) => item.id === schemeId) || {};
    const fields = `${input("name", "Scheme name", scheme.name || `${kind.toUpperCase()} example`, "text", "required")}${input("annualRate", "Annual interest rate · %", String(scheme.annualRate ?? 0), "number", "min=\"0\" max=\"100\" step=\"0.01\" required")}${kind === "loans" ? `${selectField("method", "Interest method", ["reducing", "flat"].map((item) => `<option ${scheme.method === item ? "selected" : ""}>${item}</option>`).join(""))}${selectField("frequency", "Repayment frequency", ["monthly", "weekly", "fortnightly"].map((item) => `<option ${scheme.frequency === item ? "selected" : ""}>${item}</option>`).join(""))}${input("graceDays", "Grace period · days", String(scheme.graceDays ?? 0), "number", "min=\"0\" required")}${input("lateFee", "Late fee · demo USD", numberInput(scheme.lateFeeMinor || 0), "number", "min=\"0\" step=\"0.01\"")}` : kind === "savings" ? `${field("Withdrawal approval", "withdrawalApproval", `<input type="checkbox" name="withdrawalApproval" ${scheme.withdrawalApproval !== false ? "checked" : ""}>`)}${field("Allow overdraft", "overdraftAllowed", `<input type="checkbox" name="overdraftAllowed" ${scheme.overdraftAllowed ? "checked" : ""}>`)}${input("graceDays", "Grace period · days", String(scheme.graceDays ?? 0), "number", "min=\"0\"")}` : `${input("compounding", "Compounding · periods/year", String(scheme.compounding ?? 12), "number", "min=\"1\" required")}${selectField("frequency", kind === "rd" ? "Instalment frequency" : "Payout frequency", (kind === "rd" ? ["monthly", "weekly", "fortnightly"] : ["monthly", "quarterly", "annually", "at maturity"]).map((item) => `<option ${scheme.frequency === item || scheme.payoutFrequency === item ? "selected" : ""}>${item}</option>`).join(""))}`}${field("Active scheme", "active", `<input type="checkbox" name="active" ${scheme.active !== false ? "checked" : ""}>`)}${field("Policy note", "note", `<textarea class="field-textarea" name="note" maxlength="300">${esc(scheme.note || "Illustrative example only. Confirm actual society terms.")}</textarea>`, "Label example schemes clearly; existing contract snapshots are not changed.", true)}`;
    openForm(schemeId ? "Edit illustrative scheme" : `Add ${kind.toUpperCase()} scheme`, "Scheme edits apply to new accounts and applications only; existing contractual snapshots are retained.", fields, "scheme-save", "Save scheme", `<input type="hidden" name="kind" value="${esc(kind)}"><input type="hidden" name="schemeId" value="${esc(schemeId)}">`);
  }
  function openReversal(reference) {
    const record = state.transactions.find((item) => item.reference === reference);
    if (!record) return toast("Transaction not found.", true);
    if (record.reversedBy) return toast("Transaction already has a linked reversal.", true);
    openForm("Request transaction reversal", `Original ${esc(record.reference)} · ${amount(record.amountMinor)}. Original entry remains immutable; approval creates a linked reversing journal.`, `${input("referenceDisplay", "Original transaction", record.reference, "text", "readonly")}${input("reason", "Audit reason", "", "text", "required maxlength=\"160\"")}`, "reversal-request", "Submit for approval", `<input type="hidden" name="reference" value="${esc(reference)}">`);
  }

  function handleSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const data = new FormData(form);
    const value = (key) => data.get(key)?.toString().trim() || "";
    const cents = (key) => F.toMinor(value(key) || 0);
    const checked = (key) => data.get(key) === "on";
    const fileName = (key) => data.get(key) instanceof File && data.get(key).name ? data.get(key).name : "";
    try {
      switch (form.dataset.form) {
        case "new-member": {
          if (state.members.some((member) => member.phone === value("phone"))) throw new Error("A member with this phone number already exists in the demo.");
          const member = { id: id("MB"), name: value("name"), phone: value("phone"), email: value("email"), joined: value("joined"), status: "Active", address: value("address"), nominee: `${value("nominee")} · ${value("nomineeRelation")}`, nomineeRelation: value("nomineeRelation"), verification: value("verification"), agentId: value("agentId"), documents: fileName("document") ? [fileName("document")] : [] };
          state.members.unshift(member); activity("Member profile created", `${member.name} · ${member.id}`); save(); closeDialog(); renderPage(); toast("Member profile created."); break;
        }
        case "new-savings": {
          const scheme = state.schemes.savings.find((item) => item.id === value("schemeId"));
          if (!scheme) throw new Error("Select an active savings scheme.");
          const account = { id: id("SA"), number: `${String(1000 + state.savings.length)} ${String(4200 + state.savings.length).padStart(4, "0")}`, memberId: value("memberId"), schemeId: scheme.id, opened: value("opened"), openingBalanceMinor: cents("openingBalance"), schemeSnapshot: { name: scheme.name, annualRate: scheme.annualRate, withdrawalApproval: scheme.withdrawalApproval, overdraftAllowed: scheme.overdraftAllowed } };
          state.savings.unshift(account);
          if (account.openingBalanceMinor > 0) postTransaction({ reference: `OPEN-${account.number.replace(/\s/g, "")}`, kind: "opening_balance", memberId: account.memberId, accountId: account.id, amountMinor: account.openingBalanceMinor, entries: journal(account.openingBalanceMinor, "Cash at bank", "Member savings liability"), metadata: { openingDate: account.opened, schemeSnapshot: account.schemeSnapshot } });
          activity("Savings account opened", `${getMember(account.memberId).name} · ${account.number}`); save(); closeDialog(); renderPage(); toast("Savings account opened with terms snapshot."); break;
        }
        case "savings-entry": {
          const account = getSavings(value("accountId"));
          if (!account) throw new Error("Savings account not found.");
          const direction = value("direction");
          const amountMinor = cents("amount");
          if (direction === "withdrawal" && amountMinor > accountBalance(account.id)) {
            const scheme = state.schemes.savings.find((item) => item.id === account.schemeId);
            if (!scheme?.overdraftAllowed) throw new Error(`Available balance is ${amount(accountBalance(account.id))}; overdraft is not permitted by this scheme.`);
          }
          const type = direction === "withdrawal" ? "savings_withdrawal" : "savings_deposit";
          if (direction === "deposit") createRequest({ type, memberId: account.memberId, accountId: account.id, amountMinor, paymentMode: value("paymentMode"), note: value("note") });
          else createRequest({ type, memberId: account.memberId, accountId: account.id, amountMinor, paymentMode: value("paymentMode"), note: value("note") });
          closeDialog(); renderPage(); break;
        }
        case "new-collection": {
          const account = getProduct(value("accountId"));
          const chosen = $("#app-dialog [name=accountId]").selectedOptions[0];
          const product = chosen?.dataset.product;
          if (!account || !product) throw new Error("Select a valid product account.");
          const collectionAgent = getAgent(value("agentId"));
          if (!collectionAgent.active) throw new Error("This agent is inactive and cannot record a new collection.");
          if (account.memberId !== value("memberId") && value("memberId")) throw new Error("Member and product account do not match.");
          if (getMember(account.memberId).agentId !== collectionAgent.id) throw new Error("This member is assigned to a different collection agent.");
          if (product === "Loan" && !account.disbursed) throw new Error("Cannot collect repayment for an undisbursed loan.");
          const receipt = `RC-${++state.sequence}`;
          const collection = { memberId: account.memberId, accountId: account.id, agentId: value("agentId"), amountMinor: cents("amount"), paymentMode: value("paymentMode"), status: "Pending verification", date: value("date"), receipt, product, time: value("time"), location: value("location"), photo: fileName("photo") };
          state.collections.unshift(collection);
          createRequest({ type: "collection", receipt, memberId: collection.memberId, accountId: collection.accountId, amountMinor: collection.amountMinor, collectionIndex: state.collections.indexOf(collection), maker: getAgent(collection.agentId).name });
          activity("Collection receipt issued", `${receipt} · ${getMember(collection.memberId).name} · pending verification`, getAgent(collection.agentId).name);
          save(); closeDialog(); renderPage(); openReceipt(collection); toast(`Receipt ${receipt} issued; balance pending verification.`); break;
        }
        case "new-handover": {
          const refs = data.getAll("receipts").map(String);
          if (!refs.length) throw new Error("Select at least one posted cash receipt.");
          const receipts = refs.map((reference) => state.collections.find((item) => item.receipt === reference));
          if (receipts.some((item) => !item || item.status !== "Posted" || item.paymentMode !== "Cash" || item.agentId !== value("agentId"))) throw new Error("Handover contains an ineligible receipt.");
          if (state.handovers.some((item) => item.receipts.some((reference) => refs.includes(reference)))) throw new Error("A receipt can only belong to one handover.");
          state.handovers.unshift({ id: id("HO"), agentId: value("agentId"), date: today(), amountMinor: currencySum(receipts), status: "Awaiting reconciliation", receipts: refs, createdAt: new Date().toISOString() });
          activity("Cash handover submitted", `${getAgent(value("agentId")).name} · ${amount(currencySum(receipts))}`); save(); closeDialog(); renderPage(); toast("Cash handover created. Member accounts were not posted again."); break;
        }
        case "new-loan": {
          const scheme = state.schemes.loans.find((item) => item.id === value("schemeId"));
          const loan = { id: id("LN"), memberId: value("memberId"), applicationDate: today(), purpose: value("purpose"), requestedMinor: cents("amount"), approvedMinor: 0, tenureMonths: Number(value("tenure")), schemeId: scheme.id, status: "Under review", disbursed: false, guarantor: value("guarantor"), documents: fileName("document") ? ["Application form", fileName("document")] : ["Application form"] };
          state.loans.unshift(loan); activity("Loan application received", `${loan.id} · ${getMember(loan.memberId).name} · ${amount(loan.requestedMinor)}`); save(); closeDialog(); renderPage(); toast("Application saved. Review and schedule preview are separate from disbursement."); break;
        }
        case "review-loan": {
          const loan = state.loans.find((item) => item.id === value("loanId"));
          const scheme = state.schemes.loans.find((item) => item.id === value("schemeId"));
          if (!loan || loan.status !== "Under review" || !scheme) throw new Error("Application or scheme is no longer available.");
          loan.approvedMinor = cents("approvedAmount"); loan.tenureMonths = Number(value("tenure")); loan.schemeId = scheme.id; loan.schemeSnapshot = { name: scheme.name, annualRate: scheme.annualRate, method: scheme.method, frequency: scheme.frequency, graceDays: Number(scheme.graceDays || 0), lateFeeMinor: scheme.lateFeeMinor || 0, dayCount: "Actual/365", rounding: "Nearest cent", chargesMinor: cents("charges") }; loan.firstDueDate = value("firstDueDate"); loan.guarantor = value("guarantor");
          loan.schedule = F.loanSchedule({ principalMinor: loan.approvedMinor, annualRate: scheme.annualRate, months: loan.tenureMonths, method: scheme.method, frequency: scheme.frequency, firstDueDate: loan.firstDueDate });
          loan.schedule.forEach((row) => { row.status = "Upcoming"; });
          loan.status = "Approved"; activity("Loan terms approved", `${loan.id} · ${scheme.method} · ${amount(loan.approvedMinor)} · disbursement pending`); save(); closeDialog(); renderPage(); toast("Loan approved with a repayment schedule snapshot. No funds were disbursed."); break;
        }
        case "request-disbursement": {
          const loan = state.loans.find((item) => item.id === value("loanId"));
          if (!loan || loan.status !== "Approved" || loan.disbursed) throw new Error("Only an approved, undisbursed loan can be submitted.");
          createRequest({ type: "disbursement", memberId: loan.memberId, accountId: loan.id, amountMinor: loan.approvedMinor, date: value("date"), reference: value("reference") }); closeDialog(); renderPage(); break;
        }
        case "loan-payment": {
          const loan = state.loans.find((item) => item.id === value("loanId"));
          const amountMinor = cents("amount");
          const alloc = F.allocateLoanPayment({ amountMinor, principalOutstandingMinor: loan.principalOutstandingMinor, interestDueMinor: cents("interest"), feeDueMinor: cents("fee"), penaltyDueMinor: cents("penalty") });
          if (alloc.unappliedMinor) throw new Error(`Payment exceeds current dues and principal by ${amount(alloc.unappliedMinor)}. Advance-payment terms must be explicitly configured.`);
          applyLoanPayment(loan, amountMinor, { interestDueMinor: cents("interest"), feeMinor: cents("fee"), penaltyMinor: cents("penalty"), paymentMode: value("paymentMode") }); save(); closeDialog(); renderPage(); toast("Loan repayment posted with explicit principal, interest, fee and penalty allocation."); break;
        }
        case "rd-installment": {
          const rd = state.rds.find((item) => item.id === value("rdId"));
          if (!rd || rd.status !== "Active") throw new Error("RD account is not active.");
          const amountMinor = cents("amount");
          const reference = id("RDP");
          postTransaction({ reference, kind: "rd_deposit", memberId: rd.memberId, accountId: rd.id, amountMinor, entries: journal(amountMinor, value("paymentMode") === "Cash" ? "Cash on hand" : "Cash at bank", "Recurring deposit liability"), metadata: { paymentMode: value("paymentMode") } });
          rd.paidMinor += amountMinor; const next = rd.schedule.find((row) => row.status !== "Paid"); if (next) next.status = amountMinor < next.amountMinor ? "Partial" : "Paid";
          activity("RD instalment posted", `${rd.number} · ${amount(amountMinor)}`); save(); closeDialog(); renderPage(); toast("RD instalment posted; paid balance and schedule updated."); break;
        }
        case "new-rd": {
          const scheme = state.schemes.rd.find((item) => item.id === value("schemeId"));
          const installments = Number(value("installments")); const startDate = value("startDate");
          const maturity = new Date(`${startDate}T12:00:00`); maturity.setMonth(maturity.getMonth() + installments);
          const rd = { id: id("RD"), number: id("RD-N"), memberId: value("memberId"), schemeId: scheme.id, schemeSnapshot: { name: scheme.name, annualRate: scheme.annualRate, compounding: scheme.compounding, frequency: value("frequency"), dayCount: "Actual/365", rounding: "Nearest cent", graceDays: scheme.graceDays || 0, penaltyMinor: scheme.penaltyMinor || 0 }, installmentMinor: cents("installment"), frequency: value("frequency"), installments, startDate, maturityDate: maturity.toISOString().slice(0, 10), status: "Active", paidMinor: 0, payoutHistory: [], schedule: [] };
          rd.schedule = Array.from({ length: installments }, (_, index) => { const due = new Date(`${startDate}T12:00:00`); due.setMonth(due.getMonth() + index + 1); return { installment: index + 1, dueDate: due.toISOString().slice(0, 10), amountMinor: rd.installmentMinor, status: "Upcoming" }; });
          state.rds.unshift(rd); activity("Recurring deposit opened", `${rd.number} · ${getMember(rd.memberId).name} · terms snapshotted`); save(); closeDialog(); renderPage(); toast("RD account and expected instalment schedule created."); break;
        }
        case "new-fd": {
          const scheme = state.schemes.fd.find((item) => item.id === value("schemeId"));
          const bookingDate = value("bookingDate"); const tenureYears = Number(value("tenureYears")); const maturity = new Date(`${bookingDate}T12:00:00`); maturity.setMonth(maturity.getMonth() + Math.round(tenureYears * 12));
          const fd = { id: id("FD"), certificate: id("CERT"), memberId: value("memberId"), schemeId: scheme.id, schemeSnapshot: { name: scheme.name, annualRate: scheme.annualRate, compounding: scheme.compounding, payoutFrequency: value("payoutFrequency"), dayCount: "Actual/365", rounding: "Nearest cent", prematureDeductionRule: scheme.prematureDeductionRule || "Not configured" }, principalMinor: cents("principal"), bookingDate, tenureYears, maturityDate: maturity.toISOString().slice(0, 10), payoutOption: value("payoutOption"), status: "Active", payoutHistory: [], renewedFrom: null };
          state.fds.unshift(fd);
          postTransaction({ reference: `BOOK-${fd.certificate}`, kind: "fd_booking", memberId: fd.memberId, accountId: fd.id, amountMinor: fd.principalMinor, entries: journal(fd.principalMinor, "Cash at bank", "Fixed deposit liability"), metadata: { bookingDate, certificate: fd.certificate, schemeSnapshot: fd.schemeSnapshot } });
          activity("Fixed deposit booked", `${fd.certificate} · ${getMember(fd.memberId).name} · ${amount(fd.principalMinor)}`); save(); closeDialog(); renderPage(); toast("FD booked with certificate and scheme snapshot."); break;
        }
        case "maturity-request": {
          const fd = state.fds.find((item) => item.id === value("fdId"));
          if (fd.payoutHistory.some((item) => item.type === "Maturity" && item.status === "Posted") || pendingRequests("maturity_payout").some((item) => item.accountId === fd.id)) throw new Error("A maturity payout is already pending or posted.");
          const request = createRequest({ type: "maturity_payout", memberId: fd.memberId, accountId: fd.id, amountMinor: cents("verifiedAmount"), reference: id("MAT"), note: `Verified via ${value("verificationReference")}`, requestedDate: value("date") });
          fd.pendingMaturityRequest = request.id; closeDialog(); renderPage(); break;
        }
        case "interest-request": {
          const fd = state.fds.find((item) => item.id === value("fdId"));
          createRequest({ type: "interest_payout", memberId: fd.memberId, accountId: fd.id, amountMinor: cents("verifiedAmount"), note: value("note"), reference: id("INT") }); closeDialog(); renderPage(); break;
        }
        case "premature-fd-request": {
          const fd = state.fds.find((item) => item.id === value("fdId"));
          createRequest({ type: "fd_closure", memberId: fd.memberId, accountId: fd.id, amountMinor: cents("verifiedAmount"), note: value("note"), reference: id("FDC") }); closeDialog(); renderPage(); break;
        }
        case "renew-fd": {
          const source = state.fds.find((item) => item.id === value("fdId"));
          const copy = { ...source, id: id("FD"), certificate: id("CERT"), principalMinor: cents("principal"), bookingDate: value("bookingDate"), tenureYears: Number(value("tenureYears")), status: "Active", payoutHistory: [], renewedFrom: source.certificate };
          const maturity = new Date(`${copy.bookingDate}T12:00:00`); maturity.setMonth(maturity.getMonth() + Math.round(copy.tenureYears * 12)); copy.maturityDate = maturity.toISOString().slice(0, 10);
          const scheme = state.schemes.fd.find((item) => item.id === copy.schemeId); copy.schemeSnapshot = { ...source.schemeSnapshot, annualRate: scheme?.annualRate ?? source.schemeSnapshot.annualRate, compounding: scheme?.compounding ?? source.schemeSnapshot.compounding, name: scheme?.name ?? source.schemeSnapshot.name };
          state.fds.unshift(copy); postTransaction({ reference: `BOOK-${copy.certificate}`, kind: "fd_booking", memberId: copy.memberId, accountId: copy.id, amountMinor: copy.principalMinor, entries: journal(copy.principalMinor, "Cash at bank", "Fixed deposit liability"), metadata: { bookingDate: copy.bookingDate, certificate: copy.certificate, renewedFrom: source.certificate, schemeSnapshot: copy.schemeSnapshot } });
          activity("FD renewed as linked new record", `${source.certificate} → ${copy.certificate}`); save(); closeDialog(); renderPage(); toast("Renewal created a linked new deposit. Original certificate was retained."); break;
        }
        case "rd-close": {
          const rd = state.rds.find((item) => item.id === value("rdId"));
          createRequest({ type: "rd_closure", memberId: rd.memberId, accountId: rd.id, amountMinor: cents("verifiedAmount"), note: `${value("note")} · declared deduction ${amount(cents("deduction"))}`, reference: id("RDC") }); closeDialog(); renderPage(); break;
        }
        case "loan-close": {
          const loan = state.loans.find((item) => item.id === value("loanId"));
          createRequest({ type: "loan_closure", memberId: loan.memberId, accountId: loan.id, amountMinor: cents("amount"), note: value("note"), reference: id("LCL") }); closeDialog(); renderPage(); break;
        }
        case "reversal-request": {
          const original = state.transactions.find((item) => item.reference === value("reference"));
          if (!original || original.reversedBy) throw new Error("Original missing or already reversed.");
          createRequest({ type: "reversal", memberId: original.memberId, accountId: original.accountId, amountMinor: original.amountMinor, reference: original.reference, reversalReference: id("REV"), reason: value("reason") }); closeDialog(); renderPage(); break;
        }
        case "scheme-save": {
          const kind = value("kind"); const existing = state.schemes[kind].find((item) => item.id === value("schemeId"));
          const scheme = { ...(existing || {}), id: existing?.id || id(`SCH-${kind}`), name: value("name"), annualRate: Number(value("annualRate")), active: checked("active"), note: value("note") || "Illustrative example only." };
          if (kind === "loans") Object.assign(scheme, { method: value("method"), frequency: value("frequency"), graceDays: Number(value("graceDays")), lateFeeMinor: cents("lateFee") });
          else if (kind === "savings") Object.assign(scheme, { withdrawalApproval: checked("withdrawalApproval"), overdraftAllowed: checked("overdraftAllowed"), graceDays: Number(value("graceDays")) });
          else Object.assign(scheme, { compounding: Number(value("compounding")), [kind === "rd" ? "frequency" : "payoutFrequency"]: value("frequency") });
          if (existing) Object.assign(existing, scheme); else state.schemes[kind].push(scheme);
          activity(existing ? "Illustrative scheme updated" : "Illustrative scheme created", `${scheme.name} · future contracts only`); save(); closeDialog(); renderPage(); toast("Scheme saved. Existing account snapshots remain unchanged."); break;
        }
      }
    } catch (error) { toast(error.message || "Could not save this action.", true); }
  }

  function openRDContextActions(rdId) {
    const rd = state.rds.find((item) => item.id === rdId);
    showDialog(`<div class="dialog-content"><div class="dialog-heading"><p class="eyebrow">RD operations</p><h2 id="dialog-title">${esc(rd.number)}</h2><p>${esc(getMember(rd.memberId).name)} · maturity ${niceDate(rd.maturityDate)}</p></div><div class="quick-actions"><button class="quick-action" data-action="rd-installment" data-id="${esc(rd.id)}"><span class="quick-action-icon">＋</span><span><strong>Record instalment</strong><small>Post payment to the RD ledger</small></span></button><button class="quick-action" data-action="request-rd-maturity" data-id="${esc(rd.id)}"><span class="quick-action-icon">✓</span><span><strong>Request maturity payout</strong><small>Enter verified amount</small></span></button><button class="quick-action" data-action="premature-rd" data-id="${esc(rd.id)}"><span class="quick-action-icon">⇥</span><span><strong>Premature closure</strong><small>Approval and verified deduction</small></span></button></div><div class="dialog-actions"><button class="button" data-action="close-dialog">Close</button></div></div>`);
  }
  function openRDMaturity(rdId) {
    const rd = state.rds.find((item) => item.id === rdId);
    const projection = F.recurringDepositProjection({ installmentMinor: rd.installmentMinor, annualRate: rd.schemeSnapshot.annualRate, installments: rd.installments, periodsPerYear: rd.schemeSnapshot.compounding });
    openForm("Request RD maturity payout", `Projection ${amount(projection.maturityMinor)} · paid to date ${amount(rd.paidMinor)}. Submit independently verified payable amount; projection is not payable.`, `${input("account", "RD account", rd.number, "text", "readonly")}${input("amount", "Verified payable amount · demo USD", "", "number", "min=\"0.01\" step=\"0.01\" required")}${input("note", "Verification reference", "", "text", "required")}`, "rd-maturity", "Submit for approval", `<input type="hidden" name="rdId" value="${esc(rd.id)}">`);
  }
  function switchProfileTab(tab) {
    const content = $("#profile-tab-content");
    $$(".tab-button", $("#app-dialog")).forEach((item) => item.classList.toggle("is-active", item.dataset.tab === tab));
    const html = tab === "products" ? content.innerHTML : tab === "receipts" ? recordsTable(["Receipt", "Product", "Amount", "Date", "Status"], $("#profile-receipt-data").innerHTML, "No receipts", "") : recordsTable(["Reference", "Type", "Account", "Amount", "Status"], $("#profile-statement-data").innerHTML, "No transactions", "");
    content.innerHTML = html;
  }

  function exportFile(filename, headers, rows) {
    const quote = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(quote).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast("Excel-compatible CSV export downloaded.");
  }
  function exportTransactions() { exportFile("society-posted-ledger.csv", ["Reference", "Type", "Member ID", "Member", "Account", "Amount minor units", "Status", "Date"], state.transactions.map((item) => [item.reference, item.kind, item.memberId, getMember(item.memberId).name, accountNumber(item.accountId), item.amountMinor, item.status, item.createdAt])); }
  function exportMembers() {
    const text = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
    const cell = (value) => `<Cell><Data ss:Type="String">${text(value)}</Data></Cell>`;
    const sheet = (name, headers, records) => `<Worksheet ss:Name="${name}"><Table><Row>${headers.map(cell).join("")}</Row>${records.map((record) => `<Row>${record.map(cell).join("")}</Row>`).join("")}</Table></Worksheet>`;
    const members = state.members.map((member) => [member.id, member.name, member.phone, member.email, member.joined, member.status, member.address, member.nominee, member.nomineeRelation, member.verification, (member.documents || []).join("; "), getAgent(member.agentId).name, member.agentId, state.savings.filter((item) => item.memberId === member.id).reduce((sum, item) => sum + accountBalance(item.id), 0) / 100]);
    const savings = state.savings.map((account) => [account.memberId, getMember(account.memberId).name, account.id, account.number, account.opened, account.schemeSnapshot?.name, account.schemeSnapshot?.annualRate, accountBalance(account.id) / 100, JSON.stringify(account.schemeSnapshot || {})]);
    const loans = state.loans.map((loan) => [loan.memberId, getMember(loan.memberId).name, loan.id, loan.status, loan.purpose, (loan.requestedMinor || 0) / 100, (loan.approvedMinor || 0) / 100, loan.tenureMonths, loan.disbursed ? "Yes" : "No", (loan.principalOutstandingMinor || 0) / 100, loan.firstDueDate, loan.guarantor, loan.schemeSnapshot?.name, loan.schemeSnapshot?.method, loan.schemeSnapshot?.annualRate, JSON.stringify(loan.schemeSnapshot || {})]);
    const schedules = state.loans.flatMap((loan) => (loan.schedule || []).map((row) => [loan.memberId, loan.id, row.installment, row.dueDate, (row.principalMinor || 0) / 100, (row.interestMinor || 0) / 100, (row.paymentMinor || 0) / 100, (row.balanceMinor || 0) / 100, row.status]));
    const rds = state.rds.map((rd) => [rd.memberId, getMember(rd.memberId).name, rd.id, rd.number, rd.status, (rd.installmentMinor || 0) / 100, rd.frequency, rd.installments, (rd.paidMinor || 0) / 100, rd.startDate, rd.maturityDate, rd.schemeSnapshot?.annualRate, rd.schemeSnapshot?.compounding, JSON.stringify(rd.schemeSnapshot || {})]);
    const rdSchedule = state.rds.flatMap((rd) => (rd.schedule || []).map((row) => [rd.memberId, rd.id, rd.number, row.installment, row.dueDate, (row.amountMinor || 0) / 100, row.status]));
    const fds = state.fds.map((fd) => [fd.memberId, getMember(fd.memberId).name, fd.id, fd.certificate, fd.status, (fd.principalMinor || 0) / 100, fd.bookingDate, fd.tenureYears, fd.maturityDate, fd.payoutOption, fd.schemeSnapshot?.annualRate, fd.schemeSnapshot?.compounding, fd.renewedFrom, JSON.stringify(fd.schemeSnapshot || {})]);
    const receipts = state.collections.map((receipt) => [receipt.memberId, getMember(receipt.memberId).name, receipt.receipt, receipt.product, receipt.accountId, receipt.date, receipt.time, (receipt.amountMinor || 0) / 100, receipt.paymentMode, receipt.status, getAgent(receipt.agentId).name, receipt.location, receipt.photo, receipt.memberShareStatus]);
    const transactions = state.transactions.map((record) => [record.memberId, getMember(record.memberId).name, record.reference, record.kind, record.accountId, (record.amountMinor || 0) / 100, record.status, record.createdAt, record.reversalOf, record.reversedBy, JSON.stringify(record.entries || []), JSON.stringify(record.metadata || {})]);
    const agents = state.agents.map((agent) => [agent.id, agent.name, agent.active ? "Active" : "Inactive", agent.attendance, state.members.filter((member) => member.agentId === agent.id).map((member) => member.id).join("; "), agent.location ? `${agent.location.latitude}, ${agent.location.longitude}` : "", agent.location?.updatedAt || "", agent.location?.accuracy || "", agent.locationSharing ? "Sharing" : (agent.locationStatus || "Not shared")]);
    const activities = state.activity.map((item) => [item.date, item.title, item.detail, item.actor]);
    const sheets = [
      sheet("Members", ["Member ID", "Name", "Phone", "Email", "Joined", "Status", "Address", "Nominee", "Relationship", "Verification", "Documents", "Assigned agent", "Agent ID", "Savings balance INR"], members),
      sheet("Savings", ["Member ID", "Member", "Account ID", "Account number", "Opened", "Scheme snapshot", "Annual rate %", "Posted balance INR", "Terms JSON"], savings),
      sheet("Loans", ["Member ID", "Member", "Loan ID", "Status", "Purpose", "Requested INR", "Approved INR", "Tenure months", "Disbursed", "Principal outstanding INR", "First due", "Guarantor", "Scheme", "Interest method", "Annual rate %", "Terms JSON"], loans),
      sheet("Loan schedule", ["Member ID", "Loan ID", "Instalment", "Due date", "Principal INR", "Interest INR", "Payment INR", "Balance INR", "Status"], schedules),
      sheet("RD accounts", ["Member ID", "Member", "RD ID", "RD number", "Status", "Instalment INR", "Frequency", "Tenure instalments", "Paid INR", "Start date", "Maturity date", "Annual rate %", "Compounding", "Terms JSON"], rds),
      sheet("RD schedule", ["Member ID", "RD ID", "RD number", "Instalment", "Due date", "Amount INR", "Status"], rdSchedule),
      sheet("FD accounts", ["Member ID", "Member", "FD ID", "Certificate", "Status", "Principal INR", "Booking date", "Tenure years", "Maturity date", "Payout option", "Annual rate %", "Compounding", "Renewed from", "Terms JSON"], fds),
      sheet("Receipts", ["Member ID", "Member", "Receipt", "Product", "Account ID", "Date", "Time", "Amount INR", "Mode", "Status", "Agent", "Location", "Photo filename", "Member share status"], receipts),
      sheet("Posted ledger", ["Member ID", "Member", "Reference", "Type", "Account ID", "Amount INR", "Status", "Created at", "Reverses", "Reversed by", "Journal JSON", "Metadata JSON"], transactions),
      sheet("Agents", ["Agent ID", "Name", "Status", "Attendance", "Assigned member IDs", "Latest coordinates", "Location updated at", "Accuracy metres", "Sharing status"], agents),
      sheet("Activity", ["Timestamp", "Activity", "Details", "Actor"], activities)
    ].join("");
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40"><DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>Gajlaxmi Bank member data</Title><Subject>Illustrative demo export</Subject></DocumentProperties>${sheets}</Workbook>`;
    const blob = new Blob(["\ufeff", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "gajlaxmi-bank-all-member-data.xls"; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast("All member records and linked financial data exported to Excel-compatible workbook.");
  }
  function exportSavings() { exportFile("society-savings-statements.csv", ["Account", "Member", "Reference", "Type", "Amount minor", "Status", "Date"], state.transactions.filter((item) => state.savings.some((account) => account.id === item.accountId)).map((item) => [accountNumber(item.accountId), getMember(item.memberId).name, item.reference, item.kind, item.amountMinor, item.status, item.createdAt])); }
  function exportRD() { exportFile("society-rd-accounts.csv", ["RD account", "Member", "Instalment minor", "Paid minor", "Maturity date", "Rate annual percent", "Status"], state.rds.map((item) => [item.number, getMember(item.memberId).name, item.installmentMinor, item.paidMinor, item.maturityDate, item.schemeSnapshot.annualRate, item.status])); }
  function exportFD() { exportFile("society-fd-accounts.csv", ["Certificate", "Member", "Principal minor", "Booking date", "Maturity date", "Rate annual percent", "Status", "Renewed from"], state.fds.map((item) => [item.certificate, getMember(item.memberId).name, item.principalMinor, item.bookingDate, item.maturityDate, item.schemeSnapshot.annualRate, item.status, item.renewedFrom])); }
  function exportAccount(accountId) { exportFile(`${accountNumber(accountId)}-statement.csv`, ["Date", "Reference", "Type", "Amount minor", "Status"], state.transactions.filter((item) => item.accountId === accountId).map((item) => [item.createdAt, item.reference, item.kind, item.amountMinor, item.status])); }
  function confirmReset() {
    if (!window.confirm("Reset all local demo changes and restore the illustrative seed records? This does not affect any external system.")) return;
    localStorage.removeItem(STORE_KEY); state = seededState(); currentPage = "demo"; save(); renderPage(); toast("Illustrative demo data restored.");
  }
  function updateSearch(event) {
    if (event.target.id === "member-search") { memberSearch = event.target.value; const start = event.target.selectionStart; renderPage(); const inputField = $("#member-search"); inputField.focus(); inputField.setSelectionRange(start, start); }
    if (event.target.id === "agent-member-search") {
      const text = event.target.value.toLowerCase();
      $("#assigned-members").innerHTML = state.members.filter((member) => member.agentId === selectedAgent && `${member.name} ${member.id}`.toLowerCase().includes(text)).slice(0, 8).map((member) => `<div class="product-row"><span class="member-initials">${esc(initials(member.name))}</span><span class="product-row-copy"><strong>${esc(member.name)}</strong><small>${esc(member.id)}</small></span><button class="text-button" data-action="member-detail" data-id="${esc(member.id)}">Open</button></div>`).join("");
    }
  }
  function updateFilter(event) {
    if (event.target.id === "collection-filter") { collectionFilter = event.target.value; renderPage(); }
    if (event.target.id === "report-filter") { reportFilter = event.target.value; renderPage(); }
    if (event.target.id === "agent-select") { selectedAgent = event.target.value; renderPage(); }
    if (event.target.matches("[data-member-agent]")) {
      const member = getMember(event.target.dataset.memberId);
      member.agentId = event.target.value;
      activity("Member collection agent changed", `${member.name} · ${getAgent(member.agentId).name}`);
      save(); renderPage(); toast(`${member.name} assigned to ${getAgent(member.agentId).name}.`);
    }
    if (event.target.id === "member-verification-filter") {
      const type = event.target.value;
      $$(".data-table tbody tr").forEach((row) => { row.hidden = type !== "All verification" && !row.textContent.includes(type); });
    }
  }
  function delegateDialogActions(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const idValue = button.dataset.id;
    switch (button.dataset.action) {
      case "rd-installment": openRDInstallment(idValue); break;
      case "request-rd-maturity": openRDMaturity(idValue); break;
      case "premature-rd": openRDClose(idValue); break;
      case "request-fd-maturity": openMaturityRequest(idValue); break;
      case "request-fd-interest": openFDAmountRequest(idValue, "interest_payout"); break;
      case "premature-fd": openFDAmountRequest(idValue, "premature-fd-request"); break;
      case "renew-fd": openRenewFD(idValue); break;
      case "export-account": exportAccount(idValue); break;
      case "loan-close": openLoanClosure(idValue); break;
    }
  }
  function handleGlobalDialogAction(event) {
    if (event.target.closest("#dialog-content [data-action]")) delegateDialogActions(event);
  }

  document.addEventListener("click", handleClick);
  document.addEventListener("click", handleGlobalDialogAction);
  document.addEventListener("submit", handleSubmit);
  document.addEventListener("input", updateSearch);
  document.addEventListener("change", updateFilter);
  window.addEventListener("storage", (event) => {
    if (event.key !== STORE_KEY || !event.newValue) return;
    try {
      const incoming = JSON.parse(event.newValue);
      if (incoming && Array.isArray(incoming.members) && Array.isArray(incoming.collections)) {
        if (isAgentPortal) {
          const updatedAgent = incoming.agents.find((agent) => agent.id === selectedAgent);
          if ((!updatedAgent?.active || !updatedAgent.locationSharing) && locationWatchId !== null) {
            navigator.geolocation?.clearWatch(locationWatchId);
            locationWatchId = null;
          }
        }
        state = incoming;
        state.members.forEach((member, index) => {
          if (!member.agentId && state.agents.length) member.agentId = state.agents[index % state.agents.length].id;
        });
        renderPage();
      }
    } catch (error) {
      console.warn("Shared demo update could not be read", error);
    }
  });
  $("#menu-toggle").addEventListener("click", () => $("#sidebar").classList.toggle("is-open"));
  $("#app-dialog").addEventListener("click", (event) => { if (event.target === $("#app-dialog")) closeDialog(); });

  // Wire less-common dialog actions without coupling them to navigation rendering.
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const itemId = button.dataset.id;
    if (button.dataset.action === "request-fd-maturity") openMaturityRequest(itemId);
    if (button.dataset.action === "request-fd-interest") openFDAmountRequest(itemId, "interest_payout");
    if (button.dataset.action === "premature-fd") openFDAmountRequest(itemId, "premature-fd-request");
    if (button.dataset.action === "renew-fd") openRenewFD(itemId);
    if (button.dataset.action === "request-rd-maturity") openRDMaturity(itemId);
    if (button.dataset.action === "premature-rd") openRDClose(itemId);
    if (button.dataset.action === "loan-close") openLoanClosure(itemId);
    if (button.dataset.action === "reverse-transaction") openReversal(button.dataset.reference);
    if (button.dataset.action === "rd-actions") openRDContextActions(itemId);
  });

  renderPage();
})();
