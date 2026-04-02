import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Save, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useGetOrderReceiptUrlQuery,
  useUpsertOrderReceiptUrlMutation,
} from "@/features/setting/settingApiSlice";

const ReceiptSettings = () => {
  const { data: settingData, isLoading } = useGetOrderReceiptUrlQuery();
  const [upsertOrderReceiptUrl, { isLoading: isSaving }] = useUpsertOrderReceiptUrlMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      orderReceiptUrl: "",
    },
  });

  useEffect(() => {
    if (settingData) {
      reset({
        orderReceiptUrl: settingData.orderReceiptUrl || "",
      });
    }
  }, [settingData, reset]);

  const onSubmit = async (data) => {
    try {
      await upsertOrderReceiptUrl({
        orderReceiptUrl: data.orderReceiptUrl?.trim() || null,
      }).unwrap();
      toast.success("Receipt Print URL saved successfully");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to save Receipt Print URL");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-10 w-10 border-2 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
            <Printer className="h-6 w-6" />
          </div>
          Receipt & Sticker URL
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Set the redirect URL for the barcode/QR code on your order payment slips and print stickers. When scanned, it will redirect to this URL.
        </p>
      </div>

      <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="orderReceiptUrl" className="ml-1 text-gray-700 dark:text-gray-300">
                Website Redirect URL
              </Label>
              <Input
                id="orderReceiptUrl"
                className="h-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="https://example.com/verify-order"
                autoComplete="off"
                {...register("orderReceiptUrl")}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
                The order ID may be appended to this URL when a sticker is scanned.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ReceiptSettings;
