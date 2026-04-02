import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";

const CategoriesHeader = ({ t, onAdd, isReseller = false }) => {
  const { t: translate } = useTranslation();
  const translation = t || translate;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2">
      {/* ── Title block ── */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
          <Tag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className=" text-xl md:text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            {translation("categories.title")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
            {translation("categories.subtitle")}
          </p>
        </div>
      </div>

      {/* ── Action button — hidden for resellers ── */}
      {!isReseller && (
        <Button
          size="sm"
          className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          onClick={onAdd}
        >
          <Plus className="w-3.5 h-3.5" />
          {translation("common.add")} {translation("nav.categories")}
        </Button>
      )}
    </div>
  );
};

export default CategoriesHeader;