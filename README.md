# FiniFly Finance Dashboard — Full-stack starter

This project preserves the uploaded FiniFly dashboard UI and adds an Express API with a SQLite database.

## Requirements
- Node.js 22 LTS or newer
- VS Code
- Internet connection for the first `npm install` (dependencies and the existing CDN assets)

## Run on Windows / VS Code
1. Extract `FiniFly-Fullstack.zip` to a normal folder, for example `C:\Projects\FiniFly-Fullstack`.
2. Open VS Code → File → Open Folder → select `FiniFly-Fullstack`.
3. Open Terminal → New Terminal.
4. Confirm Node and npm are installed:
   ```powershell
   node -v
   npm -v
   ```
   If either command is not found, install Node.js LTS from https://nodejs.org/ and restart VS Code.
5. Install dependencies:
   ```powershell
   npm install
   ```
6. Start the website:
   ```powershell
   npm start
   ```
7. Open http://localhost:3000 in Chrome.

For development with automatic server restart:
```powershell
npm run dev
```

## Demo admin login
- Email: `admin@finifly.local`
- Password: `Admin@123`

The demo account is created automatically in the local SQLite database on first run. The database file is created at `data/finifly.db`. Keep this file safe: it contains the app's stored demo data.

## Implemented
- Admin sign-in and sign-out (click the sign-out icon in the top bar)
- Dashboard KPI values calculated from stored transactions and customers
- Revenue, segment and customer charts loaded from the API
- Transaction listing, search, create, edit, delete
- Customer creation and listing
- CSV transaction export
- Light/dark theme preference
- SQLite persistence between restarts

## Important notes
- This is an educational/demo finance dashboard. The seed data is fictional and all calculated financial metrics are illustrative.
- The app is not connected to a bank, payment gateway, brokerage, KYC provider or live market-data provider. It does not move money.
- Before public deployment, replace the demo credentials, set a long random `SESSION_SECRET`, use HTTPS, configure secure cookies and a production session store, add CSRF protection, stricter rate limiting, audit logging, backups, role-based access, input validation and privacy/security review.
- The current KPI formulas are simple illustrative calculations, not accounting definitions. Adapt them to your actual business rules.
