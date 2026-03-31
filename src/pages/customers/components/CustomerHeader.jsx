import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerNotifications from "./CustomerNotifications";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import {
  hasPermission,
  FeaturePermission,
} from "@/constants/feature-permission";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Sheet } from "lucide-react";

const CustomerHeader = ({ onExport }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const canCreateCustomer = hasPermission(user, FeaturePermission.CUSTOMERS);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
      {/* ── Title block ── */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {t("customers.pageTitlePrefix")} {t("customers.pageTitleHighlight")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            {t("customers.pageSubtitle")}
          </p>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-2">
        <LanguageSwitcher variant="compact" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1f26] text-xs font-medium flex items-center gap-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
            >
              <Download className="w-3.5 h-3.5" />
              {t("common.export")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={() => onExport("pdf")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-500" />
              <span>{t("customers.exportToPdf")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("excel")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sheet className="w-4 h-4 text-emerald-500" />
              <span>{t("customers.exportToExcel")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("excel-name-phone")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sheet className="w-4 h-4 text-emerald-500" />
              <span>{t("customers.exportNamePhone")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onExport("excel-name-email")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Sheet className="w-4 h-4 text-emerald-500" />
              <span>{t("customers.exportNameEmail")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <CustomerNotifications />

        {canCreateCustomer && (
          <Button
            size="md"
            className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            onClick={() => navigate("/customers/create")}
          >
            <Plus className="w-3.5 h-3.5" />
            {t("customers.addCustomer")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;
