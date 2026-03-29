import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Truck, CheckCircle2, Loader2 } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Courier brand configs                                               */
/* ------------------------------------------------------------------ */
const COURIER_CONFIG = {
  steadfast: {
    key: "steadfast",
    label: "Steadfast",
    subtitle: "Packzy Courier",
    gradient: "from-emerald-500 to-teal-600",
    ring: "ring-emerald-400/40",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#sf)" />
        <defs>
          <linearGradient id="sf" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <path d="M12 20l5 5 11-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  pathao: {
    key: "pathao",
    label: "Pathao",
    subtitle: "Pathao Courier",
    gradient: "from-red-500 to-rose-600",
    ring: "ring-red-400/40",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#pt)" />
        <defs>
          <linearGradient id="pt" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ef4444" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <text x="20" y="26" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold" fontFamily="Arial">P</text>
      </svg>
    ),
  },
  redx: {
    key: "redx",
    label: "RedX",
    subtitle: "RedX Courier",
    gradient: "from-orange-500 to-red-500",
    ring: "ring-orange-400/40",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#rx)" />
        <defs>
          <linearGradient id="rx" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="1" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <text x="20" y="26" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">RX</text>
      </svg>
    ),
  },
};

/* ------------------------------------------------------------------ */
/* CourierSelectionModal                                               */
/* ------------------------------------------------------------------ */
const ExportCourierConfirmModal = ({
  isOpen,
  onClose,
  order,
  availableCouriers = [], // array of courier keys: ["steadfast", "pathao", "redx"]
  onSelect,              // (courierKey) => Promise<void>
}) => {
  const { t } = useTranslation();
  const [submittingKey, setSubmittingKey] = useState(null);

  const handleSelect = async (key) => {
    if (submittingKey) return;
    setSubmittingKey(key);
    try {
      await onSelect(key);
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleClose = () => {
    if (submittingKey) return;
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 pb-8">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-4 w-16 h-16 rounded-full bg-white/5 translate-y-1/2 pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold leading-tight">
                {t("orders.selectCourier") || "Select Courier"}
              </DialogTitle>
              <DialogDescription className="text-white/70 text-sm mt-0.5">
                {order
                  ? `Order #${order.id} · ${order.customer?.name || order.customerName || ""}`
                  : ""}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Courier cards */}
        <div className="p-5 space-y-3 bg-white dark:bg-neutral-900">
          {availableCouriers.length === 0 && (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
              {t("orders.noCourierAvailable") || "No courier services available in your plan."}
            </p>
          )}

          {availableCouriers.map((key) => {
            const cfg = COURIER_CONFIG[key];
            if (!cfg) return null;
            const isLoading = submittingKey === key;
            const isDisabled = !!submittingKey && !isLoading;

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={isDisabled || isLoading}
                className={`
                  group w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                  ${isLoading
                    ? `border-violet-500 bg-violet-50 dark:bg-violet-900/10 ring-4 ${cfg.ring}`
                    : isDisabled
                    ? "border-gray-100 dark:border-neutral-800 opacity-40 cursor-not-allowed bg-white dark:bg-neutral-900"
                    : "border-gray-100 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 bg-white dark:bg-neutral-900 hover:bg-violet-50/30 dark:hover:bg-violet-900/5 cursor-pointer active:scale-[0.98]"
                  }
                `}
              >
                {/* Icon */}
                <div className={`flex-shrink-0 rounded-xl p-0.5 bg-gradient-to-br ${cfg.gradient} shadow-md`}>
                  {cfg.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cfg.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cfg.subtitle}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Available in your plan
                  </span>
                </div>

                {/* Action indicator */}
                <div className="flex-shrink-0 flex items-center">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs font-semibold">Creating…</span>
                    </div>
                  ) : (
                    <div className={`
                      h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200
                      bg-gray-100 dark:bg-neutral-800 group-hover:bg-violet-600 group-hover:text-white
                      text-gray-400 dark:text-gray-500
                    `}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={!!submittingKey}
            className="text-sm text-gray-500"
          >
            {t("common.cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportCourierConfirmModal;
