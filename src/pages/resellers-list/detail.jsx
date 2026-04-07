import React, { useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, Mail, Package, ShoppingCart, Wallet } from "lucide-react";
import { useGetAdminResellersQuery } from "@/features/reseller/resellerApiSlice";
import { useGetOrdersQuery } from "@/features/order/orderApiSlice";

const ResellerDetailPage = () => {
  const { id } = useParams();
  const resellerId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const locationReseller = location.state?.reseller || null;
  const { data: resellers = [], isLoading: resellersLoading } =
    useGetAdminResellersQuery();

  const reseller = useMemo(
    () =>
      locationReseller ||
      resellers.find((r) => Number(r.id) === resellerId) ||
      null,
    [locationReseller, resellers, resellerId],
  );

  const {
    data: orders = [],
    isLoading: ordersLoading,
  } = useGetOrdersQuery(
    resellerId ? { resellerId } : undefined,
  );

  const formatMoney = (n) =>
    Number(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getOrderStatusLabel = (status) => {
    if (!status) return t("orders.statusUnknown") || "Unknown";
    const normalized = String(status).toLowerCase();
    // Simple human-friendly mapping; reuse translations when available
    if (normalized === "pending") {
      return t("orders.statusPending") || "Pending";
    }
    if (normalized === "processing") {
      return t("orders.statusProcessing") || "Processing";
    }
    if (normalized === "shipped") {
      return t("orders.statusShipped") || "Shipped";
    }
    if (normalized === "delivered" || normalized === "completed") {
      return t("orders.statusCompleted") || "Completed";
    }
    if (normalized === "cancelled" || normalized === "canceled") {
      return t("orders.statusCancelled") || "Cancelled";
    }
    return normalized
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/merchants")}
          className="inline-flex items-center gap-2 text-xs md:text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back") || "Back to resellers"}
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-emerald-50 via-sky-50 to-white px-4 py-5 shadow-sm dark:border-slate-800/80 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-500/10" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400 mb-1">
              {t("resellers.detailLabel") || "Reseller Overview"}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {reseller?.name || t("resellers.detailTitle") || "Reseller details"}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              {t("resellers.detailSubtitle") ||
                "Quick snapshot of this reseller’s profile, performance, and all related orders in one place."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                reseller?.isActive
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-500/40"
                  : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/40"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {reseller?.isActive
                ? t("resellers.active") || "Active reseller"
                : t("resellers.pendingApproval") || "Pending approval"}
            </span>
            {reseller?.createdAt && (
              <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200/80 backdrop-blur-sm dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700/80">
                {t("resellers.since") || "Joined"}{" "}
                {new Date(reseller.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {reseller?.name || "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {reseller?.email || "—"}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-600 dark:text-slate-200">
                {t("resellers.company") || "Company"}:
              </span>
              <span className="truncate text-right">
                {reseller?.companyName || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-600 dark:text-slate-200">
                {t("resellers.phone") || "Phone"}:
              </span>
              <span>{reseller?.phone || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
              {t("resellers.productsAdded") || "Products added"}
            </p>
            <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {reseller?.totalProducts ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("resellers.totalSoldQty") || "Total sold"}{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {reseller?.totalSoldQty ?? 0}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.16em]">
              {t("resellers.earning") || "Total earning"}
            </p>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              ৳{formatMoney(reseller?.totalEarning)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("resellers.pendingPayout") || "Pending payout"}{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                ৳{formatMoney(reseller?.pendingPayoutAmount)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 px-4 py-4 md:px-5 md:py-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                <ShoppingCart className="w-4 h-4" />
              </span>
              {t("resellers.orders") || "Orders from this reseller"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("resellers.ordersSubtitle") ||
                "All orders that include products from this reseller."}
            </p>
          </div>
        </div>

        {ordersLoading || resellersLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {t("common.loading") || "Loading..."}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("resellers.noOrders") || "No orders found for this reseller yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60">
                <tr>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                    {t("orders.id") || "Order ID"}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                    {t("orders.created") || "Created"}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                    {t("orders.customer") || "Customer"}
                  </th>
                  <th className="px-4 py-2 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                    {t("orders.total") || "Total"}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                    {t("common.status") || "Status"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <Link
                        to={`/orders/${o.id}`}
                        className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-2"
                      >
                        #{o.id}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-800 dark:text-slate-200">
                      {o.customer?.name || o.customerName || "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {formatMoney(o.totalAmount || 0)}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 capitalize text-[11px] font-medium">
                        {getOrderStatusLabel(o.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResellerDetailPage;
