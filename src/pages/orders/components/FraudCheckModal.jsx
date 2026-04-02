import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, Shield, Phone, User, ExternalLink } from "lucide-react";
import { useLazyCheckExternalFraudQuery, useLazyCheckUserRiskQuery } from "@/features/fraud/fraudApiSlice";
import FraudCheckCard from "./FraudCheckCard";

const RISK_THRESHOLD_HIGH = 60;
const RISK_THRESHOLD_MED = 30;

const InternalRiskBadge = ({ score }) => {
  let label, color;
  if (score >= RISK_THRESHOLD_HIGH) {
    label = "High Risk";
    color = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800";
  } else if (score >= RISK_THRESHOLD_MED) {
    label = "Moderate Risk";
    color = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  } else {
    label = "Low Risk";
    color = "bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800";
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {label} ({score}/100)
    </span>
  );
};

const FraudCheckModal = ({ isOpen, onClose, order }) => {
  const { t } = useTranslation();
  const phone = order?.customer?.phone || order?.customerPhone || order?.shippingPhone || "";
  const customerName = order?.customer?.name || order?.customerName || "Customer";

  // Internal fraud check (our DB)
  const [triggerInternal, { data: internalData, isFetching: isInternalLoading, error: internalError }] =
    useLazyCheckUserRiskQuery();

  // External fraudchecker.link check
  const [triggerExternal, { data: externalData, isFetching: isExternalLoading, error: externalError }] =
    useLazyCheckExternalFraudQuery();

  useEffect(() => {
    if (isOpen && phone) {
      triggerInternal({ phone });
      triggerExternal(phone);
    }
  }, [isOpen, phone]);

  if (!isOpen) return null;

  const isLoading = isInternalLoading || isExternalLoading;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Fraud Check
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                <User className="h-3 w-3" />
                {customerName}
                {phone && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <Phone className="h-3 w-3" />
                    {phone}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {!phone ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400 dark:text-gray-500">
              <Phone className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">No phone number available for this order.</p>
            </div>
          ) : isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-28 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
              <div className="h-48 rounded-2xl bg-gray-100 dark:bg-neutral-800" />
            </div>
          ) : (
            <>
              {/* ── Internal Risk ── */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                  Internal Risk Score
                </h3>
                {internalError ? (
                  <div className="rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    Customer not found in your store's records.
                  </div>
                ) : internalData ? (
                  <div className="rounded-2xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <span>{internalData.name || customerName}</span>
                        {internalData.isBanned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                            BANNED
                          </span>
                        )}
                      </div>
                      <InternalRiskBadge score={internalData.riskScore ?? 0} />
                    </div>

                    {internalData.riskReasons?.length > 0 && (
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                        {internalData.riskReasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    )}

                    <div className="pt-2 border-t border-gray-100 dark:border-neutral-700"></div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl text-center">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{internalData.totalOrders ?? 0}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl text-center border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Success</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{internalData.successfulOrders ?? 0}</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-center border border-red-100 dark:border-red-900/30">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Cancelled</p>
                        <p className="text-xl font-bold text-red-700 dark:text-red-300 mt-1">{internalData.cancelledOrders ?? 0}</p>
                      </div>
                    </div>

                    <div className="pt-1">
                      {(() => {
                        const score = internalData.riskScore ?? 0;
                        if (score >= RISK_THRESHOLD_HIGH) {
                          return (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800/50">
                              <strong>Warning:</strong> This customer has a highly unsafe profile. Please verify this order carefully before processing.
                            </div>
                          );
                        } else if (score >= RISK_THRESHOLD_MED) {
                          return (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-100 dark:border-amber-800/50">
                              <strong>Caution:</strong> This customer has a moderate risk profile. Proceed with caution.
                            </div>
                          );
                        } else {
                          return (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-100 dark:border-green-800/50">
                              <strong>Safe:</strong> This customer has a good history. The order looks safe to process.
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                ) : null}
              </section>

              {/* ── External (fraudchecker.link) ── */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    External Fraud Database
                  </h3>

                </div>
                {externalError ? (
                  <div className="rounded-2xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                    Could not reach external fraud service.
                  </div>
                ) : (
                  <FraudCheckCard phone={phone} />
                )}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FraudCheckModal;
