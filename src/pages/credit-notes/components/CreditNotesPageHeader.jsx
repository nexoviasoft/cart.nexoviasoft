import React from "react";
import { useTranslation } from "react-i18next";
import { Download, ChevronDown, FileDown, FileText, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Credit notes page header: title, subtitle, and export dropdown.
 * Target ~150 lines per component.
 */
const CreditNotesPageHeader = ({
  onExportCurrentView,
  onExportAllRecords,
  currentPageRecordCount,
  allFilteredRecordCount,
  searchTerm,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 grid place-items-center">
          <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("creditNotes.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("creditNotes.subtitle")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="hidden md:block w-full md:w-[420px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder={t("creditNotes.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 pl-11 pr-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <Download className="w-4 h-4 mr-2" /> {t("creditNotes.export")}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#976DF7]" />
              {t("creditNotes.exportOptions")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onExportCurrentView}
              className="cursor-pointer hover:bg-[#976DF7]/10 focus:bg-[#976DF7]/10"
            >
              <FileText className="w-4 h-4 mr-2 text-[#976DF7]" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {t("creditNotes.exportCurrentView")}
                </span>
                <span className="text-xs text-gray-500">
                  {currentPageRecordCount || 0} {t("creditNotes.records")}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onExportAllRecords}
              className="cursor-pointer hover:bg-[#976DF7]/10 focus:bg-[#976DF7]/10"
            >
              <FileText className="w-4 h-4 mr-2 text-[#976DF7]" />
              <div className="flex flex-col">
                <span className="font-medium">
                  {t("creditNotes.exportAllRecords")}
                </span>
                <span className="text-xs text-gray-500">
                  {allFilteredRecordCount || 0} {t("creditNotes.records")}
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CreditNotesPageHeader;
