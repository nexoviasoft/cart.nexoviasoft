import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
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
  Users,
  AlertTriangle,
  UserCheck,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreHorizontal,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  useGetSystemusersQuery,
  useDeleteSystemuserMutation,
  useGetTrashedSystemusersQuery,
  useRestoreSystemuserMutation,
  useDeleteSystemuserPermanentMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SuperAdminCustomersPage = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [deleteSystemuser, { isLoading: isDeleting }] =
    useDeleteSystemuserMutation();
  const { data: trashedUsers = [], isLoading: isTrashLoading } =
    useGetTrashedSystemusersQuery();
  const [restoreSystemuser, { isLoading: isRestoring }] =
    useRestoreSystemuserMutation();
  const [deletePermanent, { isLoading: isPermanentDeleting }] =
    useDeleteSystemuserPermanentMutation();
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToRestore, setUserToRestore] = useState(null);
  const [userToPermanentDelete, setUserToPermanentDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive).length;
    const paid = users.filter(
      (u) =>
        u.paymentInfo?.paymentstatus === "paid" ||
        u.paymentInfo?.paymentstatus === "PAID",
    ).length;
    const pending = users.filter(
      (u) =>
        u.paymentInfo?.paymentstatus === "pending" ||
        u.paymentInfo?.paymentstatus === "PENDING",
    ).length;

    // Calculate trends (mocked for now as we don't have historical data in this view)
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

    return [
      {
        label: "Total Customers",
        value: total,
        trend: "+12%",
        trendDir: "up",
        icon: Users,
        bg: "bg-violet-50 dark:bg-violet-900/20",
        color: "text-violet-600 dark:text-violet-400",
        wave: "text-violet-500",
      },
      {
        label: "Active Users",
        value: active,
        trend: `${activePercentage}%`,
        trendDir: "up",
        icon: UserCheck,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        wave: "text-emerald-500",
      },
      {
        label: "Paid Subscriptions",
        value: paid,
        trend: "+5%",
        trendDir: "up",
        icon: CreditCard,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        color: "text-blue-600 dark:text-blue-400",
        wave: "text-blue-500",
      },
      {
        label: "Pending Verification",
        value: pending,
        trend: "-2%",
        trendDir: "down",
        icon: Activity,
        bg: "bg-rose-50 dark:bg-rose-900/20",
        color: "text-rose-600 dark:text-rose-400",
        wave: "text-rose-500",
      },
    ];
  }, [users]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteSystemuser(userToDelete.id).unwrap();
        toast.success("User moved to trash");
      } catch (err) {
        toast.error(err?.data?.message || err?.data?.error || "Delete failed");
      } finally {
        setUserToDelete(null);
      }
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(lowerQuery) ||
        u.email?.toLowerCase().includes(lowerQuery) ||
        u.companyName?.toLowerCase().includes(lowerQuery) ||
        u.phone?.toLowerCase().includes(lowerQuery),
    );
  }, [users, searchQuery]);

  const headers = useMemo(
    () => [
      { header: "Customer Info", field: "name" },
      { header: "Company", field: "companyName" },
      { header: "Package / Theme", field: "packageName" },
      { header: "Payment", field: "paymentStatus" },
      { header: "Status", field: "isActive" },
      { header: "Actions", field: "actions" },
    ],
    [],
  );

  const trashedHeaders = useMemo(
    () => [
      { header: "Customer Info", field: "name" },
      { header: "Company", field: "companyName" },
      { header: "Deleted At", field: "deletedAt" },
      { header: "Actions", field: "actions" },
    ],
    [],
  );

  const trashedTableData = useMemo(
    () =>
      (trashedUsers || []).map((u) => ({
        name: (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {u.name ?? "-"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {u.email ?? "-"}
            </span>
          </div>
        ),
        companyName: (
          <div className="flex flex-col">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {u.companyName ?? "-"}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {u.companyId ?? "-"}
            </span>
          </div>
        ),
        deletedAt: (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {u.deletedAt ? new Date(u.deletedAt).toLocaleString() : "-"}
          </span>
        ),
        actions: (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setUserToRestore(u)}
              className="h-8 rounded-lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Restore
            </Button>
            <Button
              variant="destructive"
              onClick={() => setUserToPermanentDelete(u)}
              className="h-8 rounded-lg"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
            </Button>
          </div>
        ),
      })),
    [trashedUsers],
  );

  const confirmRestore = async () => {
    if (userToRestore) {
      try {
        await restoreSystemuser({ id: userToRestore.id }).unwrap();
        toast.success("User restored");
      } catch (err) {
        toast.error(err?.data?.message || err?.data?.error || "Restore failed");
      } finally {
        setUserToRestore(null);
      }
    }
  };

  const confirmPermanentDelete = async () => {
    if (userToPermanentDelete) {
      try {
        await deletePermanent(userToPermanentDelete.id).unwrap();
        toast.success("User permanently deleted");
      } catch (err) {
        toast.error(
          err?.data?.message || err?.data?.error || "Permanent delete failed",
        );
      } finally {
        setUserToPermanentDelete(null);
      }
    }
  };

  const tableData = useMemo(
    () =>
      filteredUsers.map((u) => ({
        name: (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {u.name ?? "-"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {u.email ?? "-"}
            </span>
          </div>
        ),
        companyName: (
          <div className="flex flex-col">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {u.companyName ?? "-"}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {u.companyId ?? "-"}
            </span>
          </div>
        ),
        packageName: (
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 w-fit">
              {u.package?.name || u.paymentInfo?.packagename || "No Plan"}
            </span>
            {u.theme && (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                {u.theme.domainUrl || `Theme #${u.theme.id}`}
              </span>
            )}
          </div>
        ),
        paymentStatus: (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
              u.paymentInfo?.paymentstatus === "paid" ||
              u.paymentInfo?.paymentstatus === "PAID"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800"
                : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800"
            }`}
          >
            {u.paymentInfo?.paymentstatus || "PENDING"}
          </span>
        ),
        isActive: (
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${u.isActive ? "bg-emerald-400" : "bg-slate-400"}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${u.isActive ? "bg-emerald-500" : "bg-slate-500"}`}
              ></span>
            </span>
            <span
              className={`text-xs font-medium ${u.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}
            >
              {u.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ),
        actions: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/superadmin/customers/${u.id}`)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/superadmin/customers/edit/${u.id}`)}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(u)}
                className="text-rose-600 focus:text-rose-600 cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      })),
    [filteredUsers, deleteSystemuser, isDeleting, navigate],
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Customers
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Manage your system users, track subscriptions, and monitor platform
            growth.
          </p>
        </div>
      </div>

      {/* Stats Cards - Wave Design */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
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
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                    stat.trendDir === "up"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
                  }`}
                >
                  {stat.trendDir === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.trend}
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
      </motion.div>

      {/* Customers table */}
      <motion.div
        variants={itemVariants}
        className="rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden"
      >
        <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              All Customers
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                {users.length}
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Listing all registered system users and their account status.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-10 w-full sm:w-64 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
            <Button
              onClick={() => navigate("/superadmin/customers/create")}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 border-0 rounded-xl transition-all duration-300 hover:scale-[1.05]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
        <div className="p-[5px] px-3 md:px-6  pb-5">
          <ReusableTable
            data={tableData}
            headers={headers}
            py="py-4 md:py-5"
            total={filteredUsers.length}
            isLoading={isLoading}
            searchable={false}
            headerClassName="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-6 md:pl-8"
            rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 pl-6 md:pl-8"
          />
        </div>
      </motion.div>

      {/* Trash table */}
      <motion.div
        variants={itemVariants}
        className="rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden"
      >
        <div className="px-6 py-4 md:px-8 md:py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Trash
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                {trashedUsers.length || 0}
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Recently deleted customers. Restore if removed by mistake.
            </p>
          </div>
        </div>
        <div className="p-[5px] px-3 md:px-6 pb-5">
          <ReusableTable
            data={trashedTableData}
            headers={trashedHeaders}
            py="py-4 md:py-5"
            total={trashedTableData.length}
            isLoading={isTrashLoading}
            searchable={false}
            headerClassName="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-6 md:pl-8"
            rowClassName="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 pl-6 md:pl-8"
          />
        </div>
      </motion.div>

      <Dialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold relative z-10">
              Delete Customer?
            </DialogTitle>
            <DialogDescription className="text-rose-100 mt-2 relative z-10 text-base">
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold bg-white/10 px-2 py-0.5 rounded text-white">
                {userToDelete?.email}
              </span>
              .
            </DialogDescription>
          </div>
          <div className="p-8 bg-white dark:bg-[#1a1f26]">
            <DialogFooter className="gap-3 sm:justify-center flex-col sm:flex-row w-full">
              <Button
                variant="outline"
                onClick={() => setUserToDelete(null)}
                className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl h-12 bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20 font-bold"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!userToRestore}
        onOpenChange={(open) => !open && setUserToRestore(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold relative z-10">
              Restore Customer?
            </DialogTitle>
            <DialogDescription className="text-emerald-100 mt-2 relative z-10 text-base">
              This will restore{" "}
              <span className="font-bold bg-white/10 px-2 py-0.5 rounded text-white">
                {userToRestore?.email}
              </span>{" "}
              and make the account active again.
            </DialogDescription>
          </div>
          <div className="p-8 bg-white dark:bg-[#1a1f26]">
            <DialogFooter className="gap-3 sm:justify-center flex-col sm:flex-row w-full">
              <Button
                variant="outline"
                onClick={() => setUserToRestore(null)}
                className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRestore}
                disabled={isRestoring}
                className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 font-bold"
              >
                {isRestoring ? "Restoring..." : "Yes, Restore"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!userToPermanentDelete}
        onOpenChange={(open) => !open && setUserToPermanentDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-rose-600 to-red-700 p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-white/10">
              <Trash2 className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold relative z-10">
              Permanently Delete?
            </DialogTitle>
            <DialogDescription className="text-rose-100 mt-2 relative z-10 text-base">
              This will permanently delete{" "}
              <span className="font-bold bg-white/10 px-2 py-0.5 rounded text-white">
                {userToPermanentDelete?.email}
              </span>{" "}
              and cannot be undone.
            </DialogDescription>
          </div>
          <div className="p-8 bg-white dark:bg-[#1a1f26]">
            <DialogFooter className="gap-3 sm:justify-center flex-col sm:flex-row w-full">
              <Button
                variant="outline"
                onClick={() => setUserToPermanentDelete(null)}
                className="flex-1 rounded-xl h-12 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmPermanentDelete}
                disabled={isPermanentDeleting}
                className="flex-1 rounded-xl h-12 bg-rose-700 hover:bg-rose-800 shadow-lg shadow-rose-500/20 font-bold"
              >
                {isPermanentDeleting ? "Deleting..." : "Yes, Permanently Delete"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SuperAdminCustomersPage;
