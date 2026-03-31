import { Calendar, Download, Plus, PackageSearch, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrdersSearchBar from "./OrdersSearchBar";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

const OrdersHeader = ({
  dateRange,
  setDateRange,
  showDatePicker,
  setShowDatePicker,
  handleExport,
  searchQuery,
  setSearchQuery,
  title,
  subtitle,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const canCreateOrder = hasPermission(user, FeaturePermission.ORDER_CREATION_MANUAL);
  const canTrackOrder = hasPermission(user, FeaturePermission.ORDER_TRACKING);

  return (
    <div className="space-y-6">
      {/* Title + Compact Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 grid place-items-center">
            <PackageSearch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {title || t("orders.title") || "Orders"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              {subtitle || "Manage and track orders"}
            </p>
          </div>
        </div>
        {/* Desktop compact search */}
        <div className="hidden md:block w-full md:max-w-[520px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder={
                t("orders.searchPlaceholder") ||
                "Search orders by ID, customer, phone, tracking"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm hover:shadow-md text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                aria-label={t("common.clear") || "Clear search"}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Mobile search under title */}
      <div className="md:hidden">
        <OrdersSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Actions Toolbar Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
        {/* Left: Date Range Picker */}
        <div className="flex items-center w-full lg:w-auto">
          <DropdownMenu open={showDatePicker} onOpenChange={setShowDatePicker}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-700 dark:text-slate-200 max-w-[200px] sm:max-w-none truncate text-left">
                  {dateRange.start && dateRange.end
                    ? `${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date(dateRange.end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                    : dateRange.start
                      ? `From ${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                      : t("orders.selectDateRange") || "Select Date Range"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 p-4 rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="pb-2 text-base">{t("orders.dateRange") || "Date Range"}</DropdownMenuLabel>
              <div className="space-y-4 mt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                      {t("orders.startDate") || "Start Date"}
                    </label>
                    <input
                      type="date"
                      value={dateRange.start || ""}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, start: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                      {t("orders.endDate") || "End Date"}
                    </label>
                    <input
                      type="date"
                      value={dateRange.end || ""}
                      onChange={(e) =>
                        setDateRange((prev) => ({ ...prev, end: e.target.value }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange({ start: null, end: null });
                      setShowDatePicker(false);
                    }}
                    className="flex-1 text-xs h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    {t("common.clear") || "Clear"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowDatePicker(false)}
                    className="flex-1 text-xs h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    {t("common.apply") || "Apply"}
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            {t("orders.export") || "Export"}
          </Button>
          {canTrackOrder && (
            <Button
              onClick={() => navigate("/orders/track")}
              variant="outline"
              className="h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              <PackageSearch className="w-4 h-4 mr-2 text-slate-500" />
              {t("orders.trackOrder") || "Track Order"}
            </Button>
          )}
        
            <Button
              onClick={() => navigate("/orders/create")}
              className="h-10 rounded-xl bg-[#5347CE] hover:bg-[#4338ca] text-white text-sm font-bold px-6 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] w-full sm:w-auto"
            >
              Create order
            </Button>
          
        </div>
      </div>
    </div>
  );
};

export default OrdersHeader;
