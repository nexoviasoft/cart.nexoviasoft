import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Eye,
  Star,
  Package,
  Tag,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  MoreVertical,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetPackagesQuery,
  useDeletePackageMutation,
} from "@/features/package/packageApiSlice";

const PackageManagementPage = () => {
  const navigate = useNavigate();
  const { data: packages = [], isLoading } = useGetPackagesQuery();
  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [packageToDelete, setPackageToDelete] = useState(null);

  const handleDeleteClick = (pkg) => {
    setPackageToDelete(pkg);
  };

  const confirmDelete = async () => {
    if (packageToDelete) {
      const res = await deletePackage(packageToDelete.id);
      if (res?.error) {
        // handle error if needed
      }
      setPackageToDelete(null);
    }
  };

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "Description", field: "description" },
      { header: "Price", field: "price" },
      { header: "Discount Price", field: "discountPrice" },
      { header: "Theme", field: "theme" },
      { header: "Featured", field: "isFeatured" },
      { header: "Features", field: "featuresCount" },
      { header: "Actions", field: "actions" },
    ],
    [],
  );
  const formatPrice = (price) => {
    if (!price) return "-";
    return `৳${parseFloat(price).toFixed(2)}`;
  };

  const tableData = useMemo(
    () =>
      packages.map((pkg) => ({
        name: (
          <div className="flex items-center gap-2">
            {pkg.isFeatured && (
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
            <span className="font-medium text-slate-900 dark:text-white">
              {pkg.name || "-"}
            </span>
          </div>
        ),
        description: (
          <span className="text-xs line-clamp-2 max-w-xs text-slate-500 dark:text-slate-400">
            {pkg.description || "-"}
          </span>
        ),
        price: (
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatPrice(pkg.price)}
          </span>
        ),
        discountPrice: pkg.discountPrice ? (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatPrice(pkg.discountPrice)}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        ),
        theme: pkg.theme ? (
          <span className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-medium">
            {pkg.theme.domainUrl || `Theme #${pkg.theme.id}`}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">-</span>
        ),
        isFeatured: pkg.isFeatured ? (
          <span className="px-2.5 py-1 text-xs rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
            Yes
          </span>
        ) : (
          <span className="px-2.5 py-1 text-xs rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
            No
          </span>
        ),
        featuresCount: (
          <span className="px-2.5 py-1 text-xs rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium">
            {pkg.features?.length || 0} features
          </span>
        ),
        actions: (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem
                  onClick={() => navigate(`/superadmin/packages/${pkg.id}`)}
                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20 dark:focus:text-violet-400"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/superadmin/packages/${pkg.id}/edit`)}
                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20 dark:focus:text-blue-400"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit Package</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(pkg)}
                  disabled={isDeleting}
                  className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 dark:focus:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Package</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      })),
    [packages, deletePackage, isDeleting],
  );

  // Statistics with Trends
  const kpis = useMemo(() => {
    // Default values if no packages
    const total = packages.length;
    const featured = packages.filter((p) => p.isFeatured).length;
    const totalWithTheme = packages.filter((p) => p.theme).length;

    // Calculate average price
    const totalPrice = packages.reduce(
      (sum, p) => sum + Number(p.price || 0),
      0,
    );
    const avgPrice = total > 0 ? totalPrice / total : 0;

    // Format currency
    const formatMoney = (amount) => `৳${amount.toFixed(0)}`;

    return [
      {
        label: "Total Packages",
        value: total,
        trend: "+12%",
        trendDir: "up",
        icon: Package,
        bg: "bg-violet-50 dark:bg-violet-900/20",
        color: "text-violet-600 dark:text-violet-400",
        wave: "text-violet-500",
      },
      {
        label: "Featured Plans",
        value: featured,
        trend: "+100%",
        trendDir: "up",
        icon: Star,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        wave: "text-emerald-500",
      },
      {
        label: "Avg. Price",
        value: formatMoney(avgPrice),
        trend: "+5%",
        trendDir: "up",
        icon: Wallet,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        color: "text-blue-600 dark:text-blue-400",
        wave: "text-blue-500",
      },
      {
        label: "Active Themes",
        value: totalWithTheme,
        trend: "-2%",
        trendDir: "down",
        icon: Tag,
        bg: "bg-rose-50 dark:bg-rose-900/20",
        color: "text-rose-600 dark:text-rose-400",
        wave: "text-rose-500",
      },
    ];
  }, [packages]);

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
      {/* Simple Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Package Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
              Create and manage subscription packages for your e-commerce
              platform.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* Packages table */}
      <div className="rounded-[14px] p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              All Packages
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage subscription packages and pricing tiers.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => navigate("/superadmin/packages/create")}
              className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>
        </div>
        <div className="p-0">
          <ReusableTable
            data={tableData}
            headers={headers}
            py="py-4"
            total={packages.length}
            isLoading={isLoading}
            searchable={false}
            headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          />
        </div>
      </div>



      <Dialog
        open={!!packageToDelete}
        onOpenChange={(open) => !open && setPackageToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 text-white text-center">
            <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Delete Package?
            </DialogTitle>
            <DialogDescription className="text-rose-100 mt-2">
              This action cannot be undone. This will permanently delete the
              package{" "}
              <span className="font-semibold text-white">
                "{packageToDelete?.name}"
              </span>
              .
            </DialogDescription>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900">
            <DialogFooter className="gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setPackageToDelete(null)}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Package"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagementPage;
