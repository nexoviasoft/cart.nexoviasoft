import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Receipt,
  Plus,
  Pencil,
  Trash2,
  X,
  TrendingDown,
  AlertCircle,
  Download,
} from "lucide-react";
import { downloadInvoice } from "@/utils/downloadInvoice";
import toast from "react-hot-toast";
import {
  useGetExpensesQuery,
  useGetCashSummaryQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "@/features/cash/cashApiSlice";

const CATEGORIES = [
  "Office Supplies",
  "Rent",
  "Salaries",
  "Utilities",
  "Marketing",
  "Logistics",
  "Miscellaneous",
];

const emptyForm = {
  title: "",
  amount: "",
  category: "",
  note: "",
  date: new Date().toISOString().split("T")[0],
};

const ExpensePage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const companyId = authUser?.companyId;

  const { data: expenses = [], isLoading } = useGetExpensesQuery(
    { companyId },
    { skip: !companyId }
  );
  const { data: summary } = useGetCashSummaryQuery(
    { companyId },
    { skip: !companyId }
  );

  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
  const [deleteExpense] = useDeleteExpenseMutation();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (exp) => {
    setEditingId(exp.id);
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category ?? "",
      note: exp.note ?? "",
      date: exp.date,
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
        await updateExpense({ id: editingId, ...form, amount: Number(form.amount) }).unwrap();
        toast.success("Expense updated");
      } else {
        await createExpense({ ...form, amount: Number(form.amount), companyId }).unwrap();
        toast.success("Expense added");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to save expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id).unwrap();
      toast.success("Expense deleted");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const totalExpense = summary?.totalExpense ?? 0;

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-rose-500" />
            Expense Tracker
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Internal expense entries — not connected to any external system.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Total Expense Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4 max-w-sm">
        <div className="p-3 bg-rose-100 dark:bg-rose-500/10 rounded-xl">
          <Receipt className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Total Expense</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            ৳ {Number(totalExpense).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white text-sm">All Expenses</h2>
        </div>
        {isLoading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No expenses yet. Click "Add Expense" to start tracking.</p>
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
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800 dark:text-white">{exp.title}</p>
                      {exp.note && <p className="text-xs text-gray-400 truncate max-w-[200px]">{exp.note}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{exp.category || "—"}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{exp.date}</td>
                    <td className="px-5 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                      ৳ {Number(exp.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => downloadInvoice(exp, "expense", authUser?.companyName ?? "My Company")}
                          title="Download Invoice"
                          className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(exp)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(exp.id)}
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
                {editingId ? "Edit Expense" : "Add Expense"}
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
                  placeholder="e.g. Office Rent"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note</label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Optional note..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
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
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
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
            <h3 className="font-semibold text-gray-800 dark:text-white">Delete Expense?</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
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

export default ExpensePage;
