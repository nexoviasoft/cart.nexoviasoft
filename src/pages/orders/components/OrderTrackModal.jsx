import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLazyTrackOrderUnifiedQuery } from "@/features/order/orderApiSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Package,
  Truck,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STATUS_BN = {
  "in transit": "পথ অতিক্রমণ করছে",
  "in-transit": "পথ অতিক্রমণ করছে",
  delivered: "ডেলিভারি সম্পন্ন",
  shipped: "পাঠানো হয়েছে",
  processing: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
  paid: "পেইড",
  cancelled: "বাতিল",
  refunded: "রিফান্ড",
  "out for delivery": "ডেলিভারির জন্য বের হয়েছে",
  "out-for-delivery": "ডেলিভারির জন্য বের হয়েছে",
  "not found": "পাওয়া যায়নি",
  error: "ত্রুটি",
};

const OrderTrackModal = ({ isOpen, onClose, trackingId }) => {
  const { t, i18n } = useTranslation();
  const [trackOrderUnified, { data: trackData, isLoading }] = useLazyTrackOrderUnifiedQuery();

  useEffect(() => {
    if (isOpen && trackingId) {
      trackOrderUnified(trackingId).catch(() => {});
    }
  }, [isOpen, trackingId, trackOrderUnified]);

  const order = trackData;
  const isFound = order && order.courier !== "Unknown";

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      delivered:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      "in transit":
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      shipped:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      processing:
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      pending:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      cancelled:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      refunded:
        "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
      "not found":
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      error:
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return (
      map[s] ??
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    );
  };

  const getCourierColor = (courier) => {
    const c = (courier || "").toLowerCase();
    const map = {
      redx: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      steadfast:
        "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
      pathao:
        "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      squadcart:
        "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
    };
    return (
      map[c] ??
      "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800"
    );
  };

  const getProgressSteps = (currentStatus) => {
    const steps = [
      { id: "pending", label: t("orders.progress.placed") || "Placed" },
      { id: "processing", label: t("orders.progress.processing") || "Processing" },
      { id: "shipped", label: t("orders.progress.shipped") || "Shipped" },
      { id: "delivered", label: t("orders.progress.delivered") || "Delivered" },
    ];

    const status = (currentStatus || "").toLowerCase();
    let currentIndex = 0;

    if (status.includes("deliver")) currentIndex = 3;
    else if (status.includes("ship") || status.includes("transit")) currentIndex = 2;
    else if (status.includes("process")) currentIndex = 1;
    else currentIndex = 0;

    return { steps, currentIndex };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
        <div className="w-full bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Header Section */}
          <div className="relative p-6 md:p-8 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-indigo-900/20 dark:via-slate-900 dark:to-slate-900 border-b border-indigo-50 dark:border-slate-800">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Truck className="w-40 h-40 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="relative z-10 flex flex-col gap-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="w-12 h-12 bg-white dark:bg-slate-800 shadow-sm rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                {t("orders.trackOrder") || "Track Order"}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                Tracking ID: <span className="text-slate-900 dark:text-white font-mono font-bold tracking-wider ml-1">{trackingId || "-"}</span>
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading tracking details...</p>
              </div>
            ) : !isFound ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {t("orders.orderNotFound") || "Order details not found"}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {order?.tracking?.[0]?.messageEn || order?.tracking?.[0]?.messageBn || "We couldn't find any tracking details for this order. It might take some time to update."}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Status summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">{t("orders.courier") || "Courier"}</span>
                    <div className={cn("text-sm font-bold px-3 py-1.5 rounded-lg inline-block", getCourierColor(order.courier))}>
                      {order.courier}
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">{t("common.status") || "Status"}</span>
                    <div className={cn("text-sm font-bold px-3 py-1.5 rounded-lg border inline-flex items-center", getStatusColor(order.status))}>
                      {i18n.language === "bn" && order.status ? (STATUS_BN[order.status?.toLowerCase()] ?? order.status) : order.status}
                    </div>
                  </div>
                  
                  <div className="col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                     <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">
                      {t("orders.estimatedDelivery") || "Estimated Delivery"}
                    </span>
                    <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-violet-500" />
                       {new Date(Date.now() + 86400000 * 3).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-2 md:px-6 py-6 pb-2">
                  <div className="relative flex items-center justify-between w-full">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full" />
                    <div
                      className="absolute left-0 top-1/2 h-1 bg-indigo-500 dark:bg-indigo-400 -z-10 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(getProgressSteps(order.status).currentIndex / 3) * 100}%`,
                      }}
                    />

                    {getProgressSteps(order.status).steps.map((step, idx) => {
                      const { currentIndex } = getProgressSteps(order.status);
                      const isCompleted = idx <= currentIndex;
                      const isCurrent = idx === currentIndex;

                      return (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              "w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-white dark:bg-slate-900",
                              isCompleted
                                ? "border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400"
                                : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600",
                              isCurrent && "scale-110 shadow-lg shadow-indigo-500/20"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 fill-indigo-500 text-white dark:fill-indigo-400 dark:text-slate-900" />
                            ) : (
                              <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] md:text-xs font-semibold transition-colors duration-300 text-center",
                              isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-600"
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timeline */}
                {order.tracking?.length > 0 && (
                  <div className="rounded-2xl bg-indigo-50/30 dark:bg-slate-800/30 p-6 flex-1 min-h-0">
                    <h4 className="text-base font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      {t("orders.trackingHistory") || "Tracking History"}
                    </h4>
                    <div className="relative pl-3 space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100 dark:before:bg-slate-700">
                      {order.tracking.map((d, i) => (
                        <div key={i} className="relative pl-6">
                          <div className="absolute left-[-2px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 dark:border-indigo-400 shadow-sm z-10" />
                          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-50 dark:border-slate-800 shadow-sm text-sm">
                            <div className="flex flex-col gap-1.5 mb-1">
                              {d.status && (
                                <span className="w-fit font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-md">
                                  {d.status}
                                </span>
                              )}
                              <div className="font-semibold text-slate-900 dark:text-white text-base">
                                {(() => {
                                  const statusKey = (d.status || "").toLowerCase().trim();
                                  let customEn = d.messageEn;
                                  let customBn = d.messageBn;
                                  
                                  // Override with custom messages based on status if needed
                                  if (statusKey.includes("transit") || statusKey === "shipped") {
                                    customEn = "In Transit";
                                    customBn = "পথ অতিক্রমণ করছে";
                                  } else if (statusKey.includes("deliver")) {
                                    customEn = "Delivered";
                                    customBn = "ডেলিভারি সম্পন্ন";
                                  } else if (statusKey.includes("pending")) {
                                    customEn = "Pending";
                                    customBn = "অপেক্ষমাণ";
                                  } else if (statusKey.includes("process") || statusKey === "accepted") {
                                    customEn = "Processing";
                                    customBn = "প্রক্রিয়াধীন";
                                  } else if (statusKey.includes("cancel")) {
                                    customEn = "Cancelled";
                                    customBn = "বাতিল";
                                  } else if (statusKey.includes("out for delivery")) {
                                    customEn = "Out For Delivery";
                                    customBn = "ডেলিভারির জন্য বের হয়েছে";
                                  } else if (statusKey.includes("return")) {
                                    customEn = "Returned";
                                    customBn = "ফেরত দেওয়া হয়েছে";
                                  } else if (statusKey.includes("pick")) {
                                    customEn = "Picked Up";
                                    customBn = "পিক আপ করা হয়েছে";
                                  } else if (statusKey.includes("hold")) {
                                    customEn = "On Hold";
                                    customBn = "স্থগিত আছে";
                                  }
                                  
                                  // If API provided descriptive messageEn/messageBn, keep them if it doesn't match a generic status above
                                  // But user strictly asked to show custom message depending on status.
                                  
                                  if (i18n.language === 'bn') {
                                    return customBn || STATUS_BN[statusKey] || d.messageBn || d.messageEn || d.status;
                                  }
                                  return customEn || d.messageEn || d.messageBn || d.status;
                                })()}
                              </div>
                              {d.time && (
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ">
                                  <Clock className="w-3 h-3" />
                                  {new Date(d.time).toLocaleString(
                                    i18n.language === "bn" ? "bn-BD" : undefined,
                                    { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                                  )}
                                </div>
                              )}
                            </div>
                            {d.reason && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800/30 inline-block">
                                {d.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackModal;
