import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useGetSettingsQuery,
  useUpsertSmtpMutation,
} from "@/features/setting/settingApiSlice";

const SmtpSettings = () => {
  const { data: settings = [], isLoading } = useGetSettingsQuery();
  const [upsertSmtp, { isLoading: isSaving }] = useUpsertSmtpMutation();

  const firstSetting = settings?.[0] ?? null;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      smtpUser: "",
      smtpPass: "",
    },
  });

  useEffect(() => {
    if (firstSetting) {
      reset({
        smtpUser: firstSetting.smtpUser ?? "",
        smtpPass: firstSetting.smtpPass ?? "",
      });
    }
  }, [firstSetting, reset]);

  const onSubmit = async (data) => {
    try {
      await upsertSmtp({
        smtpUser: data.smtpUser?.trim() || null,
        smtpPass: data.smtpPass || null,
      }).unwrap();
      toast.success("SMTP saved");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to save SMTP");
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
            <Mail className="h-6 w-6" />
          </div>
          SMTP
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          Set email credentials used to send customer notifications.
        </p>
      </div>

      <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="smtpUser" className="ml-1">
                SMTP User (Email)
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="smtpUser"
                  type="email"
                  className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                  placeholder="your@gmail.com"
                  autoComplete="off"
                  {...register("smtpUser")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtpPass" className="ml-1">
                SMTP Password (App Password)
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="smtpPass"
                  type="password"
                  className="h-12 pl-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                  placeholder="••••••••••••••••"
                  autoComplete="new-password"
                  {...register("smtpPass")}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default SmtpSettings;

