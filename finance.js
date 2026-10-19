(function (root) {
  const toMinor = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) throw new TypeError("Amount must be a finite number");
    return Math.round((amount + Number.EPSILON) * 100);
  };

  const fromMinor = (minor) => minor / 100;

  const money = (minor, currency = "INR") => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(fromMinor(minor));

  function validateJournal(entries) {
    if (!Array.isArray(entries) || entries.length < 2) throw new Error("A posting needs at least two journal lines");
    const debit = entries.reduce((sum, line) => sum + (line.debitMinor || 0), 0);
    const credit = entries.reduce((sum, line) => sum + (line.creditMinor || 0), 0);
    if (entries.some((line) => (line.debitMinor || 0) < 0 || (line.creditMinor || 0) < 0)) {
      throw new Error("Journal amounts cannot be negative");
    }
    if (debit !== credit || debit <= 0) throw new Error("Journal is not balanced");
    return true;
  }

  class Ledger {
    constructor(records = []) {
      this.records = records;
      this.references = new Set(records.map((record) => record.reference));
    }

    post({ reference, kind, memberId = null, accountId = null, amountMinor, entries, metadata = {} }) {
      if (!reference) throw new Error("A unique transaction reference is required");
      if (this.references.has(reference)) return { duplicate: true, record: this.records.find((item) => item.reference === reference) };
      validateJournal(entries);
      if (amountMinor <= 0) throw new Error("Amount must be greater than zero");
      const record = {
        id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        reference,
        kind,
        memberId,
        accountId,
        amountMinor,
        entries: entries.map((entry) => ({ ...entry })),
        metadata: { ...metadata },
        status: "posted",
        createdAt: new Date().toISOString(),
        reversalOf: null
      };
      this.records.push(record);
      this.references.add(reference);
      return { duplicate: false, record };
    }

    reverse(reference, reversalReference, reason) {
      const original = this.records.find((record) => record.reference === reference && record.status === "posted");
      if (!original) throw new Error("Posted transaction not found");
      if (original.reversedBy) throw new Error("Transaction has already been reversed");
      if (!reason?.trim()) throw new Error("An audit reason is required");
      if (this.references.has(reversalReference)) return { duplicate: true, record: this.records.find((item) => item.reference === reversalReference) };
      const entries = original.entries.map((line) => ({
        account: line.account,
        debitMinor: line.creditMinor || 0,
        creditMinor: line.debitMinor || 0
      }));
      const result = this.post({
        reference: reversalReference,
        kind: "reversal",
        memberId: original.memberId,
        accountId: original.accountId,
        amountMinor: original.amountMinor,
        entries,
        metadata: { reversalOf: original.reference, reason: reason.trim() }
      });
      original.reversedBy = reversalReference;
      result.record.reversalOf = original.reference;
      return result;
    }

    accountBalance(accountId) {
      return this.records.reduce((balance, record) => {
        if (record.status !== "posted" || record.accountId !== accountId) return balance;
        const inflows = ["opening_balance", "deposit", "collection_savings", "loan_disbursement", "rd_deposit", "fd_booking"];
        if (record.kind === "reversal") {
          const original = this.records.find((item) => item.reference === record.reversalOf);
          const originalDelta = original && inflows.includes(original.kind) ? record.amountMinor : -record.amountMinor;
          return balance - originalDelta;
        }
        return balance + (inflows.includes(record.kind) ? record.amountMinor : -record.amountMinor);
      }, 0);
    }
  }

  function loanSchedule({ principalMinor, annualRate, months, method = "reducing", frequency = "monthly", firstDueDate = new Date() }) {
    if (!Number.isInteger(principalMinor) || principalMinor <= 0 || !Number.isInteger(months) || months < 1) {
      throw new Error("Principal and tenure must be positive");
    }
    const periodsPerYear = frequency === "weekly" ? 52 : frequency === "fortnightly" ? 26 : 12;
    const periodRate = annualRate / 100 / periodsPerYear;
    const periods = Math.max(1, Math.round(months * periodsPerYear / 12));
    let balance = principalMinor;
    const flatInterestPerPeriod = Math.round(principalMinor * periodRate);
    const regularPayment = method === "flat"
      ? Math.ceil((principalMinor + flatInterestPerPeriod * periods) / periods)
      : periodRate === 0
        ? Math.ceil(principalMinor / periods)
        : Math.ceil(principalMinor * periodRate / (1 - Math.pow(1 + periodRate, -periods)));
    const due = new Date(firstDueDate);
    const schedule = [];

    for (let index = 1; index <= periods; index += 1) {
      const interestMinor = method === "flat" ? flatInterestPerPeriod : Math.round(balance * periodRate);
      const principalDue = index === periods ? balance : Math.min(balance, regularPayment - interestMinor);
      const paymentMinor = principalDue + interestMinor;
      balance = Math.max(0, balance - principalDue);
      due.setMonth(due.getMonth() + (frequency === "monthly" ? 1 : frequency === "weekly" ? 0 : 0));
      if (frequency === "weekly") due.setDate(due.getDate() + 7);
      if (frequency === "fortnightly") due.setDate(due.getDate() + 14);
      schedule.push({ installment: index, dueDate: due.toISOString().slice(0, 10), principalMinor: principalDue, interestMinor, paymentMinor, balanceMinor: balance });
    }
    return schedule;
  }

  function allocateLoanPayment({ amountMinor, principalOutstandingMinor, interestDueMinor, feeDueMinor = 0, penaltyDueMinor = 0 }) {
    if (amountMinor <= 0) throw new Error("Payment must be greater than zero");
    let remaining = amountMinor;
    const penaltyMinor = Math.min(remaining, penaltyDueMinor);
    remaining -= penaltyMinor;
    const feeMinor = Math.min(remaining, feeDueMinor);
    remaining -= feeMinor;
    const interestMinor = Math.min(remaining, interestDueMinor);
    remaining -= interestMinor;
    const principalMinor = Math.min(remaining, principalOutstandingMinor);
    remaining -= principalMinor;
    return { penaltyMinor, feeMinor, interestMinor, principalMinor, unappliedMinor: remaining };
  }

  function compoundProjection({ principalMinor, annualRate, periodsPerYear = 12, years }) {
    if (principalMinor < 0 || annualRate < 0 || periodsPerYear < 1 || years < 0) throw new Error("Projection inputs are outside valid ranges");
    const periods = Math.round(periodsPerYear * years);
    const rate = annualRate / 100 / periodsPerYear;
    const maturityMinor = Math.round(principalMinor * Math.pow(1 + rate, periods));
    return { maturityMinor, interestMinor: maturityMinor - principalMinor, periods, formula: "P x (1 + r/n)^(n x t)" };
  }

  function recurringDepositProjection({ installmentMinor, annualRate, installments, periodsPerYear = 12 }) {
    if (installmentMinor <= 0 || installments < 1) throw new Error("Installment and tenure must be positive");
    const rate = annualRate / 100 / periodsPerYear;
    let valueMinor = 0;
    for (let period = 0; period < installments; period += 1) valueMinor = Math.round((valueMinor + installmentMinor) * (1 + rate));
    return {
      principalMinor: installmentMinor * installments,
      maturityMinor: valueMinor,
      interestMinor: valueMinor - installmentMinor * installments,
      formula: "Each installment compounds from its assumed deposit date"
    };
  }

  const api = { toMinor, fromMinor, money, validateJournal, Ledger, loanSchedule, allocateLoanPayment, compoundProjection, recurringDepositProjection };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.SocietyFinance = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
