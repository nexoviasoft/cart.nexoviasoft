import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useGetStatsQuery } from "@/features/dashboard/dashboardApiSlice";
import CustomerHeader from "./components/CustomerHeader";
import CustomerFilters from "./components/CustomerFilters";
import CustomerStatsSection from "./components/CustomerStatsSection";
import CustomerTableSection from "./components/CustomerTableSection";
import { exportCustomersToPDF } from "@/utils/pdfExport";
import { exportCustomersToExcel } from "@/utils/excelExport";
import { useSelector } from "react-redux";
import {
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Ban,
  ShoppingBag,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
const CustomersPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const calculateTrend = useCallback((data, dateField) => {
    if (!data?.length) return { value: "0.0%", dir: "right", color: "gray" };

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    let currentCount = 0;
    let lastCount = 0;

    data.forEach((item) => {
      if (!item[dateField]) return;
      const date = new Date(item[dateField]);
      if (
        isWithinInterval(date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        currentCount++;
      } else if (
        isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd })
      ) {
        lastCount++;
      }
    });

    if (lastCount === 0) {
      return currentCount > 0
        ? { value: "+100%", dir: "up", color: "green" }
        : { value: "0.0%", dir: "right", color: "gray" };
    }

    const diff = ((currentCount - lastCount) / lastCount) * 100;
    const dir = diff > 0 ? "up" : diff < 0 ? "down" : "right";
    const color = diff >= 0 ? "green" : "red";

    return {
      value: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
      dir,
      color,
    };
  }, []);

  const SUCCESSFUL_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasSuccessfulOrders"), value: "has" },
      { label: t("customers.noSuccessfulOrders"), value: "none" },
    ],
    [t],
  );

  const CANCELLED_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasCancelledOrders"), value: "has" },
      { label: t("customers.noCancelledOrders"), value: "none" },
    ],
    [t],
  );

  const STATUS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.statusActive"), value: "active" },
      { label: t("customers.statusBanned"), value: "banned" },
      { label: t("customers.statusInactive"), value: "inactive" },
    ],
    [t],
  );

  const [selectedSuccessfulOrders, setSelectedSuccessfulOrders] = useState(
    SUCCESSFUL_ORDERS_OPTIONS[0],
  );
  const [selectedCancelledOrders, setSelectedCancelledOrders] = useState(
    CANCELLED_ORDERS_OPTIONS[0],
  );
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

  const queryParams = useMemo(() => {
    const params = { companyId: authUser?.companyId };
    if (selectedSuccessfulOrders?.value)
      params.successfulOrders = selectedSuccessfulOrders.value;
    if (selectedCancelledOrders?.value)
      params.cancelledOrders = selectedCancelledOrders.value;
    if (selectedStatus?.value === "active") {
      params.isActive = "true";
      params.isBanned = "false";
    } else if (selectedStatus?.value === "banned") {
      params.isBanned = "true";
    } else if (selectedStatus?.value === "inactive") {
      params.isActive = "false";
    }
    return params;
  }, [
    authUser?.companyId,
    selectedSuccessfulOrders,
    selectedCancelledOrders,
    selectedStatus,
  ]);

  const { data: users = [], isLoading } = useGetUsersQuery(queryParams, {
    skip: !authUser?.companyId,
  });
  const { data: stats } = useGetStatsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const userTrend = useMemo(
    () => calculateTrend(users, "createdAt"),
    [users, calculateTrend],
  );
  const bannedTrend = useMemo(
    () =>
      calculateTrend(
        users.filter((u) => u.isBanned),
        "bannedAt",
      ),
    [users, calculateTrend],
  );

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: t("customers.totalCustomers"),
        value: stats.totalCustomers ?? 0,
        trend: userTrend.value,
        trendDir: userTrend.dir,
        trendColor: userTrend.color === "green" ? "green" : "red",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
        wave: "text-blue-500",
      },
      {
        label: t("customers.successOrderRatio"),
        value: `${stats.successOrderRatio ?? 0}%`,
        trend: "+5.2%", // Static for now as no order history
        trendDir: "up",
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        wave: "text-emerald-500",
      },
      {
        label: t("customers.cancelRatio"),
        value: `${stats.cancelRatio ?? 0}%`,
        trend: "-2.1%", // Static for now
        trendDir: "down",
        trendColor: "green", // Lower is better for cancel ratio
        icon: XCircle,
        color: "text-amber-600",
        bg: "bg-amber-100",
        wave: "text-amber-500",
      },
      {
        label: t("customers.newCustomerRatio"),
        value: `${stats.newCustomerRatio ?? 0}%`,
        trend: "+8.4%", // Static
        trendDir: "up",
        icon: UserPlus,
        color: "text-violet-600",
        bg: "bg-violet-100",
        wave: "text-violet-500",
      },
      {
        label: t("customers.totalBannedCustomers"),
        value: stats.totalBannedCustomers ?? 0,
        trend: bannedTrend.value,
        trendDir: bannedTrend.dir,
        trendColor: bannedTrend.color === "green" ? "green" : "red",
        icon: Ban,
        color: "text-red-600",
        bg: "bg-red-100",
        wave: "text-red-500",
      },
      {
        label: t("orders.totalOrders"),
        value: stats.totalOrders ?? 0,
        trend: "+15.3%", // Static
        trendDir: "up",
        icon: ShoppingBag,
        color: "text-indigo-600",
        bg: "bg-indigo-100",
        wave: "text-indigo-500",
      },
    ];
  }, [stats, t, userTrend, bannedTrend]);

  const handleExport = (type = "pdf") => {
    if (!users?.length) {
      toast.error(t("customers.noCustomersExport"));
      return;
    }

    if (type === "excel") {
      exportCustomersToExcel(users, t("customers.title"));
    } else if (type === "excel-name-phone") {
      exportCustomersToExcel(users, `${t("customers.title")}_Name_Phone`, [
        "Name",
        "Phone",
      ]);
    } else if (type === "excel-name-email") {
      exportCustomersToExcel(users, `${t("customers.title")}_Name_Email`, [
        "Name",
        "Email",
      ]);
    } else {
      exportCustomersToPDF(users, t("customers.title"));
    }
  };

  return (
    <div className="space-y-6">
      <CustomerHeader onExport={handleExport} />

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
        <CustomerStatsSection statCards={statCards} />

        <CustomerFilters
          selectedSuccessfulOrders={selectedSuccessfulOrders}
          setSelectedSuccessfulOrders={setSelectedSuccessfulOrders}
          SUCCESSFUL_ORDERS_OPTIONS={SUCCESSFUL_ORDERS_OPTIONS}
          selectedCancelledOrders={selectedCancelledOrders}
          setSelectedCancelledOrders={setSelectedCancelledOrders}
          CANCELLED_ORDERS_OPTIONS={CANCELLED_ORDERS_OPTIONS}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          STATUS_OPTIONS={STATUS_OPTIONS}
        />

        <CustomerTableSection users={users} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CustomersPage;
