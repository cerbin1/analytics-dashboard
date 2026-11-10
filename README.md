# Northstar Business Analytics Dashboard

A frontend-only business analytics dashboard built with React, TypeScript, and Vite. It uses fictional local JSON data to demonstrate revenue and sales analytics, customer activity, transaction management, charts, filtering, and CSV export.

## Features

- Overview, Revenue, Sales, Customers, and Transactions pages
- Shared date range selector with previous-period comparisons
- KPI cards and responsive revenue, sales, customer, category, and region charts
- Searchable, sortable, and paginated customer and transaction tables
- Customer and transaction detail routes
- Transaction filtering and CSV export of the filtered results
- English and Polish interface; English is the default and the selected language is saved in `localStorage`
- Light and dark themes; the selected theme is saved in `localStorage`
- Notification panel with locally persisted read state
- Responsive sidebar navigation for smaller screens

## Requirements

- Node.js compatible with the installed Vite version
- npm

## Getting started

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal. To create a production build or preview it locally:

```bash
npm run build
npm run preview
```

## Data

All application data is stored in `src/data/` as local JSON files:

- `customers.json`
- `transactions.json`
- `products.json`
- `categories.json`
- `regions.json`
- `traffic.json`
- `notifications.json`
- `metadata.json`

The dataset is fictional and requires no backend, database, authentication service, or external API. Dates use ISO `YYYY-MM-DD` values, and transaction amounts use integer cents. The fixture end date, currency, and business timezone are defined in `metadata.json`.

## Project structure

```text
src/
├── data/       # Local JSON fixtures
├── lib/        # Date, filtering, aggregation, and formatting logic
├── types.ts    # Shared TypeScript models
├── App.tsx     # Routes, shared application shell, and pages
├── main.tsx    # React entry point
└── styles.css  # Design tokens, components, themes, and responsive styles
```

## Notes

- The global date selector applies across routes. Custom ranges are limited to the fixture end date.
- Revenue includes completed transactions; pending, refunded, and failed transactions are excluded from revenue totals.
- Conversion rate is calculated from the local daily traffic and conversion fixture.
- Theme and language preferences, plus notification read state, are stored in browser `localStorage`.
