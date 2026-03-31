import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
  useGetOrdersQuery,
  useDeleteOrderMutation,
  useConvertOrderMutation,
} from "@/features/order/orderApiSlice";
import { useSendCustomerEmailNotificationMutation } from "@/features/notifications/notificationsApiSlice";
import { useGetSettingsQuery } from "@/features/setting/settingApiSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import TextField from "@/components/input/TextField";
import RichTextEditor from "@/components/input/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Send, Mail, ShoppingCart, Users, Clock, TrendingUp, Download } from "lucide-react";
import DeleteModal from "@/components/modals/DeleteModal";
import useOrdersTable from "@/pages/orders/hooks/useOrdersTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount) => {
  if (!amount) return "৳0";
  return `৳${Number(amount).toLocaleString("en-BD")}`;
};

// ─── Stats Card ────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
    </div>
  </div>
);

// ─── Row Component ─────────────────────────────────────────────────────────────

const IncompleteOrderRow = ({ order, onConvert, onDelete, onWhatsApp, onEmail, isConverting }) => {
  const { t } = useTranslation();
  const phone = order.customer?.phone || order.customerPhone || order.shippingPhone || "";
  const name = order.customer?.name || order.customerName || "—";
  const email = order.customer?.email || order.customerEmail || "—";
  const items = order.orderItems || order.items || [];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Order Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              #{order.id}
            </span>
            <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
          </div>

          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{name}</p>
            <p className="text-sm text-gray-500">{phone || "No phone"}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {items.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Items:</p>
              <div className="flex flex-wrap gap-1">
                {items.slice(0, 3).map((item, i) => (
                  <span key={i} className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {item.productName || item.name || item.product?.name || "Product"} × {item.quantity || 1}
                  </span>
                ))}
                {items.length > 3 && (
                  <span className="text-xs text-gray-400">+{items.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Amount + Actions */}
        <div className="flex flex-col items-end gap-3">
          <p className="text-lg font-bold text-gray-800 dark:text-white">
            {formatCurrency(order.totalAmount)}
          </p>

          <div className="flex flex-wrap gap-2 justify-end">
            {/* WhatsApp */}
            {phone && (
              <button
                onClick={() => onWhatsApp(order)}
                className="flex items-center gap-1.5 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.827L0 24l6.343-1.498A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.012-1.374l-.36-.213-3.733.881.932-3.64-.235-.374A9.79 9.79 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                WhatsApp
              </button>
            )}

            {/* Email */}
            <button
              onClick={() => onEmail(order)}
              className="flex items-center gap-1.5 text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              Email
            </button>

            {/* Convert */}
            <button
              onClick={() => onConvert(order)}
              disabled={isConverting}
              className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Convert to Order
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(order)}
              className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Email Modal ───────────────────────────────────────────────────────────────

const EmailFollowUpModal = ({ isOpen, onClose, order, onConfirm, isLoading }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { subject: "", body: "", html: "" },
  });

  useEffect(() => {
    if (isOpen && order) {
      const name = order.customer?.name || order.customerName || "Customer";
      const items = order.orderItems || order.items || [];

      const productLines = items.length > 0
        ? items.map((item) => {
            const productName = item.productName || item.name || item.product?.name || "Product";
            const qty = item.quantity || 1;
            const price = item.price || item.unitPrice || item.salePrice || 0;
            return `  • ${productName} × ${qty}${price ? ` = ৳${Number(price * qty).toLocaleString("en-BD")}` : ""}`;
          }).join("\n")
        : "  • (No items found)";

      const total = order.totalAmount
        ? `৳${Number(order.totalAmount).toLocaleString("en-BD")}`
        : "";

      reset({
        subject: `আপনার অর্ডারটি সম্পন্ন করুন – আমরা আপনার জন্য অপেক্ষা করছি!`,
        body: [
          `প্রিয় ${name},`,
          ``,
          `আমরা লক্ষ্য করেছি যে আপনি আমাদের স্টোর থেকে অর্ডার করতে গিয়েছিলেন কিন্তু অর্ডারটি সম্পন্ন করেননি।`,
          ``,
          `📦 আপনার নির্বাচিত পণ্যসমূহ:`,
          productLines,
          total ? `\n💰 মোট: ${total}` : "",
          ``,
          `আপনার যদি কোনো সমস্যা হয়ে থাকে বা সাহায্যের প্রয়োজন হয়, অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।`,
          ``,
          `ধন্যবাদ,`,
          `সাপোর্ট টিম`,
        ].join("\n"),
        html: "",
      });
    }
  }, [isOpen, order, reset]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Send Follow-Up Email
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4 mt-2">
          <TextField
            label="Subject"
            {...register("subject", { required: "Subject is required" })}
            error={errors.subject?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea
              {...register("body", { required: "Message is required" })}
              rows={5}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-xl p-3 text-sm bg-white dark:bg-neutral-900 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Send className="w-4 h-4" />
              {isLoading ? "Sending..." : "Send Email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const IncompleteOrdersPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const { data: orders = [], isLoading } = useGetOrdersQuery({ companyId: authUser?.companyId });
  const { data: settings = [] } = useGetSettingsQuery();
  const smtpConfig = settings?.[0] || {};

  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [convertOrder, { isLoading: isConverting }] = useConvertOrderMutation();
  const [sendEmail, { isLoading: isSendingEmail }] = useSendCustomerEmailNotificationMutation();

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });
  const [emailModal, setEmailModal] = useState({ isOpen: false, order: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filter only incomplete orders
  const incompleteOrders = useMemo(() => {
    let result = orders.filter((o) => o.status?.toLowerCase() === "incomplete");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) => {
        const id = String(o.id || "").toLowerCase();
        const name = (o.customer?.name || o.customerName || "").toLowerCase();
        const phone = (o.customer?.phone || o.customerPhone || "").toLowerCase();
        const email = (o.customer?.email || o.customerEmail || "").toLowerCase();
        return id.includes(q) || name.includes(q) || phone.includes(q) || email.includes(q);
      });
    }

    if (dateRange.start) {
      result = result.filter((o) => o.createdAt && new Date(o.createdAt) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      result = result.filter((o) => o.createdAt && new Date(o.createdAt) <= new Date(new Date(dateRange.end).setHours(23, 59, 59, 999)));
    }

    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, searchQuery, dateRange]);

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(incompleteOrders.length / PAGE_SIZE));
  const pagedOrders = incompleteOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Stats
  const stats = useMemo(() => {
    const all = orders.filter((o) => o.status?.toLowerCase() === "incomplete");
    const totalValue = all.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const uniqueCustomers = new Set(all.map((o) => o.customer?.phone || o.customerPhone).filter(Boolean)).size;
    const today = all.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    return { total: all.length, totalValue, uniqueCustomers, today };
  }, [orders]);

  const handleConvert = async (order) => {
    try {
      await convertOrder({ id: order.id }).unwrap();
      toast.success("Order converted successfully!");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to convert order");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder({ id: deleteModal.order.id });
    if (res?.data || !res?.error) {
      toast.success("Incomplete order deleted");
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to delete");
    }
  };

  const handleExportExcel = () => {
    if (incompleteOrders.length === 0) {
      toast.error("No incomplete orders to export");
      return;
    }
    const cols = ["Order ID", "Date", "Customer Name", "Phone", "Email", "Address", "Total Amount", "Items", "Created At"];
    const rows = incompleteOrders.map((o) => {
      const items = (o.orderItems || o.items || []).map((i) => `${i.productName || i.name || "Product"} x${i.quantity || 1}`).join(" | ");
      return [
        o.id || "",
        o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "",
        o.customer?.name || o.customerName || "",
        o.customer?.phone || o.customerPhone || "",
        o.customer?.email || o.customerEmail || "",
        o.customerAddress || o.billingAddress || "",
        Number(o.totalAmount || 0),
        items,
        o.createdAt ? new Date(o.createdAt).toLocaleString("en-GB") : "",
      ];
    });
    const csv = [
      cols.join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incomplete-orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${incompleteOrders.length} orders to Excel`);
  };

  const handleWhatsApp = (order) => {
    const phone = order.customer?.phone || order.customerPhone || order.shippingPhone || "";
    if (!phone) { toast.error("No phone number found"); return; }

    const name = order.customer?.name || order.customerName || "Customer";
    const items = order.orderItems || order.items || [];

    // Build product list lines
    const productLines = items.length > 0
      ? items.map((item) => {
          const productName = item.productName || item.name || item.product?.name || "Product";
          const qty = item.quantity || 1;
          const price = item.price || item.unitPrice || item.salePrice || 0;
          return `  • ${productName} × ${qty}${price ? ` = ৳${Number(price * qty).toLocaleString("en-BD")}` : ""}`;
        }).join("\n")
      : "  • (No items found)";

    const total = order.totalAmount ? `৳${Number(order.totalAmount).toLocaleString("en-BD")}` : "";

    const msg = [
      `হ্যালো ${name}! 😊`,
      ``,
      `আমরা দেখলাম আপনি আমাদের স্টোর থেকে অর্ডার করতে গিয়েছিলেন কিন্তু সম্পন্ন করেননি।`,
      ``,
      `📦 আপনার নির্বাচিত পণ্যসমূহ:`,
      productLines,
      total ? `\n💰 মোট: ${total}` : "",
      ``,
      `আপনার কি কোনো সাহায্য দরকার? আমরা আপনাকে সহায়তা করতে প্রস্তুত! 🙏`,
    ].filter((line) => line !== undefined).join("\n");

    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleEmailSubmit = async (values) => {
    const payload = {
      subject: values.subject.trim(),
      body: values.body.trim(),
      customerIds: [emailModal.order?.customerId],
      ...(smtpConfig.smtpUser ? { smtpUser: smtpConfig.smtpUser } : {}),
      ...(smtpConfig.smtpPass ? { smtpPass: smtpConfig.smtpPass } : {}),
    };
    try {
      await sendEmail(payload).unwrap();
      toast.success("Follow-up email sent!");
      setEmailModal({ isOpen: false, order: null });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to send email");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("orders.incompleteTitle") || "Incomplete Orders"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t("orders.incompleteSubtitle") || "Follow up with customers who didn't complete their checkout"}
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={incompleteOrders.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Incomplete" value={stats.total} color="bg-amber-500" />
        <StatCard icon={Clock} label="Today" value={stats.today} color="bg-blue-500" />
        <StatCard icon={Users} label="Unique Customers" value={stats.uniqueCustomers} color="bg-violet-500" />
        <StatCard icon={TrendingUp} label="Total Value" value={formatCurrency(stats.totalValue)} color="bg-emerald-500" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, phone, email, order ID..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="flex-1 border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-gray-400"
        />
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => { setDateRange((p) => ({ ...p, start: e.target.value })); setCurrentPage(1); }}
          className="border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => { setDateRange((p) => ({ ...p, end: e.target.value })); setCurrentPage(1); }}
          className="border border-gray-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-neutral-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={() => setDateRange({ start: "", end: "" })}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-2 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900"
          >
            Clear
          </button>
        )}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : incompleteOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-neutral-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No incomplete orders found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Incomplete orders will appear here when customers abandon checkout</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Records info */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {incompleteOrders.length} record{incompleteOrders.length !== 1 ? "s" : ""} found
              {totalPages > 1 && (
                <span className="ml-2 text-gray-400">
                  — Page {currentPage} of {totalPages}
                </span>
              )}
            </p>
          </div>

          {/* Order rows */}
          {pagedOrders.map((order) => (
            <IncompleteOrderRow
              key={order.id}
              order={order}
              onConvert={handleConvert}
              onDelete={(o) => setDeleteModal({ isOpen: true, order: o })}
              onWhatsApp={handleWhatsApp}
              onEmail={(o) => setEmailModal({ isOpen: true, order: o })}
              isConverting={isConverting}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "…" ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`min-w-[34px] px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        currentPage === item
                          ? "bg-violet-600 border-violet-600 text-white font-semibold"
                          : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )
              }

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title="Delete Incomplete Order"
        description="Are you sure you want to delete this incomplete order?"
        itemName={deleteModal.order ? `Order #${deleteModal.order.id}` : ""}
        isLoading={isDeleting}
      />

      <EmailFollowUpModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ isOpen: false, order: null })}
        order={emailModal.order}
        onConfirm={handleEmailSubmit}
        isLoading={isSendingEmail}
      />
    </div>
  );
};

export default IncompleteOrdersPage;
