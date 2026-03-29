import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Shield, Key, Eye, EyeOff, Save, ExternalLink, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  useGetFraudCheckerApiQuery,
  useUpsertFraudCheckerApiMutation,
} from "@/features/setting/settingApiSlice";

const FraudCheckerSettings = () => {
  const [showKey, setShowKey] = useState(false);

  const { data: setting, isLoading } = useGetFraudCheckerApiQuery();
  const [upsertFraudCheckerApi, { isLoading: isSaving }] = useUpsertFraudCheckerApiMutation();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { fraudCheckerApiKey: "" },
  });

  useEffect(() => {
    if (setting) {
      reset({ fraudCheckerApiKey: setting.fraudCheckerApiKey ?? "" });
    }
  }, [setting, reset]);

  const onSubmit = async (data) => {
    try {
      await upsertFraudCheckerApi({
        fraudCheckerApiKey: data.fraudCheckerApiKey?.trim() || null,
      }).unwrap();
      toast.success("Fraud Checker API key saved");
    } catch (err) {
      toast.error(err?.data?.message ?? "Failed to save API key");
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
            <Shield className="h-6 w-6" />
          </div>
          Fraud Checker
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Store your fraudchecker.link API key to enable premium fraud checks through the backend.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p className="font-semibold">How it works</p>
          <p>
            Your API key is stored securely on the server. When you run a fraud check, the backend
            calls fraudchecker.link on your behalf using this key — your key never leaves the server.
          </p>
          <a
            href="https://fraudchecker.link"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium mt-1"
          >
            Get an API key <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fraudCheckerApiKey" className="ml-1">
              Fraud Checker API Key
            </Label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="fraudCheckerApiKey"
                type={showKey ? "text" : "password"}
                className="h-12 pl-12 pr-12 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl"
                placeholder="Enter your API key…"
                autoComplete="off"
                {...register("fraudCheckerApiKey")}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 ml-1">
              Leave blank to use the free public API (rate-limited, no key required).
            </p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default FraudCheckerSettings;
