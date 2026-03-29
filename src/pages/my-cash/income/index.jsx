import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetCashSummaryQuery,
  useGetIncomesQuery,
  useCreateIncomeMutation,
  useUpdateIncomeMutation,
  useDeleteIncomeMutation,
} from "@/features/cash/cashApiSlice";

const INCOME_CATEGORIES = [
  "Sale Invoice",
  "Service Fee",
  "Consulting",
  "Commission",
  "Refund Received",
  "Other Income",
];

const emptyForm = {
  title: "",
  amount: "",
  category: "",
  note: "",
  date: new Date().toISOString().split("T")[0],
};

const IncomePage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const companyId = authUser?.companyId;

  const { data: summary, isLoading: summaryLoading } = useGetCashSummaryQuery(
    { companyId },
    { skip: !companyId }
  );
  const { data: incomes = [], isLoading } = useGetIncomesQuery(
    { companyId },
    { skip: !companyId }
  );

  const [createIncome, { isLoading: creating }] = useCreateIncomeMutation();
  const [updateIncome, { isLoading: updating }] = useUpdateIncomeMutation();
  const [deleteIncome] = useDeleteIncomeMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      amount: item.amount,
      category: item.category ?? "",
      note: item.note ?? "",
      date: item.date,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.date) {
      toast.error("Title, amount and date are required.");
      return;
    }
    try {
      if (editingId) {
        await updateIncome({ id: editingId, ...form, amount: Number(form.amount) }).unwrap();
        toast.success("Income entry updated");
      } else {
        await createIncome({ ...form, amount: Number(form.amount), companyId }).unwrap();
        toast.success("Income entry added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to save income entry");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIncome(id).unwrap();
      toast.success("Income entry deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete income entry");
    }
  };

  const totalIncome = summary?.totalIncome ?? 0;
  const invoiceIncome = summary?.invoiceIncome ?? 0;
  const manualIncome = summary?.manualIncome ?? 0;
  const netCash = summary?.netCash ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Income
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track invoice income and add manual income entries.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Income</span>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {summaryLoading ? "..." : `৳ ${Number(totalIncome).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Invoice + Manual</p>
        </div>

        {/* Invoice Income */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">From Invoices</span>
            <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {summaryLoading ? "..." : `৳ ${Number(invoiceIncome).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">Auto from sale invoices</p>
        </div>

        {/* Manual Income */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Manual Income</span>
            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-xl">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {summaryLoading ? "..." : `৳ ${Number(manualIncome).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">{incomes.length} manual entries</p>
        </div>

        {/* Net Cash */}
        <div className={`rounded-2xl p-5 shadow-sm border ${netCash >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Net Cash</span>
            <div className={`p-2 rounded-xl ${netCash >= 0 ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-rose-100 dark:bg-rose-500/20"}`}>
              <ArrowUpRight className={`w-4 h-4 ${netCash >= 0 ? "text-emerald-600" : "text-rose-600 rotate-90"}`} />
            </div>
          </div>
          <p className={`text-2xl font-extrabold ${netCash >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
            {summaryLoading ? "..." : `৳ ${Math.abs(netCash).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {netCash >= 0 ? "Profit" : "Deficit"} · Expense: ৳{Number(totalExpense).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Manual Income Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm">Manual Income Entries</h2>
          <span className="text-xs text-gray-400">{incomes.length} entries</span>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : incomes.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No manual income yet. Click "Add Income" to start.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {incomes.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800 dark:text-white">{item.title}</p>
                      {item.note && <p className="text-xs text-gray-400 truncate max-w-[200px]">{item.note}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{item.category || "—"}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{item.date}</td>
                    <td className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      ৳ {Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                {editingId ? "Edit Income Entry" : "Add Income Entry"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Consulting Fee"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Amount (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select category</option>
                  {INCOME_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Optional note..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {creating || updating ? "Saving..." : editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Delete Income Entry?</h3>
            <p className="text-sm text-gray-500">This will reduce your total income.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomePage;
