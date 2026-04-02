import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useGetAdminResellersQuery,
  useApproveResellerMutation,
  useDeleteResellerMutation,
  useLazyGetAdminPayoutInvoiceQuery,
  useMarkPayoutPaidMutation,
} from "@/features/reseller/resellerApiSlice";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import {
  Package,
  ShoppingCart,
  User,
  Mail,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Eye,
  Trash2,
  Download,
  Pencil,
  CheckCheck,
} from "lucide-react";
import BdtIcon from "@/components/icons/BdtIcon";

const openInvoicePrintWindow = (data) => {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head><title>Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; }
          h1 { font-size: 1.25rem; margin-bottom: 8px; }
          .meta { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; }
          th { color: #666; font-weight: 500; }
          .total { font-size: 1.25rem; font-weight: 700; margin-top: 16px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Reseller Withdrawal Invoice</h1>
        <div class="meta">Invoice # ${data.invoiceNumber}</div>
        <table>
          <tr><th>Reseller</th><td>${data.resellerName}</td></tr>
          <tr><th>Company</th><td>${data.companyName || "—"}</td></tr>
          <tr><th>Paid at</th><td>${data.paidAt ? new Date(data.paidAt).toLocaleString() : "—"}</td></tr>
          <tr><th>Requested at</th><td>${data.requestedAt ? new Date(data.requestedAt).toLocaleString() : "—"}</td></tr>
          <tr><th>Withdrawn Amount</th><td><strong>${Number(data.amount).toFixed(2)}</strong></td></tr>
        </table>
        <p class="total">Total Amount: ${Number(data.amount).toFixed(2)}</p>
        <p style="margin-top: 24px; font-size: 0.75rem; color: #888;">Thank you for your business.</p>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  w.document.close();
};

const ResellersListPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data: resellers = [], isLoading, refetch: refetchResellers } =
    useGetAdminResellersQuery();
  const [updateSystemuser, { isLoading: updatingUser }] =
    useUpdateSystemuserMutation();
  const [approveReseller, { isLoading: approving }] =
    useApproveResellerMutation();
  const [deleteReseller, { isLoading: deleting }] = useDeleteResellerMutation();
  const [getAdminPayoutInvoice, { isLoading: invoiceLoading }] =
    useLazyGetAdminPayoutInvoiceQuery();
  const [markPayoutPaid, { isLoading: markingPayout }] = useMarkPayoutPaidMutation();
  const [expandedId, setExpandedId] = useState(null);
  const [commissionEditReseller, setCommissionEditReseller] = useState(null);
  const [commissionEditValue, setCommissionEditValue] = useState("");
  const navigate = useNavigate();

  const handleApproveReseller = async (resellerId) => {
    try {
      await approveReseller(resellerId).unwrap();
      toast.success(
        t("resellers.resellerApproved") || "Reseller request approved",
      );
    } catch (err) {
      toast.error(err?.data?.message || "Failed to approve reseller");
    }
  };

  const handleDeleteReseller = async (resellerId) => {
    const confirm = window.confirm(
      t("resellers.confirmDelete") ||
        "Are you sure you want to delete this reseller?",
    );
    if (!confirm) return;
    try {
      await deleteReseller(resellerId).unwrap();
      toast.success(t("resellers.deleted") || "Reseller deleted");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete reseller");
    }
  };

  const handleDownloadInvoice = async (payoutId) => {
    try {
      const data = await getAdminPayoutInvoice(payoutId).unwrap();
      openInvoicePrintWindow(data);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to load invoice");
    }
  };

  const handleToggleResellerActive = async (reseller) => {
    const nextActive = !reseller.isActive;
    const confirm = window.confirm(
      nextActive
        ? t("resellers.confirmActivate") ||
            "Are you sure you want to activate this reseller so they can log in again?"
        : t("resellers.confirmDeactivate") ||
            "Are you sure you want to deactivate this reseller? They will be logged out and cannot log in."
    );
    if (!confirm) return;
    try {
      await updateSystemuser({ id: reseller.id, companyId: authUser?.companyId, isActive: nextActive }).unwrap();
      toast.success(
        nextActive
          ? t("resellers.activated") || "Reseller activated"
          : t("resellers.deactivated") ||
              "Reseller deactivated and will be logged out"
      );
      refetchResellers();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t("resellers.toggleActiveFailed") ||
          "Failed to update reseller status"
      );
    }
  };

  const handleMarkPayoutPaid = async (payoutId) => {
    try {
      await markPayoutPaid(payoutId).unwrap();
      toast.success(t("resellers.payoutMarkedPaid") || "Payout marked as paid");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to mark payout as paid");
    }
  };

  const handleOpenSetCommission = (reseller) => {
    setCommissionEditReseller(reseller);
    setCommissionEditValue(
      reseller?.commissionRate != null
        ? String(Number(reseller.commissionRate))
        : "",
    );
  };

  const handleSaveSetCommission = async () => {
    if (!commissionEditReseller) return;
    const num = Number(commissionEditValue);
    if (commissionEditValue.trim() !== "" && (Number.isNaN(num) || num < 0 || num > 100)) {
      toast.error(
        t("resellers.commissionRateInvalid") ||
          "Commission % must be between 0 and 100.",
      );
      return;
    }
    try {
      await updateSystemuser({
        id: commissionEditReseller.id,
        companyId: authUser?.companyId,
        resellerCommissionRate:
          commissionEditValue.trim() === ""
            ? null
            : num,
      }).unwrap();
      toast.success(
        t("resellers.commissionRateUpdated") ||
          "Commission % updated for reseller.",
      );
      refetchResellers();
      setCommissionEditReseller(null);
      setCommissionEditValue("");
    } catch (err) {
      toast.error(
        err?.data?.message ||
          t("resellers.commissionRateUpdateFailed") ||
          "Failed to update commission %",
      );
    }
  };

  const formatMoney = (n) =>
    Number(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getPayoutStatusLabel = (status) => {
    if (!status) return t("resellers.statusUnknown") || "Unknown";
    const normalized = String(status).toUpperCase();
    if (normalized === "PAID") {
      return t("resellers.statusPaid") || "Paid";
    }
    if (normalized === "PENDING") {
      return t("resellers.statusPending") || "Pending";
    }
    if (normalized === "CANCELLED") {
      return t("resellers.statusCancelled") || "Cancelled";
    }
    return normalized
      .toLowerCase()
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-4 py-5 shadow-sm dark:border-slate-700">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-500/25 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 mb-1">
              {t("resellers.title") || "Reseller network"}
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              {t("resellers.title") || "Resellers Overview"}
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-300 max-w-2xl">
              {t("resellers.subtitle") ||
                "See at a glance who is adding products, driving sales, and waiting for payouts."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 dark:bg-slate-950/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50/80 dark:bg-slate-900/80">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.reseller") || "Reseller"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.productsAdded") || "Products"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.sold") || "Sold"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {/* totalEarning now represents total sales/revenue */}
                  {t("resellers.totalSales") || "Total Sales"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.commissionRate") || "Commission %"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.totalEarningPaid") || "Total Earning (Paid)"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.payableToReseller") || "Payable to Reseller"}
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.paymentRequests") || "Payment requests"}
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("resellers.status") || "Status"}
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                  {t("common.actions") || "Actions"}
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {resellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t("resellers.noResellers") || "No resellers found."}
                  </td>
                </tr>
              ) : (
                resellers.map((r) => {
                  const pendingPayouts = (r.payouts || []).filter(
                    (p) => p.status === "PENDING"
                  );
                  const isExpanded = expandedId === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr className="bg-white/90 dark:bg-slate-950/80 hover:bg-slate-50/80 dark:hover:bg-slate-900/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-50">
                                {r.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {r.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                            <Package className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            {r.totalProducts ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                            <ShoppingCart className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                            {r.totalSoldQty ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-50">
                          <span className="inline-flex items-center gap-1">
                            <BdtIcon className="w-4 h-4 text-emerald-500" />
                            {formatMoney(r.totalEarning)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200">
                            {r.commissionRate != null
                              ? `${Number(r.commissionRate).toFixed(2)}%`
                              : "-"}
                            <button
                              type="button"
                              onClick={() => handleOpenSetCommission(r)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              title={t("resellers.setCommission") || "Set commission %"}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-violet-700 dark:text-violet-400">
                          <span className="inline-flex items-center gap-1">
                            <BdtIcon className="w-4 h-4 text-violet-500" />
                            {formatMoney(r.totalWithdrawn)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <CreditCard className="w-4 h-4" />
                            {formatMoney(r.pendingPayoutAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pendingPayouts.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              {pendingPayouts.length}{" "}
                              {t("resellers.pending") || "pending"}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              r.isActive
                                ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                : "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                            }`}
                          >
                            {r.isActive
                              ? t("resellers.active") || "Active"
                              : t("resellers.pendingApproval") ||
                                "Pending approval"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/resellers/${r.id}`, {
                                  state: { reseller: r },
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {t("common.view") || "View"}
                            </button>
                            {!r.isActive && (
                              <button
                                type="button"
                                onClick={() => handleApproveReseller(r.id)}
                                disabled={approving}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {t("resellers.approve") || "Approve"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleResellerActive(r)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                                r.isActive
                                  ? "bg-amber-600 text-white hover:bg-amber-700"
                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                              }`}
                            >
                              {r.isActive
                                ? t("resellers.deactivate") || "Deactivate"
                                : t("resellers.activate") || "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReseller(r.id)}
                              disabled={deleting}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t("common.delete") || "Delete"}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {(r.payouts || []).length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : r.id)
                              }
                              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>

                      {isExpanded && r.id === expandedId && (
                        <tr className="bg-slate-50/80 dark:bg-slate-900/70">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
                              <p className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/80">
                                {t("resellers.payoutHistory") ||
                                  "Payout requests"}
                              </p>
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                      ID
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Amount
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Status
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Requested
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Paid at
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Payment details
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                  {(r.payouts || []).map((p) => (
                                    <tr key={p.id} className="last:border-b-0">
                                      <td className="px-3 py-2">{p.id}</td>
                                      <td className="px-3 py-2 text-right font-medium">
                                        {formatMoney(p.amount)}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            p.status === "PAID"
                                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                              : p.status === "PENDING"
                                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                          }`}
                                        >
                                          {getPayoutStatusLabel(p.status)}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                        {p.createdAt
                                          ? new Date(
                                              p.createdAt
                                            ).toLocaleString()
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                        {p.paidAt
                                          ? new Date(
                                              p.paidAt
                                            ).toLocaleString()
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 whitespace-pre-line max-w-xs">
                                        {p.paymentDetails || "—"}
                                      </td>
                                      <td className="px-3 py-2 text-right space-x-1">
                                        {p.status === "PENDING" && (
                                          <button
                                            type="button"
                                            onClick={() => handleMarkPayoutPaid(p.id)}
                                            disabled={markingPayout}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                                          >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                            {t("resellers.markAsPaid") || "Mark as Paid"}
                                          </button>
                                        )}
                                        {p.status === "PAID" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDownloadInvoice(p.id)
                                            }
                                            disabled={invoiceLoading}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-600 text-white text-xs font-medium hover:bg-sky-700 disabled:opacity-50"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            {t("resellers.downloadInvoice") ||
                                              "Download invoice"}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Set Commission % Modal */}
      {commissionEditReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
              {t("resellers.setCommission") || "Set commission %"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {commissionEditReseller.name}
            </p>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              {t("resellers.commissionRate") || "Commission %"}
            </label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={commissionEditValue}
                onChange={(e) => setCommissionEditValue(e.target.value)}
                placeholder="e.g. 10"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              />
              <span className="text-slate-500 dark:text-slate-400 text-sm">%</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCommissionEditReseller(null);
                  setCommissionEditValue("");
                }}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveSetCommission}
                disabled={updatingUser}
                className="px-3 py-1.5 rounded-full bg-sky-600 text-xs font-medium text-white shadow-sm hover:bg-sky-700 disabled:opacity-50"
              >
                {updatingUser
                  ? t("common.updating") || "Saving..."
                  : t("common.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResellersListPage;
