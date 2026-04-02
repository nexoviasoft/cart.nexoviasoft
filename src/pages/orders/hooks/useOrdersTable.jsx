import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import OrderActionsDropdown from "../components/OrderActionsDropdown";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Cog, AlertTriangle, Eye } from "lucide-react";
import { detectFakeOrder } from "@/utils/fakeOrderDetection";
import { useNavigate } from "react-router-dom";

const useOrdersTable = (
  filteredOrders,
  allOrders,          // full unfiltered orders list for new-vs-returning detection
  getStatusLabel,
  setProcessModal,
  handleShipModalOpen,
  setDeliverModal,
  setCancelModal,
  setRefundModal,
  setPartialPaymentModal,
  setDeleteModal,
  handleExportCourier,
  setFraudCheckModal,
  onConvert,
  onWhatsApp,
  onEmail,
  onTrackOrder,
) => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const isReseller = authUser?.role === "RESELLER";
  const navigate = useNavigate();

  // Build a frequency map: phone → order count across ALL orders
  const customerOrderCount = useMemo(() => {
    const map = {};
    const source = allOrders?.length ? allOrders : filteredOrders;
    source.forEach((o) => {
      const key = o.customer?.phone || o.customerPhone || o.shippingPhone || "";
      if (key) map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [allOrders, filteredOrders]);

  const headers = useMemo(
    () => [
      { header: t("orders.id"), field: "id" },
      { header: t("orders.created"), field: "createdAt" },
      { header: t("orders.customer"), field: "customer" },
      { header: t("orders.paid"), field: "paid" },
      { header: t("orders.total"), field: "total" },
      { header: t("orders.trackingId") || "Tracking ID", field: "trackingId" },
      { header: t("orders.provider") || "Provider", field: "provider" },
      { header: t("orders.items") || "Items", field: "items" },
      { header: t("common.status") || "Fulfilment", field: "status" },
      ...(!isReseller ? [{ header: t("common.actions"), field: "actions" }] : []),
    ],
    [t, isReseller],
  );

  const tableData = useMemo(
    () =>
      filteredOrders.map((o) => ({
          id: (
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 dark:text-gray-100 italic">
                #{o.id}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-all shrink-0 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm"
                onClick={() => navigate(`/orders/${o.id}`)}
                title={t("common.viewDetails", "View Details")}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          ),
          createdAt: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-",
          customer: (() => {
            const name = o.customer?.name ?? o.customerName ?? "-";
            const phone = o.customer?.phone || o.customerPhone || o.shippingPhone || "";
            const count = customerOrderCount[phone] || 1;
            const isNew = count === 1;
            const fakeCheck = detectFakeOrder(o);
            return (
              <div className="flex flex-col gap-1">
                <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {name}
                  {fakeCheck.isFake && (
                    <span 
                      className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded cursor-help"
                      title={fakeCheck.reasons.join("\n")}
                    >
                      <AlertTriangle className="w-3 h-3"/> Fake?
                    </span>
                  )}
                </span>
                <span
                  className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isNew
                      ? "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
                      : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${ isNew ? "bg-sky-500" : "bg-amber-500" }`} />
                  {isNew ? "New Customer" : `Returning (${count}x)`}
                </span>
              </div>
            );
          })(),
          paid: (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                o.isPaid
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-amber-50 text-amber-600 border-amber-100"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  o.isPaid ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {o.isPaid ? "Success" : "Pending"}
            </div>
          ),
          total: (
            <span className="font-bold text-gray-900 dark:text-gray-100">
              ৳{Number(o.totalAmount || 0).toLocaleString()}
            </span>
          ),
          trackingId: (
            <div className="group">
              <span
                className="font-bold text-gray-900 dark:text-gray-100 italic cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5"
                onClick={async () => {
                  const trackingId = o.shippingTrackingId || "";
                  if (trackingId) {
                    try {
                      await navigator.clipboard.writeText(trackingId);
                      toast.success(
                        t("orders.trackingIdCopied") ||
                          "Tracking ID copied to clipboard",
                      );
                    } catch (err) {
                      toast.error(t("common.failed") || "Failed to copy");
                    }
                  }
                }}
                title={
                  o.shippingTrackingId ? "Click to copy tracking ID" : ""
                }
              >
                {o.shippingTrackingId || "-"}
                {o.shippingTrackingId && (
                  <svg
                    className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </span>
            </div>
          ),
          provider: (
            o.shippingProvider ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800 capitalize">
                {o.shippingProvider}
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500">-</span>
            )
          ),
          items: (
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {o.items?.length || 0} items
            </span>
          ),
          status: (
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${["delivered", "paid", "completed", "shipped"].includes(
                o.status?.toLowerCase(),
              )
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-rose-50 text-rose-600 border-rose-100"} ${
                o.status?.toLowerCase() === "shipped"
                  ? "cursor-pointer"
                  : ""
              }`}
              onClick={() => {
                if ((o.status || "").toLowerCase() === "shipped") {
                  handleShipModalOpen(o);
                }
              }}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${["delivered", "paid", "completed", "shipped"].includes(
                  o.status?.toLowerCase(),
                )
                  ? "bg-emerald-500"
                  : "bg-rose-500"}`}
              />
              <span className="capitalize">{getStatusLabel(o.status)}</span>
            </div>
          ),
          actions: isReseller ? null : (
            <div className="flex items-center gap-2">
              {o.status?.toLowerCase() === "incomplete" && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    onClick={() => setProcessModal({ isOpen: true, order: o })}
                    title="Mark as Processing"
                  >
                    <Cog className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => onWhatsApp?.(o)}
                    title="WhatsApp Follow-up"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => onEmail?.(o)}
                    title="Email Follow-up"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </>
              )}
              <OrderActionsDropdown
                order={o}
                onProcess={() => setProcessModal({ isOpen: true, order: o })}
                onShip={() => handleShipModalOpen(o)}
                onExportCourier={() => handleExportCourier?.(o)}
                onDeliver={() => setDeliverModal({ isOpen: true, order: o })}
                onCancel={() => setCancelModal({ isOpen: true, order: o })}
                onRefund={() => setRefundModal({ isOpen: true, order: o })}
                onPartialPayment={() =>
                  setPartialPaymentModal({ isOpen: true, order: o })
                }
                onDelete={() => setDeleteModal({ isOpen: true, order: o })}
                onFraudCheck={() => setFraudCheckModal?.({ isOpen: true, order: o })}
                onConvert={() => onConvert?.(o)}
                onWhatsApp={() => onWhatsApp?.(o)}
                onEmail={() => onEmail?.(o)}
                onTrackOrder={onTrackOrder}
              />
            </div>
          ),
        })),
    [
      filteredOrders,
      allOrders,
      customerOrderCount,
      getStatusLabel,
      setProcessModal,
      handleShipModalOpen,
      setDeliverModal,
      setCancelModal,
      setRefundModal,
      setPartialPaymentModal,
      setDeleteModal,
      handleExportCourier,
      setFraudCheckModal,
      onConvert,
      onWhatsApp,
      onTrackOrder,
      t,
      isReseller,
    ],
  );

  return { headers, tableData };
};

export default useOrdersTable;
