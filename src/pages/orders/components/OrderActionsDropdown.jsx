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
} from "lucide-react";
import { generateParcelSlip } from "@/utils/parcelSlip";

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
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const companyName =
    authUser?.companyName ||
    authUser?.company?.name ||
    authUser?.storeName ||
    authUser?.name ||
    "SquadCart";
  const companyLogo =
    authUser?.companyLogo || authUser?.company?.logo || authUser?.logo || null;

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
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy Order ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {onFraudCheck && (
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
              await generateParcelSlip(order, {
                companyName,
                companyLogo,
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
          className="cursor-pointer"
        >
          <Download className="mr-2 h-4 w-4" />
          {t("orders.printParcelSlip") || "Print Parcel Slip"}
        </DropdownMenuItem>
        {order.status?.toLowerCase() === "incomplete" && (
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
        {(order.status?.toLowerCase() === "pending" ||
          order.status?.toLowerCase() === "incomplete" ||
          !order.status) && (
          <DropdownMenuItem onClick={onProcess}>
            <Cog className="mr-2 h-4 w-4" />
            Mark as Processing
          </DropdownMenuItem>
        )}
        {order.status?.toLowerCase() === "processing" && (
          <>
            {order.shippingTrackingId && (
              <DropdownMenuItem
                onClick={() => {
                  navigate(`/orders/track?trackingId=${encodeURIComponent(order.shippingTrackingId)}`);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {t("orders.trackOrder")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onExportCourier}>
              <Truck className="mr-2 h-4 w-4" />
              {t("orders.exportCourier") || "Export Courier"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onShip}>
              <Ship className="mr-2 h-4 w-4" />
              Mark as Shipped
            </DropdownMenuItem>
          </>
        )}
        {order.status?.toLowerCase() === "shipped" && (
          <>
            <DropdownMenuItem onClick={onDeliver}>
              <Package className="mr-2 h-4 w-4" />
              Mark as Delivered
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onCancel}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              {t("orders.cancelOrder")}
            </DropdownMenuItem>
          </>
        )}
        {order.status?.toLowerCase() === "cancelled" && (
          <DropdownMenuItem
            onClick={onRefund}
            className="text-orange-600 focus:text-orange-600"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("orders.refundOrder")}
          </DropdownMenuItem>
        )}
        {!order.isPaid &&
          order.status?.toLowerCase() !== "cancelled" && (
            <DropdownMenuItem onClick={onPartialPayment}>
              <CreditCard className="mr-2 h-4 w-4" />
              Record Payment
            </DropdownMenuItem>
          )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActionsDropdown;
