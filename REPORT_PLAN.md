# Report Module — Sales & Grocery Implementation Plan

**Target file:** `src/views/apps/report/list/ReportList.tsx`
**Scope:** Sales Reports (fully functional) + Grocery Reports (new tab)
**Date:** 2026-06-12

---

## Current State

| File | Status |
|---|---|
| `report/index.tsx` | Complete — 6-tab container (Sales, Inventory, Order, Accounting, Restaurant, Promotion) |
| `report/SalesReports.tsx` | Partial — static stat cards, renders stub `<ReportList />` |
| `report/InventoryReports.tsx` | Partial — static stat cards only, no table |
| `report/OrderReports.tsx` | Stub |
| `report/AccountingReports.tsx` | Stub |
| `report/RestaurantReports.tsx` | Stub |
| `report/PromotionReports.tsx` | Stub |
| `report/list/ReportList.tsx` | **Stub** — returns plain text, needs full implementation |
| `report/list/StatCard.tsx` | Complete — reusable KPI card |
| `types/apps/reportTypes.ts` | Minimal — single generic `ReportTypeProps` |

---

## Task List

### Phase 1 — Types & Data Foundation

- [ ] **T1** — Expand `src/types/apps/reportTypes.ts`
  - Add `SalesReportRow` type: `{ id, date, orderId, customer, itemsCount, subtotal, tax, total, paymentMethod, status }`
  - Add `GroceryReportRow` type: `{ id, productName, category, unitsSold, revenue, stockLevel, stockStatus }`
  - Add `SalesStatus` union: `'completed' | 'pending' | 'refunded' | 'cancelled'`
  - Add `StockStatus` union: `'in-stock' | 'low-stock' | 'out-of-stock'`
  - Add `ReportFilterState` type for shared filter shape
  - Fix `StatCard` color prop — add `'info'` to the union (currently missing, but used in InventoryReports)

---

### Phase 2 — ReportList Table (Sales)

- [ ] **T2** — Implement `src/views/apps/report/list/ReportList.tsx` as full TanStack Table v8 component

  **Props:**
  ```ts
  interface ReportListProps {
    filterStatus?: SalesStatus | null   // from stat card click
    dateRange?: [Date | null, Date | null]
  }
  ```

  **Columns:**
  | Column | Notes |
  |---|---|
  | Date | Sortable, formatted `dd MMM yyyy` |
  | Order # | Sortable, monospace chip |
  | Customer | Sortable |
  | Items | Numeric, right-aligned |
  | Subtotal | Currency formatted |
  | Total | Currency formatted, bold |
  | Payment Method | Icon + label (Cash, Card, UPI, Online) |
  | Status | Chip — Completed (success), Pending (warning), Refunded (info), Cancelled (error) |
  | Actions | Icon button: View order |

  **Features:**
  - Global fuzzy search input
  - Status filter dropdown (All / Completed / Pending / Refunded / Cancelled)
  - Date range filter (react-datepicker, already installed)
  - Column sorting (click header)
  - Pagination (rows per page: 10 / 25 / 50)
  - Export CSV button (client-side, no library needed — build manually with Blob)
  - 20 rows of realistic mock data
  - Loading skeleton state (MUI Skeleton)
  - Empty state illustration when no rows match

  **Pattern to follow:** `src/views/apps/invoice/list/InvoiceListTable.tsx`

---

### Phase 3 — SalesReports Enhancements

- [ ] **T3** — Make SalesReports stat cards interactive
  - Add `selectedCard` state (`null | string`)
  - Pass `isSelected` and `onClick` properly to each StatCard
  - Clicking a card passes a `filterStatus` prop down to `<ReportList />`
  - Clicking the same card again deselects (toggles)

- [ ] **T4** — Add date range picker to SalesReports
  - Two `react-datepicker` inputs: Start Date, End Date
  - Pass `dateRange` prop to `<ReportList />`
  - "Clear" button resets range

