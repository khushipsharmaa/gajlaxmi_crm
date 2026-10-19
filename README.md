# Gajlaxmi Bank

A browser-only society-management demo with separate admin and collection-agent pages.

## Open

Open `index.html` for the admin panel or `agent.html` for the collection-agent portal. The agent page shares the demo data store in the same browser. From Members, use the export button to download a multi-sheet Excel-readable workbook of member-linked financial and operational records.

Demo changes are stored in browser local storage. Use **Demo workspace → Reset demo data** to restore illustrative seed records.

## Tests

Requires Node.js; no packages are needed.

```powershell
node --test --test-reporter spec .\finance.test.js
```

## Production boundary

All balances, rates, fees and policies are illustrative INR examples, not Gajlaxmi Bank policy. The browser demo does not process real payments, automatically send member messages, authenticate users or provide cross-device synchronization. Receipt sharing opens a device share/SMS composer and does not confirm delivery. Live location is opt-in and requires the agent's browser permission.

Production use requires a backend, server-side authentication and maker/approver access controls, durable transactional storage with atomic balanced postings, backups and audit retention, secure document/photo storage, validated real financial policies and tested cross-device synchronization. Browser role labels and local storage are not security controls.
