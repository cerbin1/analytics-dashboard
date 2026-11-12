import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  Globe2,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Search,
  Settings,
  Sun,
  Users,
  X,
} from "lucide-react";
import notificationsJson from "./data/notifications.json";
import metadata from "./data/metadata.json";
import type { Period, Transaction } from "./types";
import { FIXTURE_END, getPeriod, inPeriod, revenue } from "./lib/analytics";
import {
  categories,
  customers,
  products,
  regions,
  summarizePeriod as calculateTotals,
  transactions,
  transactionsForPeriod as filteredTransactions,
  getRevenueBuckets,
  getCategoryTotals,
  getRegionTotals,
  getCustomerGrowth,
} from "./lib/data";

type Lang = "en" | "pl";
type Theme = "light" | "dark";
const words: Record<Lang, Record<string, string>> = {
  en: {
    overview: "Overview",
    revenue: "Revenue",
    sales: "Sales",
    customers: "Customers",
    transactions: "Transactions",
    settings: "Settings",
    workspace: "Workspace",
    workspaceName: "Northstar Studio",
    goodMorning: "Good morning",
    overviewSub: "Here’s what’s happening with your business.",
    revenueSub: "Track revenue trends and understand what drives growth.",
    salesSub: "Understand your order volume and sales performance.",
    customersSub: "Learn who your customers are and how they engage.",
    transactionsSub: "Review and manage your payment activity.",
    totalRevenue: "Total revenue",
    totalOrders: "Total orders",
    totalCustomers: "Total customers",
    conversion: "Conversion rate",
    avgTransaction: "Avg. transaction",
    growth: "Revenue growth",
    completed: "Completed",
    cancelled: "Cancelled",
    newCustomers: "New customers",
    returning: "Returning",
    revenueTime: "Revenue over time",
    categoryRevenue: "Revenue by category",
    salesPerformance: "Sales performance",
    regionRevenue: "Revenue by region",
    salesTrend: "Orders over time",
    topProducts: "Top performing products",
    recentTransactions: "Recent transactions",
    viewAll: "View all",
    compare: "vs. previous period",
    last7: "Last 7 days",
    last30: "Last 30 days",
    last90: "Last 90 days",
    last12: "Last 12 months",
    custom: "Custom range",
    from: "From",
    to: "To",
    search: "Search…",
    allCategories: "All categories",
    allStatuses: "All statuses",
    allRegions: "All regions",
    amount: "Amount",
    date: "Date",
    customer: "Customer",
    product: "Product",
    category: "Category",
    region: "Region",
    status: "Status",
    payment: "Payment",
    card: "Card",
    bank_transfer: "Bank transfer",
    cash: "Cash",
    wallet: "Wallet",
    description: "Description",
    actions: "Actions",
    exportCsv: "Export CSV",
    noResults: "No results found",
    page: "Page",
    of: "of",
    showing: "Showing",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    markRead: "Mark as read",
    unread: "unread",
    language: "Language",
    light: "Light",
    dark: "Dark",
    appearance: "Appearance",
    preferences: "Preferences",
    profile: "Workspace admin",
    viewDetails: "View details",
    customerDetails: "Customer details",
    transactionDetails: "Transaction details",
    registration: "Registered",
    lifetimeRevenue: "Lifetime revenue",
    transactionCount: "Transactions",
    recentActivity: "Recent activity",
    segment: "Segment",
    email: "Email",
    company: "Company",
    all: "All",
    vip: "VIP",
    failed: "Failed",
    pending: "Pending",
    refunded: "Refunded",
    completedStatus: "Completed",
    filters: "Filters",
    clear: "Clear filters",
    menu: "Open navigation",
    target: "Monthly target reached",
    newTransaction: "New transaction recorded",
    refundNotice: "Refund processed",
    insight: "Revenue is trending up",
    notificationTarget: "Revenue is 104% of your monthly target.",
    notificationTransaction: "A new payment was completed.",
    notificationRefund: "A recent order was refunded.",
    notificationInsight: "Revenue increased compared with the previous period.",
    settingsSub: "Manage the preferences for your demo workspace.",
    previous: "Previous",
    next: "Next",
    ordersByStatus: "Orders by status",
    conversionTip: "Converted sessions ÷ total sessions",
    analytics: "Analytics",
    noData: "No activity in this date range",
    orders: "orders",
    customerList: "Customer list",
    transactionList: "Transaction list",
    currentPeriod: "Current period",
    range: "Date range",
    searchCustomers: "Search customers…",
    searchTransactions: "Search transactions…",
    amountMin: "Min amount",
    amountMax: "Max amount",
    amountValue: "Amount range",
    monthlyRevenue: "Monthly revenue",
    customerGrowth: "Customer growth",
    segments: "Customer segments",
    geographic: "Customers by region",
    new: "New",
    returningSegment: "Returning",
    yourBusiness: "Your business at a glance",
    english: "English",
    polish: "Polski",
    open: "Open",
    productSales: "Product sales",
  },
  pl: {
    overview: "Przegląd",
    revenue: "Przychody",
    sales: "Sprzedaż",
    customers: "Klienci",
    transactions: "Transakcje",
    settings: "Ustawienia",
    workspace: "Obszar roboczy",
    workspaceName: "Northstar Studio",
    goodMorning: "Dzień dobry",
    overviewSub: "Sprawdź, co dzieje się w Twojej firmie.",
    revenueSub: "Śledź trendy przychodów i poznaj źródła wzrostu.",
    salesSub: "Analizuj liczbę zamówień i wyniki sprzedaży.",
    customersSub: "Poznaj swoich klientów i ich aktywność.",
    transactionsSub: "Przeglądaj i zarządzaj płatnościami.",
    totalRevenue: "Przychód ogółem",
    totalOrders: "Liczba zamówień",
    totalCustomers: "Liczba klientów",
    conversion: "Współczynnik konwersji",
    avgTransaction: "Śr. wartość transakcji",
    growth: "Wzrost przychodów",
    completed: "Zakończone",
    cancelled: "Anulowane",
    newCustomers: "Nowi klienci",
    returning: "Powracający",
    revenueTime: "Przychody w czasie",
    categoryRevenue: "Przychody wg kategorii",
    salesPerformance: "Wyniki sprzedaży",
    regionRevenue: "Przychody wg regionu",
    salesTrend: "Zamówienia w czasie",
    topProducts: "Najlepsze produkty",
    recentTransactions: "Ostatnie transakcje",
    viewAll: "Zobacz wszystkie",
    compare: "vs. poprzedni okres",
    last7: "Ostatnie 7 dni",
    last30: "Ostatnie 30 dni",
    last90: "Ostatnie 90 dni",
    last12: "Ostatnie 12 miesięcy",
    custom: "Własny zakres",
    from: "Od",
    to: "Do",
    search: "Szukaj…",
    allCategories: "Wszystkie kategorie",
    allStatuses: "Wszystkie statusy",
    allRegions: "Wszystkie regiony",
    amount: "Kwota",
    date: "Data",
    customer: "Klient",
    product: "Produkt",
    category: "Kategoria",
    region: "Region",
    status: "Status",
    payment: "Płatność",
    card: "Karta",
    bank_transfer: "Przelew bankowy",
    cash: "Gotówka",
    wallet: "Portfel",
    description: "Opis",
    actions: "Akcje",
    exportCsv: "Eksport CSV",
    noResults: "Brak wyników",
    page: "Strona",
    of: "z",
    showing: "Wyświetlanie",
    notifications: "Powiadomienia",
    markAllRead: "Oznacz wszystkie jako przeczytane",
    markRead: "Oznacz jako przeczytane",
    unread: "nieprzeczytane",
    language: "Język",
    light: "Jasny",
    dark: "Ciemny",
    appearance: "Wygląd",
    preferences: "Preferencje",
    profile: "Administrator",
    viewDetails: "Szczegóły",
    customerDetails: "Dane klienta",
    transactionDetails: "Dane transakcji",
    registration: "Rejestracja",
    lifetimeRevenue: "Przychód łączny",
    transactionCount: "Transakcje",
    recentActivity: "Ostatnia aktywność",
    segment: "Segment",
    email: "E-mail",
    company: "Firma",
    all: "Wszystkie",
    vip: "VIP",
    failed: "Nieudane",
    pending: "Oczekujące",
    refunded: "Zwrócone",
    completedStatus: "Zakończone",
    filters: "Filtry",
    clear: "Wyczyść filtry",
    menu: "Otwórz nawigację",
    target: "Cel miesięczny osiągnięty",
    newTransaction: "Zarejestrowano transakcję",
    refundNotice: "Przetworzono zwrot",
    insight: "Przychody rosną",
    notificationTarget: "Przychody wynoszą 104% celu miesięcznego.",
    notificationTransaction: "Zrealizowano nową płatność.",
    notificationRefund: "Ostatnie zamówienie zostało zwrócone.",
    notificationInsight: "Przychody wzrosły względem poprzedniego okresu.",
    settingsSub: "Zarządzaj ustawieniami wersji demonstracyjnej.",
    previous: "Poprzednia",
    next: "Następna",
    ordersByStatus: "Zamówienia wg statusu",
    conversionTip: "Konwersje ÷ łączna liczba sesji",
    analytics: "Analityka",
    noData: "Brak aktywności w tym zakresie dat",
    orders: "zamówień",
    customerList: "Lista klientów",
    transactionList: "Lista transakcji",
    currentPeriod: "Bieżący okres",
    range: "Zakres dat",
    searchCustomers: "Szukaj klientów…",
    searchTransactions: "Szukaj transakcji…",
    amountMin: "Min. kwota",
    amountMax: "Maks. kwota",
    amountValue: "Zakres kwot",
    monthlyRevenue: "Przychody miesięczne",
    customerGrowth: "Wzrost liczby klientów",
    segments: "Segmenty klientów",
    geographic: "Klienci wg regionu",
    new: "Nowy",
    returningSegment: "Powracający",
    yourBusiness: "Najważniejsze informacje o firmie",
    english: "English",
    polish: "Polski",
    open: "Otwórz",
    productSales: "Sprzedaż produktów",
  },
};
const fmtDate = (
  v: string,
  lang: Lang,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) =>
  new Intl.DateTimeFormat(lang === "pl" ? "pl-PL" : "en-US", opts).format(
    new Date(`${v}T12:00:00`),
  );
