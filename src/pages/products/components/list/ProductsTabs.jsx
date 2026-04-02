import React from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";

export default function ProductsTabs({
  activeTab,
  onTabChange,
  publishedCount = 0,
  draftsCount = 0,
  trashCount = 0,
  pendingCount = 0,
  isReseller = false,
}) {
  const { t } = useTranslation();
  
  const TABS = [
    { key: "published", label: t("products.published") },
    { key: "drafts", label: t("products.drafts") },
    ...(isReseller ? [] : [{ key: "pending", label: "Pending Approval", isPending: true }]),
    { key: "trash", label: t("products.trash") },
  ];
  
  const counts = {
    published: publishedCount,
    drafts: draftsCount,
    trash: trashCount,
    pending: pendingCount,
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex-wrap">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === tab.key
              ? tab.isPending
                ? "bg-white dark:bg-[#1a1f26] text-amber-600 shadow-sm"
                : "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {tab.isPending && <Clock className="w-3.5 h-3.5" />}
          {tab.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-md ${
              activeTab === tab.key
                ? tab.isPending
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                  : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                : counts[tab.key] > 0 && tab.isPending
                  ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 animate-pulse"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            {counts[tab.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
