import { useMemo, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetOrdersQuery,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useBarcodeScanMutation,
  useRecordPartialPaymentMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useConvertOrderMutation,
} from "@/features/order/orderApiSlice";
import { useSendCustomerEmailNotificationMutation } from "@/features/notifications/notificationsApiSlice";
import { useGetSettingsQuery } from "@/features/setting/settingApiSlice";
import { useForm, Controller } from "react-hook-form";
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
import { Send, Mail } from "lucide-react";
import { useCreateOrderMutation as useSteadfastCreateOrderMutation } from "@/features/steadfast/steadfastApiSlice";
import { useCreateOrderMutation as usePathaoCreateOrderMutation } from "@/features/pathao/pathaoApiSlice";
import { useCreateParcelMutation as useRedxCreateParcelMutation } from "@/features/redx/redxApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";
import DeleteModal from "@/components/modals/DeleteModal";
import OrdersHeader from "./components/OrdersHeader";
import OrdersStats from "./components/OrdersStats";
import OrdersTableSection from "./components/OrdersTableSection";
import ProcessOrderModal from "./components/ProcessOrderModal";
import ShipOrderModal from "./components/ShipOrderModal";
import DeliverOrderModal from "./components/DeliverOrderModal";
import ExportCourierConfirmModal from "./components/ExportCourierConfirmModal";
import CancelOrderModal from "./components/CancelOrderModal";
import RefundOrderModal from "./components/RefundOrderModal";
import PartialPaymentModal from "./components/PartialPaymentModal";
import BarcodeScanModal from "./components/BarcodeScanModal";
import FraudCheckModal from "./components/FraudCheckModal";
import useOrdersFilters from "./hooks/useOrdersFilters";
import useOrdersTable from "./hooks/useOrdersTable";