const fmtMoney = (cents: number, lang: Lang) =>
  new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US", {
    style: "currency",
    currency: metadata.currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
function Metric({
  title,
  value,
  change,
  icon: Icon,
  lang,
}: {
  title: string;
  value: string;
  change: number | null;
  icon: typeof Activity;
  lang: Lang;
}) {
  return (
    <article className="metric">
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">
          <Icon size={17} />
        </span>
      </div>
      <strong>{value}</strong>
      <div
        className={`metric-change ${change === null ? "neutral" : change >= 0 ? "up" : "down"}`}
      >
        {change === null ? (
          <span>—</span>
        ) : change >= 0 ? (
          <ArrowUpRight size={14} />
        ) : (
          <ArrowDownRight size={14} />
        )}
        <b>
          {change === null
            ? lang === "pl"
              ? "Nowe"
              : "New"
            : `${Math.abs(change).toFixed(1)}%`}
        </b>
        <span>{words[lang].compare}</span>
      </div>
    </article>
  );
}
function ChartPanel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function DataTable<T>({
  data,
  columns,
  pageSize = 8,
  searchPlaceholder,
}: {
  data: T[];
  columns: ColumnDef<T, any>[];
  pageSize?: number;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });
  return (
    <>
      {searchPlaceholder && (
        <div className="table-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                table.setPageIndex(0);
              }}
            />
          </label>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map((g) => (
              <tr key={g.id}>
                {g.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={
                      h.column.getCanSort()
                        ? h.column.getToggleSortingHandler()
                        : undefined
                    }
                    className={h.column.getCanSort() ? "sortable" : ""}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc"
                      ? " ↑"
                      : h.column.getIsSorted() === "desc"
                        ? " ↓"
                        : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((r) => (
                <tr key={r.id}>
                  {r.getVisibleCells().map((c) => (
                    <td key={c.id}>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="empty-cell" colSpan={columns.length}>
                  {
                    words[
                      localStorage.getItem("language") === "pl" ? "pl" : "en"
                    ].noResults
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          {
            words[localStorage.getItem("language") === "pl" ? "pl" : "en"]
              .showing
          }{" "}
          {table.getRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length}
        </span>
        <div className="pagination">
          <button
            className="icon-button small"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            {
              words[localStorage.getItem("language") === "pl" ? "pl" : "en"]
                .page
            }{" "}
            {table.getState().pagination.pageIndex + 1}{" "}
            {words[localStorage.getItem("language") === "pl" ? "pl" : "en"].of}{" "}
            {Math.max(table.getPageCount(), 1)}
          </span>
          <button
            className="icon-button small"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
type Props = {
  lang: Lang;
  t: (key: string) => string;
  theme: Theme;
  setTheme: (v: Theme) => void;
  period: Period;
  setPeriod: (p: Period) => void;
  unread: number;
  markRead: (id: string) => void;
  markAll: () => void;
};
function Layout({
  lang,
  t,
  theme,
  setTheme,
  period,
  setPeriod,
  unread,
  markRead,
  markAll,
}: Props) {
  const [mobile, setMobile] = useState(false),
    [notice, setNotice] = useState(false),
    [profile, setProfile] = useState(false),
    [workspaceOpen, setWorkspaceOpen] = useState(false);
  const nav = [
    ["/", t("overview"), LayoutDashboard],
    ["/revenue", t("revenue"), CircleDollarSign],
    ["/sales", t("sales"), Activity],
    ["/customers", t("customers"), Users],
    ["/transactions", t("transactions"), CreditCard],
  ] as const;
  const periods = [
    ["7d", t("last7")],
    ["30d", t("last30")],
    ["90d", t("last90")],
    ["12m", t("last12")],
    ["custom", t("custom")],
  ];
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Activity size={19} />
          </div>
          <span>northstar</span>
        </div>
        <button
          className="workspace"
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
        >
          <div className="workspace-avatar">N</div>
          <div>
            <small>{t("workspace")}</small>
            <strong>{t("workspaceName")}</strong>
          </div>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">{t("analytics").toUpperCase()}</div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
              {path === "/" && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <NavLink
            to="/settings"
            onClick={() => setMobile(false)}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <Settings size={17} />
            <span>{t("settings")}</span>
          </NavLink>
          <button className="profile-row" onClick={() => setProfile(!profile)}>
            <div className="user-avatar">JD</div>
            <div>
              <strong>Jordan Davis</strong>
              <small>{t("profile")}</small>
            </div>
            <MoreHorizontal size={18} />
          </button>
          {profile && (
            <div className="profile-pop">
              Jordan Davis
              <br />
              <span>{t("workspaceName")}</span>
              <Link to="/settings" onClick={() => setProfile(false)}>
                {t("settings")}
              </Link>
            </div>
          )}
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-scrim"
          onClick={() => setMobile(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main-area">
        <header className="topbar">
          <div className="top-title">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(true)}
              aria-label={t("menu")}
            >
              <Menu size={19} />
            </button>
            <span className="breadcrumb-muted">Northstar</span>
            <span className="crumb-slash">/</span>
            <PageTitle t={t} />
          </div>
          <div className="top-actions">
            <div className="range-control">
              <CalendarDays size={15} />
              <select
                value={period.preset}
                onChange={(e) =>
                  setPeriod(
                    e.target.value === "custom"
                      ? { ...period, preset: "custom" }
                      : getPeriod(e.target.value),
                  )
                }
                aria-label={t("range")}
              >
                {periods.map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              {period.preset === "custom" && (
                <div className="custom-dates">
                  <label>
                    {t("from")}
                    <input
                      type="date"
                      value={period.start}
                      max={period.end}
                      onChange={(e) =>
                        setPeriod({ ...period, start: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    {t("to")}
                    <input
                      type="date"
                      value={period.end}
                      min={period.start}
                      max={FIXTURE_END}
                      onChange={(e) =>
                        setPeriod({ ...period, end: e.target.value })
                      }
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className={`icon-button ${notice ? "selected" : ""}`}
                onClick={() => setNotice(!notice)}
                aria-label={t("notifications")}
              >
                <Bell size={18} />
                {unread > 0 && <i className="notification-dot" />}
              </button>
              {notice && (
                <div className="notification-pop">
                  <div className="pop-head">
                    <strong>{t("notifications")}</strong>
                    <button onClick={markAll}>{t("markAllRead")}</button>
                  </div>
                  {notificationsJson.map((n: any) => (
                    <button
                      key={n.id}
                      className={`notice-item ${localStorage.getItem(`read-${n.id}`) ? "read" : ""}`}
                      onClick={() => markRead(n.id)}
                    >
                      <i className={`notice-icon ${n.type}`}>
                        {n.type === "success" ? (
                          <Check size={14} />
                        ) : n.type === "transaction" ? (
                          <CreditCard size={14} />
                        ) : n.type === "warning" ? (
                          <Activity size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}
                      </i>
                      <span>
                        <b>
                          {t(
                            n.type === "success"
                              ? "target"
                              : n.type === "transaction"
                                ? "newTransaction"
                                : n.type === "warning"
                                  ? "refundNotice"
                                  : "insight",
                          )}
                        </b>
                        <small>
                          {t(
                            n.type === "success"
                              ? "notificationTarget"
                              : n.type === "transaction"
                                ? "notificationTransaction"
                                : n.type === "warning"
                                  ? "notificationRefund"
                                  : "notificationInsight",
                          )}
                        </small>
                      </span>
                      {!localStorage.getItem(`read-${n.id}`) && (
                        <i className="unread-dot" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <select
              className="language-select"
              value={lang}
              onChange={(e) => {
                localStorage.setItem("language", e.target.value);
                window.dispatchEvent(new Event("languagechange"));
              }}
              aria-label={t("language")}
            >
              <option value="en">EN</option>
              <option value="pl">PL</option>
            </select>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={t(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              className="top-user"
              onClick={() => {
                setProfile(true);
                setMobile(window.matchMedia("(max-width: 760px)").matches);
              }}
              aria-label={t("profile")}
            >
              JD
            </button>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
function PageTitle({ t }: { t: (s: string) => string }) {
  const { pathname } = useLocation();
  const part = pathname.split("/")[1];
  return (
    <strong>
      {t(
        part === "customers"
          ? "customers"
          : part === "transactions"
            ? "transactions"
            : part === "revenue"
              ? "revenue"
              : part === "sales"
                ? "sales"
                : part === "settings"
                  ? "settings"
                  : "overview",
      )}
    </strong>
  );
}
function App() {
  const [lang, setLang] = useState<Lang>(() =>
      localStorage.getItem("language") === "pl" ? "pl" : "en",
    ),
    [theme, setTheme] = useState<Theme>(() =>
      localStorage.getItem("theme") === "dark" ? "dark" : "light",
    ),
    [preset, setPreset] = useState("30d"),
    [custom, setCustom] = useState<Period>(() => getPeriod("30d")),
    [refresh, setRefresh] = useState(0),
    [toast, setToast] = useState("");
  const t = (key: string) => words[lang][key] || key;
  useEffect(() => {
    const f = () =>
      setLang(localStorage.getItem("language") === "pl" ? "pl" : "en");
    window.addEventListener("languagechange", f);
    return () => window.removeEventListener("languagechange", f);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
    document.documentElement.lang = lang;
  }, [theme, lang]);
  const markRead = (id: string) => {
      localStorage.setItem(`read-${id}`, "1");
      setRefresh(refresh + 1);
    },
    markAll = () => {
      notificationsJson.forEach((n: any) =>
        localStorage.setItem(`read-${n.id}`, "1"),
      );
      setRefresh(refresh + 1);
    };
  const unread = notificationsJson.filter(
    (n: any) => !localStorage.getItem(`read-${n.id}`),
  ).length;
  const period = preset === "custom" ? custom : getPeriod(preset);
  const setPeriod = (p: Period) => {
    setPreset(p.preset);
    setCustom(p);
  };
  return (
    <div className="app-root">
      <Routes>
        <Route
          element={
            <Layout
              lang={lang}
              t={t}
              theme={theme}
              setTheme={setTheme}
              period={period}
              setPeriod={setPeriod}
              unread={unread}
              markRead={markRead}
              markAll={markAll}
            />
          }
        >
          <Route
            index
            element={<Overview t={t} lang={lang} period={period} />}
          />
          <Route
            path="revenue"
            element={<RevenuePage t={t} lang={lang} period={period} />}
          />
          <Route
            path="sales"
            element={<SalesPage t={t} lang={lang} period={period} />}
          />
          <Route
            path="customers"
            element={<CustomersPage t={t} lang={lang} period={period} />}
          />
          <Route
            path="customers/:id"
            element={<CustomerDetail t={t} lang={lang} period={period} />}
          />
          <Route
            path="transactions"
            element={
              <TransactionsPage
                t={t}
                lang={lang}
                period={period}
                toast={setToast}
              />
            }
          />
          <Route
            path="transactions/:id"
            element={<TransactionDetail t={t} lang={lang} period={period} />}
          />
          <Route
            path="settings"
            element={
              <SettingsPage
                t={t}
                lang={lang}
                theme={theme}
                setTheme={setTheme}
                period={period}
              />
            }
          />
          <Route
            path="*"
            element={<Overview t={t} lang={lang} period={period} />}
          />
        </Route>
      </Routes>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function PageIntro({
  title,
  subtitle,
  period,
  lang,
  t,
}: {
  title: string;
  subtitle: string;
  period: Period;
  lang: Lang;
  t: (k: string) => string;
}) {
  return (
    <div className="page-intro">
      <div>
        <div className="eyebrow">
          <span className="live-dot" />
          {t("currentPeriod")} · {fmtDate(period.start, lang)} —{" "}
          {fmtDate(period.end, lang, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}
const revenueSeries = (period: Period, lang: Lang) =>
  getRevenueBuckets(period).map((x) => ({
    ...x,
    label: fmtDate(
      x.key.length === 7 ? `${x.key}-01` : x.key,
      lang,
      x.key.length === 7
        ? { month: "short", year: "2-digit" }
        : { month: "short", day: "numeric" },
    ),
  }));
const categorySeries = (period: Period, lang: Lang) =>
  getCategoryTotals(period).map((x) => ({
    ...x,
    name:
      lang === "pl"
        ? (
            {
              Software: "Oprogramowanie",
              Consulting: "Konsulting",
              Hardware: "Sprzęt",
              Training: "Szkolenia",
              Support: "Wsparcie",
            } as Record<string, string>
          )[x.name]
        : x.name,
  }));
const regionSeries = (period: Period) => getRegionTotals(period);
const customerGrowthSeries = (period: Period, lang: Lang) =>
  getCustomerGrowth(period).map((x) => ({
    ...x,
    label: fmtDate(
      x.monthly ? `${x.key}-01` : x.key,
      lang,
      x.monthly
        ? { month: "short", year: "2-digit" }
        : { month: "short", day: "numeric" },
    ),
  }));
function ChartTooltip({
  active,
  payload,
  label,
  lang,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  lang: Lang;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((p, i) => (
        <div key={i}>
          <i style={{ background: p.color || p.fill }} />
          {p.name === "revenue"
            ? fmtMoney(p.value * 100, lang)
            : new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US").format(
                p.value,
              )}
        </div>
      ))}
    </div>
  );
}
function Overview({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const totals = calculateTotals(period),
    series = revenueSeries(period, lang),
    cats = categorySeries(period, lang),
    productMap = new Map<string, number>();
  totals.cur
    .filter((x) => x.status === "completed")
    .forEach((x) =>
      productMap.set(
        x.productId,
        (productMap.get(x.productId) || 0) + x.amountCents,
      ),
    );
  const top = [...productMap].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const cols: ColumnDef<Transaction, any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info) => (
        <span className="mono">{String(info.getValue()).toUpperCase()}</span>
      ),
    },
    {
      accessorKey: "customerId",
      header: t("customer"),
      cell: (info) => {
        const c = customers.find((x) => x.id === info.getValue());
        return (
          <Link className="table-link" to={`/customers/${c?.id}`}>
            {c?.name || "—"}
          </Link>
        );
      },
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: (info) => fmtDate(info.getValue(), lang),
    },
    {
      accessorKey: "amountCents",
      header: t("amount"),
      cell: (info) => <b>{fmtMoney(info.getValue(), lang)}</b>,
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: (info) => <Status status={info.getValue()} t={t} />,
    },
  ];
  return (
    <>
      <PageIntro
        title={t("goodMorning")}
        subtitle={t("overviewSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="metric-grid">
        <Metric
          title={t("totalRevenue")}
          value={fmtMoney(totals.currentRevenue, lang)}
          change={totals.revenueChange}
          icon={CircleDollarSign}
          lang={lang}
        />
        <Metric
          title={t("totalOrders")}
          value={new Intl.NumberFormat(
            lang === "pl" ? "pl-PL" : "en-US",
          ).format(totals.orders)}
          change={totals.orderChange}
          icon={CreditCard}
          lang={lang}
        />
        <Metric
          title={t("totalCustomers")}
          value={String(totals.customerCount)}
          change={totals.customerChange}
          icon={Users}
          lang={lang}
        />
        <Metric
          title={t("conversion")}
          value={`${totals.conversion.toFixed(1)}%`}
          change={null}
          icon={Activity}
          lang={lang}
        />
      </div>
      <div className="chart-grid overview-charts">
        <ChartPanel
          title={t("revenueTime")}
          action={
            <span className="legend">
              <i /> {t("revenue")}
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={248}>
            <AreaChart
              data={series}
              margin={{ left: 0, right: 4, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                minTickGap={22}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={44}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              <Tooltip content={<ChartTooltip lang={lang} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#635bff"
                strokeWidth={2.5}
                fill="url(#revFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title={t("categoryRevenue")}>
          <div className="donut-layout">
            <ResponsiveContainer width="58%" height={220}>
              <PieChart>
                <Pie
                  data={cats}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={4}
                  stroke="none"
                >
                  {cats.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => fmtMoney(Number(v) * 100, lang)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {cats.map((x) => (
                <div key={x.name}>
                  <i style={{ background: x.color }} />
                  <span>{x.name}</span>
                  <b>{fmtMoney(x.value * 100, lang)}</b>
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>
      </div>
      <div className="lower-grid">
        <ChartPanel
          title={t("topProducts")}
          action={
            <Link to="/sales" className="text-action">
              {t("viewAll")} <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="product-list">
            {top.map(([id, value], i) => {
              const p = products.find((x) => x.id === id)!;
              return (
                <div className="product-row" key={id}>
                  <span className={`product-rank rank-${i + 1}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    className="product-dot"
                    style={{
                      background: categories.find((c) => c.id === p.categoryId)
                        ?.color,
                    }}
                  />
                  <span className="product-name">
                    {p.name}
                    <small>
                      {categories.find((c) => c.id === p.categoryId)?.name}
                    </small>
                  </span>
                  <b>{fmtMoney(value, lang)}</b>
                  <div className="bar-track">
                    <i
                      style={{
                        width: `${Math.max(16, (value / (top[0]?.[1] || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartPanel>
        <section className="panel recent-panel">
          <div className="panel-heading">
            <h2>{t("recentTransactions")}</h2>
            <Link to="/transactions" className="text-action">
              {t("viewAll")} <ArrowRight size={14} />
            </Link>
          </div>
          <DataTable
            data={[...totals.cur]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)}
            columns={cols}
            pageSize={5}
          />
        </section>
      </div>
    </>
  );
}
function Status({ status, t }: { status: string; t: (s: string) => string }) {
  return (
    <span className={`status-badge ${status}`}>
      {t(status === "completed" ? "completedStatus" : status)}
    </span>
  );
}
function RevenuePage({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const tot = calculateTotals(period),
    series = revenueSeries(period, lang),
    cats = categorySeries(period, lang),
    regionsData = regionSeries(period),
    avg = tot.cur.filter((x) => x.status === "completed").length
      ? Math.round(
          tot.currentRevenue /
            tot.cur.filter((x) => x.status === "completed").length,
        )
      : 0;
  return (
    <>
      <PageIntro
        title={t("revenue")}
        subtitle={t("revenueSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="metric-grid three">
        <Metric
          title={t("totalRevenue")}
          value={fmtMoney(tot.currentRevenue, lang)}
          change={tot.revenueChange}
          icon={CircleDollarSign}
          lang={lang}
        />
        <Metric
          title={t("avgTransaction")}
          value={fmtMoney(avg, lang)}
          change={null}
          icon={CreditCard}
          lang={lang}
        />
        <Metric
          title={t("growth")}
          value={
            tot.revenueChange === null
              ? "—"
              : `${tot.revenueChange >= 0 ? "+" : ""}${tot.revenueChange.toFixed(1)}%`
          }
          change={null}
          icon={Activity}
          lang={lang}
        />
      </div>
      <div className="single-chart">
        <ChartPanel
          title={t("revenueTime")}
          action={
            <span className="legend">
              <i />
              {t("revenue")}
            </span>
          }
        >
          <ResponsiveContainer width="100%" height={310}>
            <AreaChart
              data={series}
              margin={{ left: 4, right: 10, top: 12, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#635bff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              <Tooltip content={<ChartTooltip lang={lang} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#635bff"
                strokeWidth={2.5}
                fill="url(#revFill2)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="chart-grid">
        <ChartPanel title={t("categoryRevenue")}>
          <div className="donut-layout">
            <ResponsiveContainer width="56%" height={230}>
              <PieChart>
                <Pie
                  data={cats}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={86}
                  paddingAngle={4}
                  stroke="none"
                >
                  {cats.map((x, i) => (
                    <Cell key={i} fill={x.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => fmtMoney(Number(v) * 100, lang)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-legend">
              {cats.map((x) => (
                <div key={x.name}>
                  <i style={{ background: x.color }} />
                  <span>{x.name}</span>
                  <b>{fmtMoney(x.value * 100, lang)}</b>
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>
        <ChartPanel title={t("regionRevenue")}>
          <div className="region-bars">
            {regionsData.map((x, i) => (
              <div className="region-row" key={x.name}>
                <div>
                  <span>{x.name}</span>
                  <b>{fmtMoney(x.value * 100, lang)}</b>
                </div>
                <div className="bar-track">
                  <i
                    style={{
                      width: `${(x.value / (regionsData[0]?.value || 1)) * 100}%`,
                      background: [
                        "#635bff",
                        "#29a383",
                        "#f2a84b",
                        "#eb6f92",
                        "#55a6d9",
                      ][i],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
    </>
  );
}
function SalesPage({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const tot = calculateTotals(period),
    counts = new Map<string, number>();
  tot.cur.forEach((x) => counts.set(x.status, (counts.get(x.status) || 0) + 1));
  const byProduct = new Map<string, { orders: number; revenue: number }>();
  tot.cur.forEach((x) => {
    const v = byProduct.get(x.productId) || { orders: 0, revenue: 0 };
    v.orders++;
    if (x.status === "completed") v.revenue += x.amountCents;
    byProduct.set(x.productId, v);
  });
  const top = [...byProduct]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([id, v]) => ({
      id,
      name: products.find((p) => p.id === id)?.name || "—",
      orders: v.orders,
      revenue: v.revenue,
    }));
  const data = revenueSeries(period, lang);
  return (
    <>
      <PageIntro
        title={t("sales")}
        subtitle={t("salesSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="metric-grid four">
        <Metric
          title={t("totalOrders")}
          value={String(tot.cur.length)}
          change={tot.orderChange}
          icon={CreditCard}
          lang={lang}
        />
        <Metric
          title={t("avgTransaction")}
          value={fmtMoney(
            tot.cur.filter((x) => x.status === "completed").length
              ? tot.currentRevenue /
                  tot.cur.filter((x) => x.status === "completed").length
              : 0,
            lang,
          )}
          change={null}
          icon={CircleDollarSign}
          lang={lang}
        />
        <Metric
          title={t("completed")}
          value={String(counts.get("completed") || 0)}
          change={null}
          icon={Check}
          lang={lang}
        />
        <Metric
          title={t("cancelled")}
          value={String(counts.get("failed") || 0)}
          change={null}
          icon={Activity}
          lang={lang}
        />
      </div>
      <div className="chart-grid">
        <ChartPanel title={t("salesTrend")}>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={data}>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
              />
              <Tooltip content={<ChartTooltip lang={lang} />} />
              <Bar
                dataKey="orders"
                name="orders"
                fill="#635bff"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title={t("ordersByStatus")}>
          <div className="status-summary">
            {["completed", "pending", "refunded", "failed"].map((s, i) => (
              <div className="status-summary-row" key={s}>
                <span className={`status-mark color-${i}`} />
                <span>{t(s === "completed" ? "completedStatus" : s)}</span>
                <b>{counts.get(s) || 0}</b>
                <small>
                  {tot.cur.length
                    ? Math.round(((counts.get(s) || 0) / tot.cur.length) * 100)
                    : 0}
                  %
                </small>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>
      <div className="chart-grid">
        <ChartPanel title={t("categoryRevenue")}>
          <ResponsiveContainer width="100%" height={225}>
            <BarChart data={categorySeries(period, lang)}>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 10 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              <Tooltip
                formatter={(v: any) => fmtMoney(Number(v) * 100, lang)}
              />
              <Bar dataKey="value" fill="#635bff" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title={t("regionRevenue")}>
          <ResponsiveContainer width="100%" height={225}>
            <BarChart
              data={regionSeries(period)}
              layout="vertical"
              margin={{ left: 5, right: 10 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 10 }}
                tickFormatter={(v) =>
                  new Intl.NumberFormat(lang === "pl" ? "pl-PL" : "en-US", {
                    notation: "compact",
                  }).format(v)
                }
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 9 }}
              />
              <Tooltip
                formatter={(v: any) => fmtMoney(Number(v) * 100, lang)}
              />
              <Bar dataKey="value" fill="#29a383" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>{t("topProducts")}</h2>
          <span className="subtle-count">
            {top.length} {t("productSales")}
          </span>
        </div>
        <DataTable
          data={top}
          columns={[
            {
              accessorKey: "name",
              header: t("product"),
              cell: (info) => <b>{info.getValue()}</b>,
            },
            { accessorKey: "orders", header: t("totalOrders") },
            {
              accessorKey: "revenue",
              header: t("totalRevenue"),
              cell: (info) => fmtMoney(info.getValue(), lang),
            },
          ]}
          searchPlaceholder={t("search")}
        />
      </section>
    </>
  );
}
function CustomersPage({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const [regionFilter, setRegionFilter] = useState("");
  const growth = customerGrowthSeries(period, lang);
  const totals = calculateTotals(period);
  const active = customers.filter((c) =>
    totals.cur.some((x) => x.customerId === c.id),
  );
  const newCount = active.filter((c) => inPeriod(c.createdAt, period)).length,
    returnCount = Math.max(0, active.length - newCount);
  const rows = active.map((c) => ({
    ...c,
    count: totals.cur.filter((x) => x.customerId === c.id).length,
    lifetime: revenue(transactions.filter((x) => x.customerId === c.id)),
  }));
  const visibleRows = rows.filter(
    (c) => !regionFilter || c.regionId === regionFilter,
  );
  const regionsRows = regions
    .map((r) => ({
      name: r.name,
      count: active.filter((c) => c.regionId === r.id).length,
    }))
    .filter((x) => x.count)
    .sort((a, b) => b.count - a.count);
  const segmentRows = [
    { name: t("new"), count: newCount, color: "#635bff" },
    { name: t("returningSegment"), count: returnCount, color: "#29a383" },
    {
      name: t("vip"),
      count: active.filter((x) => x.segment === "vip").length,
      color: "#f2a84b",
    },
  ];
  return (
    <>
      <PageIntro
        title={t("customers")}
        subtitle={t("customersSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="metric-grid three">
        <Metric
          title={t("totalCustomers")}
          value={String(totals.customerCount)}
          change={totals.customerChange}
          icon={Users}
          lang={lang}
        />
        <Metric
          title={t("newCustomers")}
          value={String(newCount)}
          change={null}
          icon={Activity}
          lang={lang}
        />
        <Metric
          title={t("returning")}
          value={String(returnCount)}
          change={null}
          icon={ArrowUpRight}
          lang={lang}
        />
      </div>
      <div className="chart-grid">
        <ChartPanel title={t("customerGrowth")}>
          <ResponsiveContainer width="100%" height={225}>
            <BarChart data={growth}>
              <CartesianGrid
                vertical={false}
                stroke="var(--line)"
                strokeDasharray="4 5"
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted)", fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="count"
                name={t("customers")}
                fill="#635bff"
                radius={[5, 5, 0, 0]}
              />{" "}
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title={t("segments")}>
          <div className="region-bars">
            {segmentRows.map((x) => (
              <div className="region-row" key={x.name}>
                <div>
                  <span>{x.name}</span>
                  <b>{x.count}</b>
                </div>
                <div className="bar-track">
                  <i
                    style={{
                      width: `${(x.count / Math.max(1, totals.customerCount)) * 100}%`,
                      background: x.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <h3 className="mini-heading">{t("geographic")}</h3>
          {regionsRows.slice(0, 4).map((x) => (
            <div className="geo-line" key={x.name}>
              <Globe2 size={14} />
              <span>{x.name}</span>
              <b>{x.count}</b>
            </div>
          ))}
        </ChartPanel>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>{t("customerList")}</h2>
          <select
            className="mini-filter"
            aria-label={t("region")}
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">{t("allRegions")}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="subtle-count">
            {visibleRows.length} {t("customers").toLowerCase()}
          </span>
        </div>
        <DataTable
          data={visibleRows}
          searchPlaceholder={t("searchCustomers")}
          columns={[
            {
              accessorKey: "name",
              header: t("customer"),
              cell: (info) => {
                const c = info.row.original;
                return (
                  <Link
                    className="customer-cell table-link"
                    to={`/customers/${c.id}`}
                  >
                    <span className="table-avatar">
                      {c.name
                        .split(" ")
                        .map((x) => x[0])
                        .join("")}
                    </span>
                    <span>
                      <b>{c.name}</b>
                      <small>{c.company}</small>
                    </span>
                  </Link>
                );
              },
            },
            { accessorKey: "email", header: t("email") },
            {
              accessorKey: "regionId",
              header: t("region"),
              cell: (info) =>
                regions.find((r) => r.id === info.getValue())?.name,
            },
            {
              accessorKey: "createdAt",
              header: t("registration"),
              cell: (info) =>
                fmtDate(info.getValue(), lang, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
            },
            { accessorKey: "count", header: t("transactionCount") },
            {
              accessorKey: "lifetime",
              header: t("lifetimeRevenue"),
              cell: (info) => <b>{fmtMoney(info.getValue(), lang)}</b>,
            },
          ]}
        />
      </section>
    </>
  );
}
function TransactionsPage({
  t,
  lang,
  period,
  toast,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
  toast: (s: string) => void;
}) {
  const [category, setCategory] = useState(""),
    [status, setStatus] = useState(""),
    [region, setRegion] = useState(""),
    [min, setMin] = useState(""),
    [max, setMax] = useState("");
  const rows = filteredTransactions(period).filter(
    (x) =>
      (!category || x.categoryId === category) &&
      (!status || x.status === status) &&
      (!region || x.regionId === region) &&
      (!min || x.amountCents >= Number(min) * 100) &&
      (!max || x.amountCents <= Number(max) * 100),
  );
  const cols: ColumnDef<Transaction, any>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: (info) => (
        <Link
          className="mono table-link"
          to={`/transactions/${info.getValue()}`}
        >
          {String(info.getValue()).toUpperCase()}
        </Link>
      ),
    },
    {
      accessorKey: "date",
      header: t("date"),
      cell: (info) =>
        fmtDate(info.getValue(), lang, {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      accessorKey: "customerId",
      header: t("customer"),
      cell: (info) => {
        const c = customers.find((x) => x.id === info.getValue());
        return (
          <Link className="table-link" to={`/customers/${c?.id}`}>
            {c?.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "productId",
      header: t("product"),
      cell: (info) => products.find((x) => x.id === info.getValue())?.name,
    },
    {
      accessorKey: "categoryId",
      header: t("category"),
      cell: (info) => categories.find((x) => x.id === info.getValue())?.name,
    },
    {
      accessorKey: "amountCents",
      header: t("amount"),
      cell: (info) => <b>{fmtMoney(info.getValue(), lang)}</b>,
    },
    {
      accessorKey: "paymentMethod",
      header: t("payment"),
      cell: (info) => t(info.getValue()) || info.getValue(),
    },
    {
      accessorKey: "status",
      header: t("status"),
      cell: (info) => <Status status={info.getValue()} t={t} />,
    },
  ];
  const exportCsv = () => {
    const escape = (v: string | number) =>
      `"${String(v).split('"').join('""')}"`;
    const lines = [
      [
        t("date"),
        t("customer"),
        t("product"),
        t("category"),
        t("description"),
        t("amount"),
        t("payment"),
        t("status"),
      ],
      ...rows.map((x) => [
        x.date,
        customers.find((c) => c.id === x.customerId)?.name || "",
        products.find((p) => p.id === x.productId)?.name || "",
        categories.find((c) => c.id === x.categoryId)?.name || "",
        x.description,
        (x.amountCents / 100).toFixed(2),
        x.paymentMethod,
        x.status,
      ]),
    ]
      .map((row) => row.map(escape).join(","))
      .join("\r\n");
    const blob = new Blob(["\ufeff", lines], {
        type: "text/csv;charset=utf-8",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `northstar-transactions-${period.start}-to-${period.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`${t("exportCsv")} · ${rows.length}`);
  };
  return (
    <>
      <PageIntro
        title={t("transactions")}
        subtitle={t("transactionsSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="transaction-summary">
        <div>
          <span className="summary-icon">
            <CreditCard size={18} />
          </span>
          <span>
            <small>{t("totalOrders")}</small>
            <strong>{rows.length}</strong>
          </span>
        </div>
        <div>
          <span className="summary-icon green">
            <CircleDollarSign size={18} />
          </span>
          <span>
            <small>{t("totalRevenue")}</small>
            <strong>{fmtMoney(revenue(rows), lang)}</strong>
          </span>
        </div>
        <button className="button primary export-button" onClick={exportCsv}>
          <Download size={16} />
          {t("exportCsv")}
        </button>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h2>{t("transactionList")}</h2>
            <span className="panel-subtitle">
              {rows.length} {t("transactions").toLowerCase()}
            </span>
          </div>
        </div>
        <div className="filter-row">
          <label>
            <span>{t("category")}</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">{t("allCategories")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === "pl"
                    ? (
                        {
                          Software: "Oprogramowanie",
                          Consulting: "Konsulting",
                          Hardware: "Sprzęt",
                          Training: "Szkolenia",
                          Support: "Wsparcie",
                        } as Record<string, string>
                      )[c.name]
                    : c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("status")}</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">{t("allStatuses")}</option>
              {["completed", "pending", "refunded", "failed"].map((s) => (
                <option key={s} value={s}>
                  {t(s === "completed" ? "completedStatus" : s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{t("region")}</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option value="">{t("allRegions")}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label className="amount-input">
            <span>{t("amountMin")}</span>
            <input
              type="number"
              min="0"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="0"
            />
          </label>
          <label className="amount-input">
            <span>{t("amountMax")}</span>
            <input
              type="number"
              min="0"
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="—"
            />
          </label>
          {(category || status || region || min || max) && (
            <button
              className="clear-filter"
              onClick={() => {
                setCategory("");
                setStatus("");
                setRegion("");
                setMin("");
                setMax("");
              }}
            >
              {t("clear")}
            </button>
          )}
        </div>
        <DataTable
          data={rows}
          columns={cols}
          searchPlaceholder={t("searchTransactions")}
        />
      </section>
    </>
  );
}
function CustomerDetail({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const { id = "" } = useParams(),
    navigate = useNavigate(),
    c = customers.find((x) => x.id === id),
    rows = transactions
      .filter((x) => x.customerId === id && inPeriod(x.date, period))
      .sort((a, b) => b.date.localeCompare(a.date));
  if (!c) return <NotFound t={t} />;
  return (
    <>
      <button className="back-link" onClick={() => navigate("/customers")}>
        <ChevronLeft size={16} />
        {t("customers")}
      </button>
      <PageIntro
        title={c.name}
        subtitle={c.company}
        period={period}
        lang={lang}
        t={t}
      />
      <div className="detail-grid">
        <section className="panel detail-card">
          <div className="detail-avatar">
            {c.name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>
          <h2>{c.name}</h2>
          <p>{c.company}</p>
          <div className="detail-info">
            <div>
              <span>{t("email")}</span>
              <b>{c.email}</b>
            </div>
            <div>
              <span>{t("region")}</span>
              <b>{regions.find((r) => r.id === c.regionId)?.name}</b>
            </div>
            <div>
              <span>{t("registration")}</span>
              <b>
                {fmtDate(c.createdAt, lang, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </b>
            </div>
            <div>
              <span>{t("segment")}</span>
              <b>
                {t(c.segment === "returning" ? "returningSegment" : c.segment)}
              </b>
            </div>
          </div>
        </section>
        <div className="detail-metrics">
          <article className="metric">
            <span>{t("lifetimeRevenue")}</span>
            <strong>{fmtMoney(revenue(rows), lang)}</strong>
          </article>
          <article className="metric">
            <span>{t("transactionCount")}</span>
            <strong>{rows.length}</strong>
          </article>
        </div>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <h2>{t("recentActivity")}</h2>
        </div>
        <DataTable
          data={rows}
          pageSize={6}
          columns={[
            {
              accessorKey: "id",
              header: "ID",
              cell: (i) => (
                <Link
                  className="mono table-link"
                  to={`/transactions/${i.getValue()}`}
                >
                  {String(i.getValue()).toUpperCase()}
                </Link>
              ),
            },
            {
              accessorKey: "date",
              header: t("date"),
              cell: (i) => fmtDate(i.getValue(), lang),
            },
            {
              accessorKey: "productId",
              header: t("product"),
              cell: (i) => products.find((p) => p.id === i.getValue())?.name,
            },
            {
              accessorKey: "amountCents",
              header: t("amount"),
              cell: (i) => fmtMoney(i.getValue(), lang),
            },
            {
              accessorKey: "status",
              header: t("status"),
              cell: (i) => <Status status={i.getValue()} t={t} />,
            },
          ]}
        />
      </section>
    </>
  );
}
function TransactionDetail({
  t,
  lang,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  period: Period;
}) {
  const { id = "" } = useParams(),
    navigate = useNavigate(),
    tx = transactions.find((x) => x.id === id),
    c = customers.find((x) => x.id === tx?.customerId);
  if (!tx || !c) return <NotFound t={t} />;
  const fields: [
    [string, string],
    [string, string],
    [string, string],
    [string, string],
    [string, string],
    [string, string],
  ] = [
    [
      t("date"),
      fmtDate(tx.date, lang, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    ],
    [t("customer"), c.name],
    [t("product"), products.find((x) => x.id === tx.productId)?.name || "—"],
    [
      t("category"),
      categories.find((x) => x.id === tx.categoryId)?.name || "—",
    ],
    [t("payment"), t(tx.paymentMethod)],
    [t("region"), regions.find((x) => x.id === tx.regionId)?.name || "—"],
  ];
  return (
    <>
      <button className="back-link" onClick={() => navigate("/transactions")}>
        <ChevronLeft size={16} />
        {t("transactions")}
      </button>
      <PageIntro
        title={t("transactionDetails")}
        subtitle={String(tx.id).toUpperCase()}
        period={period}
        lang={lang}
        t={t}
      />
      <section className="panel transaction-detail">
        <div className="transaction-detail-head">
          <div>
            <span className="detail-kicker">{t("amount")}</span>
            <strong>{fmtMoney(tx.amountCents, lang)}</strong>
          </div>
          <Status status={tx.status} t={t} />
        </div>
        <div className="detail-info two-col">
          {fields.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
          <div>
            <span>{t("description")}</span>
            <b>{tx.description}</b>
          </div>
        </div>
        <Link className="button secondary" to={`/customers/${c.id}`}>
          {t("customerDetails")} <ArrowRight size={15} />
        </Link>
      </section>
    </>
  );
}
function SettingsPage({
  t,
  lang,
  theme,
  setTheme,
  period,
}: {
  t: (k: string) => string;
  lang: Lang;
  theme: Theme;
  setTheme: (v: Theme) => void;
  period: Period;
}) {
  return (
    <>
      <PageIntro
        title={t("settings")}
        subtitle={t("settingsSub")}
        period={period}
        lang={lang}
        t={t}
      />
      <section className="panel settings-panel">
        <div className="settings-row">
          <div>
            <h2>{t("language")}</h2>
            <p>{t("preferences")}</p>
          </div>
          <select
            value={lang}
            aria-label={t("language")}
            onChange={(e) => {
              localStorage.setItem("language", e.target.value);
              window.dispatchEvent(new Event("languagechange"));
            }}
          >
            <option value="en">{t("english")}</option>
            <option value="pl">{t("polish")}</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <h2>{t("appearance")}</h2>
            <p>{t("preferences")}</p>
          </div>
          <div className="theme-choice">
            <button
              className={theme === "light" ? "chosen" : ""}
              onClick={() => setTheme("light")}
            >
              <Sun size={16} />
              {t("light")}
            </button>
            <button
              className={theme === "dark" ? "chosen" : ""}
              onClick={() => setTheme("dark")}
            >
              <Moon size={16} />
              {t("dark")}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function NotFound({ t }: { t: (k: string) => string }) {
  return (
    <div className="panel not-found">
      <h2>{t("noResults")}</h2>
      <Link className="button secondary" to="/">
        {t("overview")}
      </Link>
    </div>
  );
}

export default App;
