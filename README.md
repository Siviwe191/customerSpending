# Customer Spending Insights Dashboard

A React and TypeScript dashboard for spending summaries, categories, trends, transactions, goals, and the signed-in profile. When `VITE_API_URL` is not set, every screen uses the sample data in `src/mockData.ts`.

## Requirements

- Node.js 22
- npm

## Docker

The image builds the site, then serves `dist` with nginx. Dev dependencies are installed only in the build stage. The running container does not include `node_modules`.

```bash
docker build -t customerspending .
docker run -p 5001:80 customerspending
```

The number before the colon is the port on your machine. Pick any free port. The example above uses `5001`, so the app is at `http://localhost:5001`. The container itself always listens on port 80.

To bake in an API URL:

```bash
docker build --build-arg VITE_API_URL=http://localhost:3000 -t customerspending .
```

## Tests

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

`npm test` runs the unit and integration tests. End-to-end tests use Playwright and start the app on port 4173. Install the browser once if it is missing:

```bash
npx playwright install chromium
```

## App sections

The shell is a sidebar, a header, and one main page. The header search jumps to a dashboard section or to My Profile. The account menu also opens My Profile.

### Dashboard

| Section                 | What it shows                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spending summary        | Total spent, transaction count, average transaction, and top category. Date presets are Today, 7 days, 30 days, 90 days, and 1 year. Each card opens the related section. |
| Spending by category    | Every category, including ones with no spend, with its color and icon. Includes From and To dates.                                                                        |
| Monthly spending trends | Spending for the recent months.                                                                                                                                           |
| Transactions            | Filterable list with category chips and a date range. On a narrow screen the tabs and category chips become dropdowns.                                                    |
| Spending goals          | Monthly budgets with On track, Warning, and Over budget.                                                                                                                  |

### My Profile

Shows name, email, join date, account type, total spent, and currency. The same profile supplies the name and email in the sidebar footer.

### Search

The header search matches dashboard sections and the signed-in account. Arrow keys move through the results. Enter or a click opens the match. Escape closes the list.

## API

Requests go to `${VITE_API_URL}/api`. The customer id defaults to `1`. If an access token is set, requests send `Authorization: Bearer <token>`.

| Function                  | Path                                   |
| ------------------------- | -------------------------------------- |
| `fetchSpendingSummary`    | `/customers/:id/spending/summary`      |
| `fetchSpendingByCategory` | `/customers/:id/spending/categories`   |
| `fetchSpendingTrends`     | `/customers/:id/spending/trends`       |
| `fetchTransactions`       | `/customers/:id/spending/transactions` |
| `fetchSpendingGoals`      | `/customers/:id/spending/goals`        |
| `fetchCategoryFilter`     | `/customers/:id/filters`               |
| `fetchME`                 | `/customers/:id/profile`               |

The access token is kept in memory by `AuthProvider` and is not stored in the browser. Components read it with `useAuth()`:

```tsx
const { accessToken, setAccessToken, clearAccessToken } = useAuth();
```

`setAccessToken` updates the context and the API client together. `clearAccessToken` removes it. The token is gone when the page is closed.

## Project layout

```text
src/
  App.tsx                 Page switching between the dashboard and profile
  main.tsx                App entry, wrapped in AuthProvider
  mockData.ts             Sample data used when the API URL is not set
  context/AuthContext.tsx In-memory access token
  components/             Shared date filter and change arrows
  features/dashboard/     Dashboard sections and their API calls
  hooks/                  Profile loading shared by the page and sidebar
  layouts/                Sidebar, header, search, and logo
  pages/                  Dashboard and My Profile
  services/api.ts         Base request client and profile/summary calls
  utils/                  Icons and global search
tests/
  unit/                   Helpers, API paths, and small components
  integration/            Dashboard, profile, and search flows
  e2e/                    The same flows in Chromium
```
