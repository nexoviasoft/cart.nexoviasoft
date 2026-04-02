import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
 import {
  MoreHorizontal,
  Download,
  Truck,
  Shield,
  Copy,
  Eye,
  MapPin,
  Ship,
  Package,
  XCircle,
  RotateCcw,
  CreditCard,
  Trash2,
  Cog,
  MessageCircle,
  CheckCircle,
  Mail,
} from "lucide-react";
import { generateParcelSlip } from "@/utils/parcelSlip";
import { useGetSettingsQuery } from "@/features/setting/settingApiSlice";

const OrderActionsDropdown = ({
  order,
  onProcess,
  onShip,
  onDeliver,
  onCancel,
  onRefund,
  onPartialPayment,
  onDelete,
  onExportCourier,
  onFraudCheck,
  onConvert,
  onWhatsApp,
  onEmail,
  onTrackOrder,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const isReseller = authUser?.role === "RESELLER";
  const companyName =
    authUser?.companyName ||
    authUser?.company?.name ||
    authUser?.storeName ||
    authUser?.name ||
    "SquadCart";
  const companyLogo =
    authUser?.companyLogo || authUser?.company?.logo || authUser?.logo || null;

  const { data: settings = [] } = useGetSettingsQuery();
  const setting = settings?.[0] || {};

  return (
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
          onClick={() => navigator.clipboard.writeText(order.id)}
          className="text-slate-600 dark:text-slate-400 focus:text-slate-700"
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Order ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => navigate(`/orders/${order.id}`)}
          className="text-sky-600 dark:text-sky-400 focus:text-sky-600 font-medium"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {!isReseller && onFraudCheck && (
          <DropdownMenuItem
            onClick={onFraudCheck}
            className="text-indigo-600 dark:text-indigo-400 focus:text-indigo-600"
          >
            <Shield className="mr-2 h-4 w-4" />
            Fraud Check
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={async () => {
            try {
              let trackingPageBase = setting?.orderReceiptUrl;
              let isCustomReceiptUrl = false;
              
              if (trackingPageBase) {
                isCustomReceiptUrl = true;
              } else {
                const customDomain = authUser?.company?.customDomain || authUser?.customDomain;
                const subdomain = authUser?.company?.subdomain || authUser?.subdomain;
                trackingPageBase = window.location.origin;
                
                if (customDomain) {
                  trackingPageBase = `https://${customDomain}`;
                } else if (subdomain) {
                  trackingPageBase = `https://${subdomain}.fiberace.com`;
                }
              }
              
              await generateParcelSlip(order, {
                companyName,
                companyLogo,
                trackingPageBase,
                isCustomReceiptUrl,
              });
              toast.success(
                t("orders.parcelSlipGenerated") ||
                  "Parcel slip generated successfully",
              );
            } catch (err) {
              console.error(err);
              toast.error(
                t("orders.parcelSlipFailed") ||
                  "Failed to generate parcel slip",
              );
            }
          }}
          className="cursor-pointer text-purple-600 dark:text-purple-400 focus:text-purple-600 font-medium"
        >
          <Download className="mr-2 h-4 w-4" />
          {t("orders.printParcelSlip") || "Print Parcel Slip"}
        </DropdownMenuItem>
        {!isReseller && order.status?.toLowerCase() === "incomplete" && (
          <>
            <DropdownMenuItem
              onClick={onWhatsApp}
              className="text-green-600 dark:text-green-400 focus:text-green-600 font-bold"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact on WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onEmail}
              className="text-blue-600 dark:text-blue-400 focus:text-blue-600 font-bold"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact on Email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onConvert}
              className="text-blue-600 dark:text-blue-400 focus:text-blue-600 font-bold"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Convert to Order
            </DropdownMenuItem>
          </>
        )}
        {!isReseller && (order.status?.toLowerCase() === "pending" ||
          order.status?.toLowerCase() === "incomplete" ||
          !order.status) && (
          <DropdownMenuItem 
            onClick={onProcess}
            className="text-indigo-600 dark:text-indigo-400 focus:text-indigo-600 font-medium"
          >
            <Cog className="mr-2 h-4 w-4" />
            Mark as Processing
          </DropdownMenuItem>
        )}
        {!isReseller && order.shippingTrackingId && ["processing", "shipped", "delivered", "paid", "completed"].includes(order.status?.toLowerCase()) && (
          <DropdownMenuItem
            onClick={() => {
              if (onTrackOrder) {
                onTrackOrder(order.shippingTrackingId);
              }
            }}
            className="text-fuchsia-600 dark:text-fuchsia-400 focus:text-fuchsia-600 font-medium"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {t("orders.trackOrder") || "Track Order"}
          </DropdownMenuItem>
        )}
        {!isReseller && order.status?.toLowerCase() === "processing" && (
          <>
            <DropdownMenuItem 
              onClick={onExportCourier}
              className="text-amber-600 dark:text-amber-400 focus:text-amber-600 font-medium"
            >
              <Truck className="mr-2 h-4 w-4" />
              {t("orders.exportCourier") || "Export Courier"}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onShip}
              className="text-blue-600 dark:text-blue-400 focus:text-blue-600 font-medium"
            >
              <Ship className="mr-2 h-4 w-4" />
              Mark as Shipped
            </DropdownMenuItem>
          </>
        )}
        {!isReseller && order.status?.toLowerCase() === "shipped" && (
          <>
            <DropdownMenuItem 
              onClick={onDeliver}
              className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 font-medium"
            >
              <Package className="mr-2 h-4 w-4" />
              Mark as Delivered
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className="text-rose-600 dark:text-rose-400 focus:text-rose-600 font-bold"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t("orders.cancelOrder")}
            </DropdownMenuItem>
          </>
        )}
        {!isReseller && order.status?.toLowerCase() === "cancelled" && (
          <DropdownMenuItem
            onClick={onRefund}
            className="text-orange-600 dark:text-orange-400 focus:text-orange-600 font-bold"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("orders.refundOrder")}
          </DropdownMenuItem>
        )}
        {!isReseller && !order.isPaid &&
          order.status?.toLowerCase() !== "cancelled" && (
            <DropdownMenuItem 
              onClick={onPartialPayment}
              className="text-teal-600 dark:text-teal-400 focus:text-teal-600 font-medium"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </DropdownMenuItem>
          )}
        {!isReseller && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 dark:text-red-400 focus:text-red-600 font-bold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Order
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionsDropdown;
