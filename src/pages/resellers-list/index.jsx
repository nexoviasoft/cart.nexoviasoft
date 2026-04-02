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
  Wallet,
  TrendingUp,
  Clock,
  XCircle,
  PlayCircle,
  Activity,
  Check,
  FileText
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
        <script>window.onload = function() { window.print(); }</script>
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-emerald-500/20" />
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-emerald-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  // Calculate top level stats
  const totalResellers = resellers.length;
  const activeResellers = resellers.filter((r) => r.isActive).length;
  const totalPendingApproval = totalResellers - activeResellers;
  const totalPendingPayouts = resellers.reduce(
    (sum, r) => sum + (r.payouts || []).filter((p) => p.status === "PENDING").length,
    0
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50/60 dark:bg-slate-900/60 rounded-2xl min-h-screen">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 px-6 py-6 shadow-sm dark:border-slate-700">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
                <User className="h-3.5 w-3.5 text-emerald-300" />
              </span>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                {t("resellers.title") || "Reseller Network"}
              </p>
            </div>
            <h1 className="text-3xl tracking-tight font-semibold text-white">
              {t("resellers.title") || "Resellers Overview"}
            </h1>
            <p className="mt-1 text-sm text-slate-300/80 max-w-xl">
              {t("resellers.subtitle") ||
                "Monitor activity, manage payout requests, and adjust commission rates across your reseller network."}
            </p>
          </div>

          <div className="flex bg-white/5 border border-white/10 rounded-2xl p-4 gap-6 backdrop-blur-md">
            <div className="flex flex-col items-end px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-white">{totalResellers}</span>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-700/50 self-center" />
            <div className="flex flex-col items-end px-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pending Actions</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold text-amber-400">{totalPendingApproval + totalPendingPayouts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white/95 dark:bg-slate-950/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Reseller</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Financials</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {resellers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 mb-4">
                        <User className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">No Resellers Found</h3>
                      <p className="text-sm text-slate-500">Your network seems empty at the moment.</p>
                    </div>
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
                      <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-all duration-200 group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 font-bold shrink-0">
                              {r.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-50 tracking-tight">
                                {r.name}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                                <Mail className="w-3.5 h-3.5" />
                                {r.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-300">
                                {r.totalSoldQty ?? 0}
                              </span>
                              <span className="text-slate-400">Sold</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-medium text-slate-900 dark:text-slate-300">
                                {r.totalProducts ?? 0}
                              </span>
                              <span className="text-slate-400">Added</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Wallet className="w-3.5 h-3.5 text-slate-400" />
                              <span>Sales:</span>
                              <span className="font-semibold flex items-center text-slate-900 dark:text-slate-100">
                                <BdtIcon className="w-3 h-3 text-slate-400 mr-0.5" />
                                {formatMoney(r.totalEarning)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              <span>Pending:</span>
                              <span className="font-semibold flex items-center text-amber-600 dark:text-amber-400">
                                <BdtIcon className="w-3 h-3 text-amber-500 mr-0.5" />
                                {formatMoney(r.pendingPayoutAmount)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 group/comm">
                              <Activity className="w-3.5 h-3.5 text-slate-400" />
                              <span>Comm:</span>
                              <span className="font-semibold text-slate-900 dark:text-slate-300 inline-flex items-center">
                                {r.commissionRate != null ? `${Number(r.commissionRate).toFixed(1)}%` : "Not set"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenSetCommission(r)}
                                className="opacity-0 group-hover/comm:opacity-100 transition-opacity p-0.5 rounded text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 ml-1"
                                title="Edit Commission Rate"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex flex-col items-center gap-2.5">
                            <span 
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                r.isActive
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                              }`}
                            >
                              {r.isActive ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                              {r.isActive ? "Active" : "Approval Req"}
                            </span>
                            {pendingPayouts.length > 0 && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                {pendingPayouts.length} Payout Req
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/resellers/${r.id}`, { state: { reseller: r } })}
                              className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {!r.isActive && (
                              <button
                                type="button"
                                onClick={() => handleApproveReseller(r.id)}
                                disabled={approving}
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                                title="Approve Reseller"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleResellerActive(r)}
                              className={`p-2 rounded-xl transition-colors ${
                                r.isActive
                                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                  : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                              }`}
                              title={r.isActive ? "Deactivate Reseller" : "Activate Reseller"}
                            >
                              {r.isActive ? <XCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteReseller(r.id)}
                              disabled={deleting}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                              title="Delete Reseller"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                            {(r.payouts || []).length > 0 && (
                              <>
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-1" />
                                <button
                                  type="button"
                                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                                  className={`p-2 rounded-xl border transition-all ${
                                    isExpanded
                                      ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900"
                                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
                                  }`}
                                  title="View Payout History"
                                >
                                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Nested Payout History */}
                      {isExpanded && r.id === expandedId && (
                        <tr>
                          <td colSpan={5} className="p-0 border-b-0 bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="px-6 py-6 border-t border-b border-slate-100 dark:border-slate-800/50 relative">
                              <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800"/>
                              <div className="ml-12 relative bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                    Payout History
                                  </h4>
                                </div>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-sm">
                                    <thead>
                                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-950">
                                        <th className="px-5 py-3 font-medium">Invoice ID</th>
                                        <th className="px-5 py-3 font-medium">Amount</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Requested</th>
                                        <th className="px-5 py-3 font-medium">Paid To</th>
                                        <th className="px-5 py-3 font-medium text-right">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                      {(r.payouts || []).map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                          <td className="px-5 py-3 text-slate-500 font-mono text-xs">#{p.id}</td>
                                          <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                                            <span className="flex items-center">
                                              <BdtIcon className="w-3 h-3 text-slate-400 mr-1" />
                                              {formatMoney(p.amount)}
                                            </span>
                                          </td>
                                          <td className="px-5 py-3">
                                            <span
                                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                p.status === "PAID"
                                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                  : p.status === "PENDING"
                                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                              }`}
                                            >
                                              {getPayoutStatusLabel(p.status)}
                                            </span>
                                          </td>
                                          <td className="px-5 py-3 text-xs text-slate-500">
                                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                                          </td>
                                          <td className="px-5 py-3">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-[150px]" title={p.paymentDetails}>
                                              {p.paymentDetails || "—"}
                                            </p>
                                          </td>
                                          <td className="px-5 py-3 text-right">
                                            {p.status === "PENDING" && (
                                              <button
                                                type="button"
                                                onClick={() => handleMarkPayoutPaid(p.id)}
                                                disabled={markingPayout}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors disabled:opacity-50"
                                              >
                                                <CheckCheck className="w-3.5 h-3.5" />
                                                <span>Mark Paid</span>
                                              </button>
                                            )}
                                            {p.status === "PAID" && (
                                              <button
                                                type="button"
                                                onClick={() => handleDownloadInvoice(p.id)}
                                                disabled={invoiceLoading}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-medium transition-colors disabled:opacity-50"
                                              >
                                                <Download className="w-3.5 h-3.5 text-slate-400" />
                                                <span>Invoice</span>
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
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

      {/* Set Commission Modal - Refined */}
      {commissionEditReseller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCommissionEditReseller(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl shadow-black/10 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Commission Rate
                </h2>
                <p className="text-xs text-slate-500">
                  For <span className="font-medium text-slate-700 dark:text-slate-300">{commissionEditReseller.name}</span>
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Rate Percentage
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionEditValue}
                  onChange={(e) => setCommissionEditValue(e.target.value)}
                  placeholder="e.g. 15.5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-50 dark:placeholder:text-slate-600 overflow-hidden pr-10"
                />
                <span className="absolute right-4 text-slate-400 font-medium">%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={() => {
                  setCommissionEditReseller(null);
                  setCommissionEditValue("");
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSetCommission}
                disabled={updatingUser}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium shadow-sm shadow-sky-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                {updatingUser ? "Saving..." : "Save Rate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResellersListPage;