- [ ] **T5** — Wire stat card totals to real data
  - Derive totals from mock data (count per status, sum totals)
  - StatCard values update when date range changes
  - Replace hardcoded numbers with computed values

---

### Phase 4 — Grocery Reports (New)

- [ ] **T6** — Create `src/views/apps/report/list/GroceryReportList.tsx`

  **Columns:**
  | Column | Notes |
  |---|---|
  | Product Name | Sortable, with product icon |
  | Category | Chip (Fruits, Vegetables, Dairy, Bakery, Beverages, Snacks) |
  | Units Sold | Numeric, sortable |
  | Revenue | Currency formatted, sortable |
  | Stock Level | Numeric |
  | Stock Status | Chip — In Stock (success), Low Stock (warning), Out of Stock (error) |
  | Actions | View product |

  **Features:**
  - Global search
  - Category filter dropdown
  - Stock status filter
  - Sorting + pagination
  - Export CSV
  - 20 rows of mock grocery data

- [ ] **T7** — Create `src/views/apps/report/GroceryReports.tsx`

  **Stat cards:**
  | Card | Icon | Color |
  |---|---|---|
  | Total Grocery Products | `tabler-shopping-bag` | primary |
  | Low Stock Items | `tabler-alert-triangle` | error |
  | Top Revenue Category | `tabler-crown` | warning |
  | Total Grocery Revenue | `tabler-currency-dollar` | success |

  - Interactive stat cards filter the table (by stock status or category)
  - Renders `<GroceryReportList />`

- [ ] **T8** — Add Grocery Reports tab to `src/views/apps/report/index.tsx`
  - Add Tab value `'8'` with label `Grocery Reports`
  - Add `<TabPanel value='8'><GroceryReports /></TabPanel>`
  - Import `GroceryReports`

---

### Phase 5 — Polish & Consistency

- [ ] **T9** — Fix `StatCard.tsx` color prop type
  - Add `'info'` to the union type (currently `'primary' | 'success' | 'warning' | 'error'`)
  - `InventoryReports` already passes `color: 'info'` — this causes a TypeScript error

- [ ] **T10** — Responsive layout audit
  - Verify stat card row wraps correctly on mobile (already using `flex-wrap`)
  - Table columns: hide lower-priority columns (Subtotal, Tax) below `md` breakpoint
  - Date picker inputs stack vertically on mobile

---

## File Map (after implementation)

```
src/views/apps/report/
├── index.tsx                          [update — add Grocery tab]
├── SalesReports.tsx                   [update — interactive cards, date range, derived totals]
├── InventoryReports.tsx               [no change]
├── OrderReports.tsx                   [no change — out of scope]
├── AccountingReports.tsx              [no change — out of scope]
├── RestaurantReports.tsx              [no change — out of scope]
├── PromotionReports.tsx               [no change — out of scope]
├── GroceryReports.tsx                 [NEW]
└── list/
    ├── ReportList.tsx                 [IMPLEMENT — sales table]
    ├── GroceryReportList.tsx          [NEW — grocery table]
    └── StatCard.tsx                   [minor fix — add info color]

src/types/apps/
└── reportTypes.ts                     [expand]
```

---

## Key Libraries in Use

| Library | Usage |
|---|---|
| `@tanstack/react-table` v8 | Table logic (sorting, filtering, pagination) |
| `@mui/material` v6 | UI components (Chip, Card, TextField, Select, Skeleton) |
| `react-datepicker` | Date range inputs |
| `date-fns` | Date formatting + comparison |
| Tailwind CSS | Responsive layout utilities |

---

## Notes

- All data is **mock** (hardcoded arrays) until API endpoints are provided. Structure data to be trivially swappable with `useSWR` or `RTK Query` fetches.
- Do **not** add a Redux slice — the report module is read-only display; local `useState` is sufficient.
- Follow the `InvoiceListTable.tsx` pattern exactly for table structure and styling.
- CSV export: use `Blob` + `URL.createObjectURL` — no extra library needed.
