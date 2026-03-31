import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPackageQuery } from "@/features/package/packageApiSlice";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  Tag,
  Calendar,
  Layers,
  CheckCircle2,
  Star,
  XCircle,
  Info,
} from "lucide-react";
import BdtIcon from "@/components/icons/BdtIcon";

// All available features with human label + description text
const FEATURES_OPTIONS = [
  { value: "PRODUCTS", label: "Products", details: "Manage all products (create, edit, delete, list, basic inventory)." },
  { value: "ORDERS", label: "Orders", details: "Access full order list, view order details and basic order actions." },
  { value: "STEARDFAST", label: "Steardfast", details: "Use Steadfast courier inside the console for order shipping." },
  { value: "PATHAO", label: "Pathao", details: "Use Pathao courier inside the console for order shipping." },
  { value: "REDX", label: "Redx", details: "Use RedX courier inside the console for order shipping." },
  { value: "NOTIFICATIONS", label: "Notifications", details: "Access notification center and general notification features." },
  { value: "EMAIL_NOTIFICATIONS", label: "Email Notifications", details: "Send and manage email-based notifications to customers." },
  { value: "WHATSAPP_NOTIFICATIONS", label: "Whatsapp Notifications", details: "Send and manage WhatsApp-based notifications to customers." },
  { value: "SMS_NOTIFICATIONS", label: "Sms Notifications", details: "Send and manage SMS-based notifications to customers." },
  { value: "ORDERS_ITEM", label: "Orders Item", details: "View and manage line items inside each order (products, quantity, price)." },
  { value: "CATEGORY", label: "Category", details: "Create, edit and delete product categories." },
  { value: "CUSTOMERS", label: "Customers", details: "View customer list, create new customers and manage customer profiles." },
  { value: "REPORTS", label: "Reports", details: "Access different analytical and summary reports (sales, orders, etc.)." },
  { value: "SETTINGS", label: "Settings", details: "Access main settings page (general, account, preferences, billing, etc.)." },
  { value: "STAFF", label: "Staff", details: "Manage internal staff/users (list, create, edit, basic access)." },
  { value: "SMS_CONFIGURATION", label: "Sms Configuration", details: "Configure SMS gateway credentials and SMS sending settings." },
  { value: "EMAIL_CONFIGURATION", label: "Email Configuration", details: "Configure email SMTP / provider settings for outgoing emails." },
  { value: "PAYMENT_METHODS", label: "Payment Methods", details: "Set up offline payment methods (Cash, Bank Transfer, etc.)." },
  { value: "PAYMENT_GATEWAYS", label: "Payment Gateways", details: "Configure online gateways (SSLCommerz, Stripe, etc.)." },
  { value: "PAYMENT_STATUS", label: "Payment Status", details: "Define and manage different payment statuses (Paid, Unpaid, Pending)." },
  { value: "PAYMENT_TRANSACTIONS", label: "Payment Transactions", details: "View and track individual payment transaction history." },
  { value: "PROMOCODES", label: "Promocodes", details: "Create and manage coupon codes / discount promo codes." },
  { value: "HELP", label: "Help", details: "Access help center, support tickets and documentation section." },
  { value: "BANNERS", label: "Banners", details: "Create and manage simple homepage / site banners." },
  { value: "FRUAD_CHECKER", label: "Fruad Checker", details: "Use fraud-check tools to identify risky or suspicious orders." },
  { value: "MANAGE_USERS", label: "Manage Users", details: "High-level user management (system owners and staff accounts)." },
  { value: "DASHBOARD", label: "Dashboard", details: "Access main dashboard with KPIs, charts and quick stats." },
  { value: "REVENUE", label: "Revenue", details: "View revenue-related cards and graphs inside dashboard/reports." },
  { value: "NEW_CUSTOMERS", label: "New Customers", details: "See metrics and widgets for newly acquired customers." },
  { value: "REPEAT_PURCHASE_RATE", label: "Repeat Purchase Rate", details: "See repeat purchase rate stats and related KPIs." },
  { value: "AVERAGE_ORDER_VALUE", label: "Average Order Value", details: "See AOV (average order value) stats and insights." },
  { value: "STATS", label: "Stats", details: "Access extended statistics page with deeper analytics." },
  { value: "LOG_ACTIVITY", label: "Log Activity", details: "View SquadLog / activity logs for user actions in the system." },
  { value: "REVIEW", label: "Review", details: "View and manage customer product reviews." },
  { value: "PATHAO_COURIER", label: "Pathao Courier", details: "Access Pathao courier integration pages and tools." },
  { value: "STEADFAST_COURIER", label: "Steadfast Courier", details: "Access Steadfast courier integration pages and tools." },
  { value: "REDX_COURIER", label: "Redx Courier", details: "Access RedX courier integration pages and tools." },
  { value: "PATHAO_COURIER_CONFIGURATION", label: "Pathao Courier Configuration", details: "Configure Pathao API keys, credentials and courier settings." },
  { value: "STEADFAST_COURIER_CONFIGURATION", label: "Steadfast Courier Configuration", details: "Configure Steadfast API keys, credentials and courier settings." },
  { value: "REDX_COURIER_CONFIGURATION", label: "Redx Courier Configuration", details: "Configure RedX API keys, credentials and courier settings." },
  { value: "SUPERADMIN_EARNINGS", label: "Superadmin Earnings", details: "Superadmin-level earnings overview and revenue data for all tenants." },
  { value: "SUPERADMIN_STATISTICS", label: "Superadmin Statistics", details: "Global statistics panel for the superadmin (all stores / system-wide)." },
  { value: "AI_REPORT", label: "Ai Report", details: "AI-generated daily/periodic reports with insights and recommendations." },
  { value: "AI_LIVE_FEED", label: "Ai Live Feed", details: "Real-time AI live feed of events, anomalies and important activities." },
  { value: "AI_SALES_DIRECTION", label: "Ai Sales Direction", details: "AI guidance on what to push, which products to focus and sales direction." },
  { value: "PRODUCT_BULK_UPLOAD", label: "Product Bulk Upload", details: "Upload many products at once using CSV / Excel bulk upload." },
  { value: "INVENTORY_MANAGEMENT", label: "Inventory Management", details: "View and manage stock levels, inventory adjustments and stock list." },
  { value: "INVENTORY_HISTORY", label: "Inventory History", details: "See detailed stock movement history (in/out, restock, adjustments)." },
  { value: "FLASH_SELL", label: "Flash Sell", details: "Set up and manage flash sale campaigns from the console." },
  { value: "MEDIA_MANAGEMENT", label: "Media Management", details: "Access media library, upload and manage images/files used in the store." },
  { value: "BANNER_MANAGEMENT", label: "Banner Management", details: "Advanced banner management for different positions and layouts." },
  { value: "BANNERS_OFFERS_MARKETING", label: "Banners Offers Marketing", details: "Marketing-focused banners and offers management (campaign-style)." },
  { value: "ORDER_INVOICE_FINANCE", label: "Order Invoice Finance", details: "Access invoices, credit notes and financial views linked to orders." },
  { value: "ORDER_CREATION_MANUAL", label: "Order Creation Manual", details: "Create orders manually from the console on behalf of customers." },
  { value: "ORDER_TRACKING", label: "Order Tracking", details: "Use the console tracking page to follow order shipping status." },
  { value: "ORDER_EDIT", label: "Order Edit", details: "Edit existing orders (items, customer info, amounts) from console." },
  { value: "SALE_INVOICE_MANAGEMENT", label: "Sale Invoice Management", details: "Create, edit, view and manage sale invoices and recurring invoices." },
  { value: "POLICY_LEGAL_CONTENT", label: "Policy Legal Content", details: "Access the full legal content section (all store policies together)." },
  { value: "PRIVACY_POLICY_MANAGEMENT", label: "Privacy Policy Management", details: "Create and edit the store’s privacy policy content." },
  { value: "TERMS_CONDITIONS_MANAGEMENT", label: "Terms Conditions Management", details: "Create and edit terms & conditions content." },
  { value: "REFUND_POLICY_MANAGEMENT", label: "Refund Policy Management", details: "Create and edit refund/return policy content." },
  { value: "INTEGRATIONS_SETTINGS", label: "Integrations Settings", details: "Access integrations area for managing connected apps and services." },
  { value: "CONNECTED_APPS", label: "Connected Apps", details: "View and manage all third‑party apps connected to the store." },
  { value: "COURIER_INTEGRATION_SETTINGS", label: "Courier Integration Settings", details: "Central settings page for all courier integrations." },
  { value: "NOTIFICATION_SETTINGS", label: "Notification Settings", details: "Configure how and when different notifications are sent." },
  { value: "THEME_MANAGEMENT", label: "Theme Management", details: "Manage storefront themes, preview and switch between themes." },
  { value: "CUSTOM_DOMAIN", label: "Custom Domain", details: "Connect and manage custom domains for the storefront." },
  { value: "INCOMPLETE_ORDERS", label: "Incomplete Orders", details: "Track abandoned checkouts and recover lost sales." },
  { value: "PRODUCT_STICKER", label: "Product Sticker", details: "Generate and print barcodes/QR codes for products." },
  { value: "RESELLER_MANAGEMENT", label: "Reseller Management", details: "Manage resellers, their commissions and orders." },
  { value: "MY_CASH", label: "My Cash", details: "Track income and expenses for your business." },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: pkg, isLoading, isError } = useGetPackageQuery(id);
  const [featureModal, setFeatureModal] = React.useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading package details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Package Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            The package you are looking for does not exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/package-management")}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/superadmin/package-management")}
          className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {pkg.name || "Package Details"}
            {pkg.isFeatured && (
              <span className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/50">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Package ID: <span className="font-mono text-slate-700 dark:text-slate-300">{pkg.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-500" />
              Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Description
                </label>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {pkg.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Theme Details Card */}
          {pkg.theme && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Theme Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Theme ID
                  </label>
                  <p className="font-mono text-slate-900 dark:text-slate-100 font-medium">
                    {pkg.theme.id}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Domain URL
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 font-medium break-all">
                    {pkg.theme.domainUrl || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Logo Color
                  </label>
                  <div className="flex items-center gap-3">
                    {pkg.theme.logoColorCode ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                          style={{ backgroundColor: pkg.theme.logoColorCode }}
                        />
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                          {pkg.theme.logoColorCode}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Created At
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {formatDate(pkg.theme.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Features Included
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-auto">
                {pkg.features?.length || 0} features
              </span>
            </h2>
            {pkg.features && pkg.features.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.features.map((feature, index) => {
                  const meta = FEATURES_OPTIONS.find((f) => f.value === feature);
                  const label = meta?.label || feature.replace(/_/g, " ");
                  const details = meta?.details;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20"
                    >
                      <div className="w-2 h-2 mt-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="flex-1 flex items-start gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                            {label}
                          </span>
                          {details && (
                            <span className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
                              {details}
                            </span>
                          )}
                        </div>
                        {details && (
                          <button
                            type="button"
                            className="mt-0.5 text-emerald-700/70 dark:text-emerald-200/70 hover:text-emerald-800 dark:hover:text-emerald-100"
                            title={details}
                            onClick={() => setFeatureModal({ label, details })}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No features listed for this package
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BdtIcon className="w-5 h-5 text-blue-500" />
              Pricing Details
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Regular Price</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  ৳{formatPrice(pkg.price)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Discount Price</span>
                <span className={`text-xl font-bold ${pkg.discountPrice ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                  {pkg.discountPrice ? `৳${formatPrice(pkg.discountPrice)}` : "-"}
                </span>
              </div>

              {pkg.discountPrice && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Savings</span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      ৳{formatPrice(parseFloat(pkg.price) - parseFloat(pkg.discountPrice))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded-md bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-bold">
                      {(((parseFloat(pkg.price) - parseFloat(pkg.discountPrice)) / parseFloat(pkg.price)) * 100).toFixed(0)}% OFF
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Timeline
            </h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 space-y-6">
              <div className="ml-6 relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-violet-500" />
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Created At
                </label>
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {formatDate(pkg.createdAt)}
                </p>
              </div>
              <div className="ml-6 relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-blue-500" />
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Last Updated
                </label>
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {formatDate(pkg.updatedAt)}
                </p>
              </div>
              {pkg.deletedAt && (
                <div className="ml-6 relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-rose-500" />
                  <label className="text-xs font-medium text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1 block">
                    Deleted At
                  </label>
                  <p className="text-rose-600 dark:text-rose-400 font-medium">
                    {formatDate(pkg.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Dialog
        open={!!featureModal}
        onOpenChange={(open) => {
          if (!open) setFeatureModal(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              {featureModal?.label || "Feature details"}
            </DialogTitle>
            {featureModal?.details && (
              <DialogDescription className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {featureModal.details}
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PackageDetailPage;