const OrdersPage = ({ defaultTab = "All" }) => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrdersQuery({
    companyId: authUser?.companyId,
  });
  const { data: stats = {} } = useGetOrderStatsQuery({
    companyId: authUser?.companyId,
  });
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [barcodeScan, { isLoading: isBarcodeScanning }] =
    useBarcodeScanMutation();
  const [recordPartialPayment, { isLoading: isRecordingPartial }] =
    useRecordPartialPaymentMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [convertOrder, { isLoading: isConverting }] = useConvertOrderMutation();
  const [sendEmail, { isLoading: isSendingEmail }] = useSendCustomerEmailNotificationMutation();
  const { data: settings = [] } = useGetSettingsQuery();
  const smtpConfig = settings?.[0] || {};
  const [steadfastCreateOrder] = useSteadfastCreateOrderMutation();
  const [pathaoCreateOrder] = usePathaoCreateOrderMutation();
  const [redxCreateParcel] = useRedxCreateParcelMutation();

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    order: null,
  });
  const [processModal, setProcessModal] = useState({
    isOpen: false,
    order: null,
  });
  const [shipModal, setShipModal] = useState({ isOpen: false, order: null });
  const [shipForm, setShipForm] = useState({ trackingId: "", provider: "" });
  const [deliverModal, setDeliverModal] = useState({
    isOpen: false,
    order: null,
  });
  const [deliverForm, setDeliverForm] = useState({
    comment: "",
    markAsPaid: true,
  });
  const [barcodeScanModal, setBarcodeScanModal] = useState({
    isOpen: false,
    value: "",
  });
  const [partialPaymentModal, setPartialPaymentModal] = useState({
    isOpen: false,
    order: null,
  });
  const [partialPaymentForm, setPartialPaymentForm] = useState({
    partialAmount: "",
    partialPaymentRef: "",
  });
  const [cancelModal, setCancelModal] = useState({
    isOpen: false,
    order: null,
  });
  const [cancelForm, setCancelForm] = useState({
    comment: "",
  });
  const [refundModal, setRefundModal] = useState({
    isOpen: false,
    order: null,
  });
  const [exportModal, setExportModal] = useState({
    isOpen: false,
    order: null,
  });
  const [fraudCheckModal, setFraudCheckModal] = useState({
    isOpen: false,
    order: null,
  });
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    order: null,
  });

  // Filter states
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    "All",
    "Pending",
    "Processing",
    "Paid",
    "Shipped",
    "Delivered",
    "Cancelled",
    "Refunded",
    "Unpaid",
  ];

  // Calculate counts for each tab
  // For resellers: count from the actual orders array (already backend-filtered to their own orders)
  // For admins: use the fast stats API
  const isReseller = authUser?.role === "RESELLER";
  const tabCounts = useMemo(() => {
    if (isReseller && orders.length >= 0) {
      const countByStatus = (status) =>
        orders.filter((o) => o.status?.toLowerCase() === status.toLowerCase()).length;
      return {
        All: orders.length,
        Pending: countByStatus("pending"),
        Processing: countByStatus("processing"),
        Paid: countByStatus("paid"),
        Shipped: countByStatus("shipped"),
        Delivered: countByStatus("delivered"),
        Cancelled: countByStatus("cancelled"),
        Refunded: countByStatus("refunded"),
        Unpaid: orders.filter((o) => !o.isPaid && o.status?.toLowerCase() !== "cancelled").length,
      };
    }
    return {
      All: stats?.total || 0,
      Pending: stats?.pending || 0,
      Processing: stats?.processing || 0,
      Paid: stats?.paid || 0,
      Shipped: stats?.shipped || 0,
      Delivered: stats?.delivered || 0,
      Cancelled: stats?.cancelled || 0,
      Refunded: stats?.refunded || 0,
      Unpaid: stats?.unpaidCount || 0,
    };
  }, [isReseller, orders, stats]);

  // Use custom hook for filtering
  const filteredOrders = useOrdersFilters(
    orders,
    activeTab,
    searchQuery,
    sortBy,
    sortOrder,
    dateRange,
  );

  // Helper function to translate order status
  const getStatusLabel = useCallback(
    (status) => {
      if (!status) return t("common.na");
      const statusLower = status.toLowerCase();
      switch (statusLower) {
        case "pending":
          return t("orders.filterPending") || status;
        case "processing":
          return t("orders.filterProcessing") || status;
        case "paid":
          return t("orders.filterPaid") || status;
        case "shipped":
          return t("orders.filterShipped") || status;
        case "delivered":
          return t("orders.filterDelivered") || status;
        case "cancelled":
          return t("orders.filterCancelled") || status;
        case "refunded":
          return t("orders.filterRefunded") || status;
        default:
          return status;
      }
    },
    [t],
  );

  // Use custom hook for table data
  const handleShipModalOpen = useCallback((order) => {
    setShipModal({ isOpen: true, order });
    setShipForm({
      trackingId: order?.shippingTrackingId || "",
      provider: order?.shippingProvider || "",
    });
  }, []);

  const { headers, tableData } = useOrdersTable(
    filteredOrders,
    orders,        // full list for new-vs-returning customer detection
    getStatusLabel,
    setProcessModal,
    handleShipModalOpen,
    setDeliverModal,
    setCancelModal,
    setRefundModal,
    setPartialPaymentModal,
    setDeleteModal,
    async (order) => {
      const canSteadfast = hasPermission(authUser, FeaturePermission.STEARDFAST) || hasPermission(authUser, FeaturePermission.STEADFAST_COURIER);
      const canPathao = hasPermission(authUser, FeaturePermission.PATHAO) || hasPermission(authUser, FeaturePermission.PATHAO_COURIER);
      const canRedx = hasPermission(authUser, FeaturePermission.REDX) || hasPermission(authUser, FeaturePermission.REDX_COURIER);
      if (!canSteadfast && !canPathao && !canRedx) {
        toast.error(t("common.failed"));
        return;
      }
      setExportModal({ isOpen: true, order });
    },
    setFraudCheckModal,
    async (order) => {
      try {
        await convertOrder({ id: order.id }).unwrap();
        toast.success("Order converted successfully");
      } catch (err) {
        toast.error(err?.data?.message || "Failed to convert order");
      }
    },
    (order) => {
      const phone = order.customer?.phone || order.customerPhone || order.shippingPhone || "";
      if (!phone) {
        toast.error("Customer phone number not found");
        return;
      }
      const message = `Hello ${order.customerName || "Customer"}, we noticed you were interested in some items on our store but didn't finish your order. Is there anything we can help you with?`;
      const waUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
    },
    (order) => {
      setEmailModal({ isOpen: true, order });
    }
  );

  // Build the list of courier keys available to the logged-in user
  const availableCouriers = useMemo(() => {
    const list = [];
    if (hasPermission(authUser, FeaturePermission.STEARDFAST) || hasPermission(authUser, FeaturePermission.STEADFAST_COURIER)) list.push("steadfast");
    if (hasPermission(authUser, FeaturePermission.PATHAO) || hasPermission(authUser, FeaturePermission.PATHAO_COURIER)) list.push("pathao");
    if (hasPermission(authUser, FeaturePermission.REDX) || hasPermission(authUser, FeaturePermission.REDX_COURIER)) list.push("redx");
    return list;
  }, [authUser]);

  const performExportCourier = useCallback(
    async (order, courierKey) => {
      const items = order.orderItems || order.items || [];
      const itemDescription =
        items.map((item) => item.productName || item.name || item.product?.name || "Product").join(", ") || "";

      // ── Steadfast ────────────────────────────────────────────────────
      if (courierKey === "steadfast") {
        try {
          const formData = {
            invoice: order.id?.toString() || "",
            recipient_name: order.customer?.name || order.customerName || "",
            recipient_phone: order.customer?.phone || order.shippingPhone || "",
            alternative_phone: order.customer?.phone || "",
            recipient_email: order.customer?.email || order.customerEmail || "",
            recipient_address: order.customerAddress || order.billingAddress || "",
            cod_amount: order.totalAmount ? Number(order.totalAmount) : 0,
            note: order.notes || "",
            item_description: itemDescription,
            total_lot: items?.length ? Number(items.length) : 1,
            delivery_type: 0,
          };
          const result = await steadfastCreateOrder(formData).unwrap();
          if (result.status === 200) {
            toast.success(result.message || t("steadfast.orderCreatedSuccess", "Order created on Steadfast!"));
            const trackingCode = result.consignment?.tracking_code || result.tracking_code;
            const consignmentId = result.consignment?.consignment_id || result.consignment_id;
            try {
              await shipOrder({
                id: order.id,
                body: {
                  shippingTrackingId: trackingCode || consignmentId || "",
                  shippingProvider: "Steadfast",
                  status: "shipped",
                },
              }).unwrap();
              toast.success(t("steadfast.orderStatusUpdated", "Order status updated to Shipped"));
            } catch {
              toast.error(t("steadfast.orderCreatedStatusFailed", "Order created but failed to update status"));
            }
          } else {
            toast.error(result?.data?.message || t("steadfast.createOrderFailed", "Failed to create Steadfast order"));
          }
        } catch (error) {
          toast.error(error?.data?.message || t("steadfast.createOrderFailed", "Failed to create Steadfast order"));
        }
        return;
      }

      // ── Pathao ───────────────────────────────────────────────────────
      if (courierKey === "pathao") {
        try {
          const formData = {
            store_id: localStorage.getItem("pathaoStoreId") || undefined,
            merchant_order_id: order.id?.toString() || "",
            recipient_name: order.customer?.name || order.customerName || "",
            recipient_phone: order.customer?.phone || order.shippingPhone || "",
            recipient_address: order.customerAddress || order.billingAddress || "",
            recipient_city: 1,   // default Dhaka; user can configure via Pathao settings
            recipient_zone: 1,
            delivery_type: 48,   // normal delivery
            item_type: 2,
            special_instruction: order.notes || "",
            item_quantity: items?.length || 1,
            item_weight: 0.5,
            amount_to_collect: order.totalAmount ? Number(order.totalAmount) : 0,
            item_description: itemDescription,
          };
          const result = await pathaoCreateOrder(formData).unwrap();
          const consignmentId = result?.data?.consignment_id || result?.consignment_id;
          const trackingCode = result?.data?.order_tracking_code || result?.order_tracking_code;
          toast.success(t("pathao.orderCreatedSuccess", "Order created on Pathao!"));
          try {
            await shipOrder({
              id: order.id,
              body: {
                shippingTrackingId: trackingCode || consignmentId || "",
                shippingProvider: "Pathao",
                status: "shipped",
              },
            }).unwrap();
            toast.success(t("pathao.orderStatusUpdated", "Order status updated to Shipped"));
          } catch {
            toast.error(t("pathao.orderCreatedStatusFailed", "Order created but failed to update status"));
          }
        } catch (error) {
          toast.error(error?.data?.message || t("pathao.createOrderFailed", "Failed to create Pathao order"));
        }
        return;
      }

      // ── RedX ─────────────────────────────────────────────────────────
      if (courierKey === "redx") {
        try {
          const formData = {
            customer_name: order.customer?.name || order.customerName || "",
            customer_phone: order.customer?.phone || order.shippingPhone || "",
            delivery_area: order.customerAddress || order.billingAddress || "",
            delivery_area_id: localStorage.getItem("redxAreaId") || 508, // default
            merchant_invoice_id: order.id?.toString() || "",
            cash_collection_amount: order.totalAmount ? Number(order.totalAmount) : 0,
            parcel_weight: 500,  // grams
            instruction: order.notes || "",
            value: order.totalAmount ? Number(order.totalAmount) : 0,
          };
          const result = await redxCreateParcel(formData).unwrap();
          const trackingId = result?.data?.tracking_id || result?.tracking_id;
          toast.success(t("redx.orderCreatedSuccess", "Order created on RedX!"));
          try {
            await shipOrder({
              id: order.id,
              body: {
                shippingTrackingId: trackingId || "",
                shippingProvider: "RedX",
                status: "shipped",
              },
            }).unwrap();
            toast.success(t("redx.orderStatusUpdated", "Order status updated to Shipped"));
          } catch {
            toast.error(t("redx.orderCreatedStatusFailed", "Order created but failed to update status"));
          }
        } catch (error) {
          toast.error(error?.data?.message || t("redx.createOrderFailed", "Failed to create RedX order"));
        }
        return;
      }

      toast.error(t("common.failed"));
    },
    [authUser, shipOrder, steadfastCreateOrder, pathaoCreateOrder, redxCreateParcel, t],
  );

  // Handler functions
  const handleProcess = async () => {
    if (!processModal.order) return;
    const res = await processOrder({ id: processModal.order.id });
    if (res?.data) {
      toast.success(t("orders.orderProcessing"));
      // Only mark as processing here; shipping is handled separately via Ship modal
      setProcessModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder({ id: deleteModal.order.id });
    if (res?.data || !res?.error) {
      toast.success(t("orders.orderDeleted"));
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDeliver = async () => {
    if (!deliverModal.order) return;
    const res = await deliverOrder({
      id: deliverModal.order.id,
      body: {
        comment: deliverForm.comment?.trim() || undefined,
        markAsPaid: deliverForm.markAsPaid,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderDelivered"));
      setDeliverModal({ isOpen: false, order: null });
      setDeliverForm({ comment: "", markAsPaid: true });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleShip = async () => {
    if (!shipModal.order) return;
    const res = await shipOrder({
      id: shipModal.order.id,
      body: {
        trackingId: shipForm.trackingId?.trim() || undefined,
        provider: shipForm.provider?.trim() || undefined,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderShipped"));
      setShipModal({ isOpen: false, order: null });
      setShipForm({ trackingId: "", provider: "" });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handlePartialPayment = async () => {
    if (!partialPaymentModal.order) return;
    const amount = Number(partialPaymentForm.partialAmount);
    if (!amount || amount <= 0) {
      toast.error(
        t("orders.validation.amountRequired") || "Amount is required",
      );
      return;
    }
    const total = Number(partialPaymentModal.order.totalAmount ?? 0);
    const paid = Number(partialPaymentModal.order.paidAmount ?? 0);
    const remaining = total - paid;
    if (amount > remaining) {
      toast.error(
        t("orders.validation.amountExceedsRemaining") ||
          "Amount exceeds remaining balance",
      );
      return;
    }
    const res = await recordPartialPayment({
      id: partialPaymentModal.order.id,
      body: {
        amount,
        paymentRef: partialPaymentForm.partialPaymentRef?.trim() || undefined,
      },
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.partialPaymentRecorded"));
      setPartialPaymentModal({ isOpen: false, order: null });
      setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
    } else {
      toast.error(
        res?.error?.data?.message || t("orders.partialPaymentFailed"),
      );
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.order) return;
    const res = await cancelOrder({
      id: cancelModal.order.id,
      body: {
        comment: cancelForm.comment?.trim() || undefined,
      },
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.orderCancelled"));
      setCancelModal({ isOpen: false, order: null });
      setCancelForm({ comment: "" });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleRefund = async () => {
    if (!refundModal.order) return;
    const res = await refundOrder({
      id: refundModal.order.id,
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.orderRefunded"));
      setRefundModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleBarcodeScan = async (trackingId) => {
    try {
      await barcodeScan({ body: { trackingId } }).unwrap();
      toast.success(t("orders.barcodeScanRecorded"));
      setBarcodeScanModal({ isOpen: false, value: "" });
    } catch (err) {
      toast.error(err?.data?.message || t("common.failed"));
    }
  };

  const handleExport = () => {
    if (filteredOrders.length === 0) {
      toast.error(t("orders.noOrdersToExport") || "No orders to export");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer",
      "Phone",
      "Email",
      "Status",
      "Total Amount",
      "Paid Amount",
      "Is Paid",
      "Tracking ID",
      "Provider",
    ];

    const rows = filteredOrders.map((o) => [
      o.id || "",
      o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "",
      o.customer?.name || o.customerName || "",
      o.customer?.phone || o.customerPhone || "",
      o.customer?.email || o.customerEmail || "",
      o.status || "",
      o.totalAmount || 0,
      o.paidAmount || 0,
      o.isPaid ? "Yes" : "No",
      o.shippingTrackingId || "",
      o.shippingProvider || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(t("orders.exportSuccess") || "Orders exported successfully");
  };

  const onEmailSubmit = async (values) => {
    const payload = {
      subject: values.subject.trim(),
      body: values.body.trim(),
      html: values.html?.trim(),
      customerIds: [emailModal.order?.customerId],
      ...(smtpConfig.smtpUser ? { smtpUser: smtpConfig.smtpUser } : {}),
      ...(smtpConfig.smtpPass ? { smtpPass: smtpConfig.smtpPass } : {}),
    };

    try {
      await sendEmail(payload).unwrap();
      toast.success(t("customers.notifications.emailSuccessFallback"));
      setEmailModal({ isOpen: false, order: null });
    } catch (error) {
      toast.error(error?.data?.message || t("customers.notifications.emailFailedFallback"));
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 space-y-8">
      <OrdersHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        showDatePicker={showDatePicker}
        setShowDatePicker={setShowDatePicker}
        handleExport={handleExport}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title={defaultTab === "Incomplete" ? (t("orders.incompleteTitle") || "Incomplete Orders") : undefined}
        subtitle={defaultTab === "Incomplete" ? (t("orders.incompleteSubtitle") || "Follow up with customers who didn't complete their checkout") : undefined}
      />

      {defaultTab !== "Incomplete" && (
        <OrdersStats
          stats={authUser?.role === "RESELLER" ? {
            total: tabCounts.All,
            pending: tabCounts.Pending,
            processing: tabCounts.Processing,
            paid: tabCounts.Paid,
            shipped: tabCounts.Shipped,
            delivered: tabCounts.Delivered,
            cancelled: tabCounts.Cancelled,
          } : stats}
          isReseller={authUser?.role === "RESELLER"}
        />
      )}

      <OrdersTableSection
        filteredOrders={filteredOrders}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        tabCounts={tabCounts}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        headers={headers}
        tableData={tableData}
        hideTabs={defaultTab === "Incomplete"}
      />

      <ProcessOrderModal
        isOpen={processModal.isOpen}
        onClose={() => setProcessModal({ isOpen: false, order: null })}
        order={processModal.order}
        onConfirm={handleProcess}
        isLoading={isProcessing}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title={t("orders.deleteOrder")}
        description={t("orders.deleteOrderDesc")}
        itemName={deleteModal.order ? `Order #${deleteModal.order.id}` : ""}
        isLoading={isDeleting}
      />

      <ShipOrderModal
        isOpen={shipModal.isOpen}
        onClose={() => {
          setShipModal({ isOpen: false, order: null });
          setShipForm({ trackingId: "", provider: "" });
        }}
        order={shipModal.order}
        form={shipForm}
        setForm={setShipForm}
        onConfirm={handleShip}
        isLoading={isShipping}
      />

      <BarcodeScanModal
        isOpen={barcodeScanModal.isOpen}
        onClose={() => setBarcodeScanModal({ isOpen: false, value: "" })}
        value={barcodeScanModal.value}
        setValue={(val) =>
          setBarcodeScanModal((prev) => ({ ...prev, value: val }))
        }
        onScan={handleBarcodeScan}
        isLoading={isBarcodeScanning}
      />

      <DeliverOrderModal
        isOpen={deliverModal.isOpen}
        onClose={() => {
          setDeliverModal({ isOpen: false, order: null });
          setDeliverForm({ comment: "", markAsPaid: true });
        }}
        order={deliverModal.order}
        form={deliverForm}
        setForm={setDeliverForm}
        onConfirm={handleDeliver}
        isLoading={isDelivering}
      />

      <CancelOrderModal
        isOpen={cancelModal.isOpen}
        onClose={() => {
          setCancelModal({ isOpen: false, order: null });
          setCancelForm({ comment: "" });
        }}
        order={cancelModal.order}
        form={cancelForm}
        setForm={setCancelForm}
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />

      <RefundOrderModal
        isOpen={refundModal.isOpen}
        onClose={() => setRefundModal({ isOpen: false, order: null })}
        order={refundModal.order}
        onConfirm={handleRefund}
        isLoading={isRefunding}
      />

      <ExportCourierConfirmModal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false, order: null })}
        order={exportModal.order}
        availableCouriers={availableCouriers}
        onSelect={async (courierKey) => {
          if (!exportModal.order) return;
          await performExportCourier(exportModal.order, courierKey);
          setExportModal({ isOpen: false, order: null });
        }}
      />

      <PartialPaymentModal
        isOpen={partialPaymentModal.isOpen}
        onClose={() => {
          setPartialPaymentModal({ isOpen: false, order: null });
          setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
        }}
        order={partialPaymentModal.order}
        form={partialPaymentForm}
        setForm={setPartialPaymentForm}
        onConfirm={handlePartialPayment}
        isLoading={isRecordingPartial}
      />

      <FraudCheckModal
        isOpen={fraudCheckModal.isOpen}
        onClose={() => setFraudCheckModal({ isOpen: false, order: null })}
        order={fraudCheckModal.order}
      />

      <EmailFollowUpModal
        isOpen={emailModal.isOpen}
        onClose={() => setEmailModal({ isOpen: false, order: null })}
        order={emailModal.order}
        onConfirm={onEmailSubmit}
        isLoading={isSendingEmail}
      />
    </div>
  );
};

const EmailFollowUpModal = ({ isOpen, onClose, order, onConfirm, isLoading }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      subject: t("orders.emailFollowUpSubject") || "Follow up on your order",
      body: t("orders.emailFollowUpBody", { name: order?.customerName || "Customer" }) || `Hello ${order?.customerName || "Customer"},\n\nWe noticed you didn't complete your order. Is there anything we can help you with?\n\nBest regards,\nSupport Team`,
      html: "",
    },
  });

  useEffect(() => {
    if (isOpen && order) {
      reset({
        subject: t("orders.emailFollowUpSubject") || "Follow up on your order",
        body: t("orders.emailFollowUpBody", { name: order.customerName || "Customer" }) || `Hello ${order.customerName || "Customer"},\n\nWe noticed you didn't complete your order. Is there anything we can help you with?\n\nBest regards,\nSupport Team`,
        html: "",
      });
    }
  }, [isOpen, order, reset, t]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("orders.emailFollowUpTitle") || "Send Follow-up Email"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onConfirm)} className="space-y-4">
          <TextField
            label="Customer Email"
            value={order?.customerEmail || order?.customer?.email || "N/A"}
            disabled
          />
          <TextField
            label="Subject"
            register={register}
            name="subject"
            error={errors.subject}
            registerOptions={{ required: "Subject is required" }}
          />
          <TextField
            label="Plain Text Body"
            multiline
            rows={4}
            register={register}
            name="body"
            error={errors.body}
            registerOptions={{ required: "Body is required" }}
          />
          <Controller
            name="html"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="HTML Body (Optional)"
                value={field.value}
                onChange={field.onChange}
                height="250px"
              />
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Send className="w-4 h-4" />
              {isLoading ? (t("common.sending") || "Sending...") : (t("common.sendEmail") || "Send Email")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrdersPage;
