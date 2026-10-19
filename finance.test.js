const test = require("node:test");
const assert = require("node:assert/strict");
const finance = require("./finance.js");

const balanced = (minor, debit = "Cash", credit = "Member savings") => [
  { account: debit, debitMinor: minor, creditMinor: 0 },
  { account: credit, debitMinor: 0, creditMinor: minor }
];

test("money uses integer minor units with half-up rounding", () => {
  assert.equal(finance.toMinor(12.345), 1235);
  assert.equal(finance.fromMinor(1235), 12.35);
  assert.match(finance.money(1234500, "INR"), /₹12,345\.00/);
});

test("journal postings reject unbalanced entries", () => {
  assert.throws(() => finance.validateJournal([
    { account: "Cash", debitMinor: 1000, creditMinor: 0 },
    { account: "Savings", debitMinor: 0, creditMinor: 999 }
  ]), /not balanced/);
});

test("repeated transaction reference is idempotent", () => {
  const ledger = new finance.Ledger();
  const entry = { reference: "DEP-1", kind: "deposit", accountId: "SAV-1", amountMinor: 5000, entries: balanced(5000) };
  assert.equal(ledger.post(entry).duplicate, false);
  assert.equal(ledger.post(entry).duplicate, true);
  assert.equal(ledger.records.length, 1);
});

test("opening balance contributes to posted account balance", () => {
  const ledger = new finance.Ledger();
  ledger.post({ reference: "OPEN-1", kind: "opening_balance", accountId: "SAV-1", amountMinor: 25000, entries: balanced(25000) });
  assert.equal(ledger.accountBalance("SAV-1"), 25000);
});

test("verified savings collections add to the same account balance", () => {
  const ledger = new finance.Ledger();
  ledger.post({ reference: "RC-1", kind: "collection_savings", accountId: "SAV-1", amountMinor: 1250, entries: balanced(1250) });
  assert.equal(ledger.accountBalance("SAV-1"), 1250);
});

test("reversal is linked, balanced, and nets a deposit to zero", () => {
  const ledger = new finance.Ledger();
  ledger.post({ reference: "DEP-2", kind: "deposit", accountId: "SAV-1", amountMinor: 5000, entries: balanced(5000) });
  const reversal = ledger.reverse("DEP-2", "REV-2", "Entered against wrong member");
  assert.equal(reversal.record.reversalOf, "DEP-2");
  assert.equal(ledger.records[0].status, "posted");
  assert.equal(ledger.records[0].reversedBy, "REV-2");
  assert.equal(ledger.accountBalance("SAV-1"), 0);
  assert.throws(() => ledger.reverse("DEP-2", "REV-3", "Second reversal"), /already been reversed/);
});

test("reversal of a withdrawal restores its account balance", () => {
  const ledger = new finance.Ledger();
  ledger.post({ reference: "WDR-1", kind: "withdrawal", accountId: "SAV-1", amountMinor: 1000, entries: balanced(1000, "Member savings", "Cash") });
  ledger.reverse("WDR-1", "REV-W1", "Incorrect withdrawal");
  assert.equal(ledger.accountBalance("SAV-1"), 0);
});

test("partial loan payment allocates penalty, fee, interest, then principal", () => {
  assert.deepEqual(finance.allocateLoanPayment({
    amountMinor: 8000,
    principalOutstandingMinor: 10000,
    interestDueMinor: 2000,
    feeDueMinor: 500,
    penaltyDueMinor: 500
  }), { penaltyMinor: 500, feeMinor: 500, interestMinor: 2000, principalMinor: 5000, unappliedMinor: 0 });
});

test("reducing-balance schedule amortizes principal and records interest", () => {
  const schedule = finance.loanSchedule({ principalMinor: 120000, annualRate: 12, months: 12, method: "reducing", firstDueDate: "2026-01-01" });
  assert.equal(schedule.length, 12);
  assert.equal(schedule.reduce((sum, row) => sum + row.principalMinor, 0), 120000);
  assert.ok(schedule.reduce((sum, row) => sum + row.interestMinor, 0) > 0);
  assert.equal(schedule.at(-1).balanceMinor, 0);
});

test("FD and RD projections return principal and interest separately", () => {
  const fixed = finance.compoundProjection({ principalMinor: 100000, annualRate: 12, periodsPerYear: 12, years: 1 });
  assert.equal(fixed.maturityMinor, 112683);
  assert.equal(fixed.interestMinor, fixed.maturityMinor - 100000);
  const recurring = finance.recurringDepositProjection({ installmentMinor: 10000, annualRate: 12, installments: 12 });
  assert.equal(recurring.principalMinor, 120000);
  assert.ok(recurring.maturityMinor > recurring.principalMinor);
});
