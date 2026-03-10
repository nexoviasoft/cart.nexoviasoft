import { FileText, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function InvoicesHeader({
  onNewInvoice,
  searchTerm,
  onSearchChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 grid place-items-center">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("invoices.header.title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {t("invoices.header.subtitle")}
          </p>
        </div>
      </div>

      <div className="w-full md:w-auto flex flex-col md:items-end gap-3">
        <div className="w-full md:w-[360px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder={t("invoices.table.searchPlaceholder")}
              value={searchTerm ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>

        <Button
          className="w-full md:w-auto bg-[#5347CE] hover:bg-[#4338ca] text-white px-6 shadow-lg shadow-[#5347CE]/20"
          onClick={onNewInvoice}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("invoices.header.newInvoice")}
        </Button>
      </div>
    </div>
  );
}
