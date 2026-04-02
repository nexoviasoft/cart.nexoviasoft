import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetResellerSummaryQuery,
  useGetResellerPayoutsQuery,
  useLazyGetPayoutInvoiceQuery,
  useRequestResellerPayoutMutation,
} from "@/features/reseller/resellerApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import {
  Download,
  Package,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  FolderTree,
  CheckCircle,
  Archive,
  SendHorizonal,
} from "lucide-react";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

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
          <tr><th>Paid at</th><td>${formatDate(data.paidAt)}</td></tr>
          <tr><th>Requested at</th><td>${formatDate(data.requestedAt)}</td></tr>
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

const ResellerDashboardPage = () => {
  const { data: user } = useGetCurrentUserQuery();
  const { data: summary, isLoading: summaryLoading } = useGetResellerSummaryQuery();
  const { data: payouts, isLoading: payoutsLoading } = useGetResellerPayoutsQuery();
  const authUser = useSelector((state) => state.auth.user);
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );
  const [getPayoutInvoice, { isLoading: invoiceLoading }] = useLazyGetPayoutInvoiceQuery();
  const [requestPayout, { isLoading: requestingPayout }] = useRequestResellerPayoutMutation();
  const [activeTab, setActiveTab] = useState("payouts");
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState("");

  const handleRequestWithdrawal = async () => {
    if (!paymentDetails.trim()) {
      toast.error("Please enter your payment details (bKash/bank account).");
      return;
    }
    try {
      await requestPayout({ paymentDetails: paymentDetails.trim() }).unwrap();
      toast.success("Withdrawal request submitted! Admin will review and pay within 7 days.");
      setWithdrawalModalOpen(false);
      setPaymentDetails("");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit withdrawal request.");
    }
  };

  const handleDownloadInvoice = async (payoutId) => {
    try {
      const data = await getPayoutInvoice(payoutId).unwrap();
      openInvoicePrintWindow(data);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to load invoice");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {user?.name || user?.fullName
              ? `Welcome, ${user.name || user.fullName}`
              : "Reseller Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Get a quick overview of your products, sales, and your pending commission balance.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/products/create"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
          >
            <Package className="h-4 w-4" />
            Add Product
          </Link>
          <button
            type="button"
            onClick={() => setWithdrawalModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <SendHorizonal className="h-4 w-4" />
            Request Withdrawal
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Products
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalProducts ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Sold Qty
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalSoldQty ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Sales (Revenue)
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalEarning ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Earning (Paid)
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalWithdrawn ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Withdrawable Balance
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                  {summaryLoading ? "…" : summary?.pendingPayoutAmount ?? 0}
                </p>
                {!summaryLoading && summary?.commissionRate > 0 && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400" title={`Admin commission: ${summary.commissionRate}%`}>
                    -{summary.commissionRate}% fee
                  </span>
                )}
              </div>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex gap-4 border-b border-slate-100 mb-6 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("payouts")}
            className={`pb-3 text-sm font-medium ${activeTab === "payouts" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}
          >
            Commission History
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 text-sm font-medium ${activeTab === "categories" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500"}`}
          >
            Categories
          </button>
        </div>

        {activeTab === "payouts" && (
          <div className="overflow-x-auto">
            {payoutsLoading ? (
              <p className="py-6 text-center text-sm text-slate-500">Loading payouts...</p>
            ) : !payouts || payouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <ArrowDownToLine className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No payout requests yet</p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Requested At</th>
                    <th className="py-2 pr-4">Paid At</th>
                    <th className="py-2 pr-4">Payment Details</th>
                    <th className="py-2 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(payouts ?? []).map((payout) => (
                    <tr key={payout.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-200">{payout.id}</td>
                      <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">{Number(payout.amount).toFixed(2)}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${payout.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{payout.createdAt ? new Date(payout.createdAt).toLocaleString() : "-"}</td>
                      <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{payout.paidAt ? new Date(payout.paidAt).toLocaleString() : "-"}</td>
                      <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-300">{payout.paymentDetails || "-"}</td>
                      <td className="py-2 pr-4 text-right space-x-2">
                        {payout.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">Awaiting Admin Approval</span>
                        )}
                        {payout.status === "PAID" && (
                          <button type="button" onClick={() => handleDownloadInvoice(payout.id)} disabled={invoiceLoading} className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white"><Download className="h-3.5 w-3.5" /> Download</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "categories" && (
          <div className="overflow-x-auto">
            {categoriesLoading ? (
              <p className="py-6 text-center text-sm text-slate-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <FolderTree className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No categories yet</p>
                <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                  Categories added to your store will appear here.
                </p>
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Slug</th>
                    <th className="py-2 pr-4">Parent</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const cleanPhoto = cat.photo?.replace(/`/g, "").trim();
                    return (
                      <tr key={cat.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                              {cleanPhoto ? (
                                <img src={cleanPhoto} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                <FolderTree className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-slate-50">{cat.name}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-500 dark:text-slate-400">{cat.slug || "—"}</td>
                        <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{cat.parent?.name || "—"}</td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            cat.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          }`}>
                            {cat.isActive ? (
                              <><CheckCircle className="h-3 w-3" /> Active</>
                            ) : (
                              <><Archive className="h-3 w-3" /> Disabled</>
                            )}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-xs text-slate-500 dark:text-slate-400">
                          {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </section>

      {/* Withdrawal Request Modal */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">
              Request Withdrawal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Withdrawable balance:{" "}
              <strong className="text-slate-800 dark:text-slate-100">{summary?.pendingPayoutAmount ?? 0}</strong>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              You can submit one withdrawal request every 7 days. Admin will review and transfer the amount.
            </p>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
              Your Payment Details (bKash / Bank Account)
            </label>
            <textarea
              rows={4}
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="Example:\nbKash: 01XXXXXXXXX (Personal)\nor\nBank: BRAC Bank, A/C Name, A/C No, Branch"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setWithdrawalModalOpen(false); setPaymentDetails(""); }}
                className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestWithdrawal}
                disabled={requestingPayout}
                className="px-3 py-1.5 rounded-full bg-emerald-600 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {requestingPayout ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResellerDashboardPage;
