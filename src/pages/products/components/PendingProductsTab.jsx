import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  useGetPendingApprovalProductsQuery,
  usePublishDraftMutation,
  useRejectProductMutation,
} from "@/features/product/productApiSlice";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PendingProductsTab = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data: pendingProducts = [], isLoading } = useGetPendingApprovalProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const [publishDraft] = usePublishDraftMutation();
  const [rejectProduct] = useRejectProductMutation();

  const [rejectModal, setRejectModal] = useState({ isOpen: false, product: null, reason: "" });

  const handleApprove = async (product) => {
    try {
      await publishDraft(product.id).unwrap();
      toast.success(`"${product.name}" approved and published!`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to approve product");
    }
  };

  const handleReject = async () => {
    if (!rejectModal.product) return;
    try {
      await rejectProduct({ id: rejectModal.product.id, reason: rejectModal.reason }).unwrap();
      toast.success(`"${rejectModal.product.name}" rejected`);
      setRejectModal({ isOpen: false, product: null, reason: "" });
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject product");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Clock className="w-5 h-5 animate-spin mr-2" />
        Loading pending approvals...
      </div>
    );
  }

  if (pendingProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
        <CheckCircle className="w-12 h-12 text-emerald-300" />
        <p className="text-base font-medium text-gray-500 dark:text-gray-400">
          No products pending approval
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          All reseller submissions have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <Clock className="w-3 h-3" />
          {pendingProducts.length} Pending
        </span>
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-1 gap-4">
        {pendingProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-900/10 hover:border-amber-200 dark:hover:border-amber-700/50 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">IMG</div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  <Tag className="w-3 h-3" />
                  {product.category?.name || "—"}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {product.reseller?.photo ? (
                    <img
                      src={product.reseller.photo}
                      alt={product.reseller.name}
                      className="w-4 h-4 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                      {product.reseller?.name?.charAt(0)?.toUpperCase() || "R"}
                    </span>
                  )}
                  {product.reseller?.name || `Reseller #${product.resellerId}`}
                  {product.reseller?.email && (
                    <span className="text-gray-400 font-normal">({product.reseller.email})</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  ৳{Number(product.price).toLocaleString()}
                  {product.discountPrice && (
                    <span className="ml-1 text-xs text-gray-400 line-through">
                      ৳{Number(product.discountPrice).toLocaleString()}
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-400">
                  {product.createdAt ? format(new Date(product.createdAt), "MMM dd, yyyy") : "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={() => handleApprove(product)}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectModal({ isOpen: true, product, reason: "" })}
                className="h-8 px-3 rounded-lg border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 text-xs font-semibold flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reject Modal */}
      <Dialog
        open={rejectModal.isOpen}
        onOpenChange={(open) => !open && setRejectModal({ isOpen: false, product: null, reason: "" })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Reject Product
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rejecting <span className="font-semibold text-gray-900 dark:text-white">"{rejectModal.product?.name}"</span>. 
              The product will be moved to trash.
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              rows={3}
              className="resize-none text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModal({ isOpen: false, product: null, reason: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingProductsTab;
