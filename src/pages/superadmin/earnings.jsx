import React, { useMemo } from "react";
import { Wallet, TrendingUp, CreditCard, Globe2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import LineChartComponent from "@/components/charts/line-chart";
import { useGetEarningsOverviewQuery } from "@/features/earnings/earningsApiSlice";
import { motion } from "framer-motion";
import { formatCurrency as formatBDTCurrency } from "@/utils/banglaFormatter";

const SuperAdminEarningsPage = () => {
  const { data: earningsData, isLoading } = useGetEarningsOverviewQuery();

  // Format currency (BDT)
  const formatCurrency = (amount) => formatBDTCurrency(amount, "en", "৳");

  // Helper for trend direction
  const getTrendDir = (val) => val >= 0 ? "up" : "down";
  
  // Helper for absolute percentage string
  const getTrendStr = (val) => `${Math.abs(val || 0).toFixed(1)}%`;

  const kpis = useMemo(() => {
    if (!earningsData?.kpis) {
      return [
        {
          label: "Total Earnings (YTD)",
          value: "৳0",
          trend: "0.0%",
          trendDir: "up",
          icon: DollarSign,
          bg: "bg-violet-50 dark:bg-violet-900/20",
          color: "text-violet-600 dark:text-violet-400",
          wave: "text-violet-500",
          description: "Revenue across all connected stores",
        },
        {
          label: "Avg. Daily Revenue",
          value: "৳0",
          trend: "0.0%",
          trendDir: "up",
          icon: TrendingUp,
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          color: "text-emerald-600 dark:text-emerald-400",
          wave: "text-emerald-500",
          description: "Rolling 30 day daily average",
        },
        {
          label: "Paid vs Pending",
          value: "0% / 0%",
          trend: "0.0%",
          trendDir: "up",
          icon: CreditCard,
          bg: "bg-blue-50 dark:bg-blue-900/20",
          color: "text-blue-600 dark:text-blue-400",
          wave: "text-blue-500",
          description: "Collection health across gateways",
        },
        {
          label: "Active Markets",
          value: "0",
          trend: "0 new",
          trendDir: "up",
          icon: Globe2,
          bg: "bg-rose-50 dark:bg-rose-900/20",
          color: "text-rose-600 dark:text-rose-400",
          wave: "text-rose-500",
          description: "Countries with live transactions",
        },
      ];
    }

    const { kpis: kpiData } = earningsData;
    return [
      {
        label: "Total Earnings (YTD)",
          value: formatCurrency(kpiData.totalEarningsYTD),
        trend: getTrendStr(kpiData.earningsDelta),
        trendDir: getTrendDir(kpiData.earningsDelta || 0),
          icon: Wallet,
        bg: "bg-violet-50 dark:bg-violet-900/20",
        color: "text-violet-600 dark:text-violet-400",
        wave: "text-violet-500",
        description: "Revenue across all connected stores",
      },
      {
        label: "Avg. Daily Revenue",
        value: formatCurrency(kpiData.avgDailyRevenue),
        trend: getTrendStr(kpiData.avgDailyDelta),
        trendDir: getTrendDir(kpiData.avgDailyDelta || 0),
        icon: TrendingUp,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        wave: "text-emerald-500",
        description: "Rolling 30 day daily average",
      },
      {
        label: "Paid vs Pending",
        value: `${Math.round(kpiData.paidPercentage || 0)}% / ${Math.round(kpiData.pendingPercentage || 0)}%`,
        trend: "0.0%", // No delta for this one in original data, keeping static or 0
        trendDir: "up",
        icon: CreditCard,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        color: "text-blue-600 dark:text-blue-400",
        wave: "text-blue-500",
        description: "Collection health across gateways",
      },
      {
        label: "Active Markets",
        value: String(kpiData.activeMarkets || 0),
        trend: `${kpiData.newMarkets || 0} new`,
        trendDir: "up",
        icon: Globe2,
        bg: "bg-rose-50 dark:bg-rose-900/20",
        color: "text-rose-600 dark:text-rose-400",
        wave: "text-rose-500",
        description: "Countries with live transactions",
      },
    ];
  }, [earningsData]);

  const lineChartConfig = {
    desktop: { label: "Net earnings", color: "hsl(var(--chart-3))" },
  };

  const lineChartData = useMemo(() => {
    if (!earningsData?.chartData) {
      return [];
    }
    return earningsData.chartData;
  }, [earningsData]);

  const payoutStatus = useMemo(() => {
    if (!earningsData?.payoutStatus) {
      return {
        clearedPayouts: 0,
        scheduledPending: 0,
        disputedOnHold: 0,
      };
    }
    return earningsData.payoutStatus;
  }, [earningsData]);

  const channelBreakdown = useMemo(() => {
    if (!earningsData?.channelBreakdown || earningsData.channelBreakdown.length === 0) {
      return [
        { name: "Direct ecommerce", amount: 0 },
        { name: "Marketplaces", amount: 0 },
        { name: "Wholesale & B2B", amount: 0 },
      ];
    }
    return earningsData.channelBreakdown.slice(0, 3);
  }, [earningsData]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Wallet className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Earnings Overview
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Consolidated revenue performance across all stores, markets and payment providers.
          </p>
        </div>
      </div>

      {/* KPI cards - Wave Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>

              <div className="flex items-center gap-2">
                <span
                  className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border
                  ${
                    stat.trendDir === "up"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
                  }
                `}
                >
                  {stat.trendDir === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  vs last month
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div
              className={`absolute bottom-0 right-0 w-32 h-24 opacity-10 ${stat.wave}`}
            >
              <svg
                viewBox="0 0 100 60"
                fill="currentColor"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earnings trend & breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart */}
        <section className="xl:col-span-2 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Earnings trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Month-over-month net earnings across all sales channels.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium transition-colors">
                Year to date
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Last 90 days
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading chart data...</p>
            </div>
          ) : (
            <LineChartComponent
              chartData={lineChartData}
              chartConfig={lineChartConfig}
            />
          )}
        </section>

        {/* Right side breakdown cards */}
        <section className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payout status</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400">Cleared payouts (7d)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isLoading ? "..." : formatCurrency(payoutStatus.clearedPayouts)}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
                <span className="text-amber-700 dark:text-amber-400">Scheduled / pending</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {isLoading ? "..." : formatCurrency(payoutStatus.scheduledPending)}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10">
                <span className="text-rose-700 dark:text-rose-400">Disputed / on hold</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {isLoading ? "..." : formatCurrency(payoutStatus.disputedOnHold)}
                </span>
              </li>
            </ul>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Channel breakdown</h2>
            <ul className="space-y-3 text-sm">
              {isLoading ? (
                <li className="flex items-center justify-center py-4">
                  <span className="text-slate-500 dark:text-slate-400 animate-pulse">Loading...</span>
                </li>
              ) : channelBreakdown.length > 0 ? (
                channelBreakdown.map((channel, index) => (
                  <li key={index} className="flex items-center justify-between group">
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {channel.name || "Other"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(channel.amount)}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center justify-center py-4">
                  <span className="text-slate-500 dark:text-slate-400">No data available</span>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuperAdminEarningsPage;

