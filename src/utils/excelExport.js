import * as XLSX from "xlsx";
import toast from "react-hot-toast";

/**
 * Reusable function to export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Name of the file (without extension)
 * @param {string} sheetName - Name of the Excel sheet (default: "Sheet1")
 * @param {Array} columnWidths - Optional array of column width objects [{wch: 20}, ...]
 * @param {Function} dataMapper - Optional function to transform data before export
 * @param {string} successMessage - Optional custom success message
 * @returns {boolean} - Returns true if export was successful, false otherwise
 */
export const exportToExcel = ({
  data,
  fileName,
  sheetName = "Sheet1",
  columnWidths = null,
  dataMapper = null,
  successMessage = null,
}) => {
  try {
    // Validate input
    if (!data || !Array.isArray(data) || data.length === 0) {
      toast.error("No data available to export");
      return false;
    }

    if (!fileName) {
      toast.error("File name is required");
      return false;
    }

    // Transform data if mapper is provided
    const exportData = dataMapper ? data.map(dataMapper) : data;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create a worksheet from the data
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths if provided
    if (columnWidths && Array.isArray(columnWidths)) {
      ws["!cols"] = columnWidths;
    } else {
      // Auto-size columns if no widths provided
      const maxWidth = 50;
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellValue = String(cell.v);
            maxLen = Math.max(maxLen, Math.min(cellValue.length, maxWidth));
          }
        }
        colWidths.push({ wch: maxLen + 2 });
      }
      ws["!cols"] = colWidths;
    }

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with current date if not already included
    const dateStr = new Date().toISOString().split("T")[0];
    const finalFileName = fileName.includes(dateStr)
      ? `${fileName}.xlsx`
      : `${fileName}_${dateStr}.xlsx`;

    // Write the file
    XLSX.writeFile(wb, finalFileName);

    // Show success message
    const message =
      successMessage ||
      `Exported ${exportData.length} ${exportData.length === 1 ? "item" : "items"} to Excel`;
    toast.success(message);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export data to Excel");
    return false;
  }
};

/**
 * Helper function to export products to Excel
 * @param {Array} products - Array of product objects
 * @param {string} fileName - Optional custom file name (default: "Products")
 */
export const exportProductsToExcel = (products, fileName = "Products") => {
  const dataMapper = (product) => ({
    Name: product.name ?? product.title ?? "-",
    SKU: product.sku ?? "-",
    Category: product.category?.name ?? "-",
    Price: typeof product.price === "number" ? product.price : product.price ?? "-",
    "Discount Price": product.discountPrice
      ? typeof product.discountPrice === "number"
        ? product.discountPrice
        : product.discountPrice
      : "-",
    Description: product.description ?? "-",
    Status: product.isActive ? "Active" : "Disabled",
    "Created At": product.createdAt
      ? new Date(product.createdAt).toLocaleString()
      : "-",
  });

  const columnWidths = [
    { wch: 30 }, // Name
    { wch: 15 }, // SKU
    { wch: 20 }, // Category
    { wch: 12 }, // Price
    { wch: 15 }, // Discount Price
    { wch: 50 }, // Description
    { wch: 12 }, // Status
    { wch: 20 }, // Created At
  ];

  return exportToExcel({
    data: products,
    fileName,
    sheetName: "Products",
    columnWidths,
    dataMapper,
    successMessage: `Exported ${products.length} product${products.length === 1 ? "" : "s"} to Excel`,
  });
};

/**
 * Helper function to export customers to Excel
 * @param {Array} customers - Array of customer objects
 * @param {string} fileName - Optional custom file name (default: "Customers")
 */
/**
 * Helper function to export customers to Excel
 * @param {Array} customers - Array of customer objects
 * @param {string} fileName - Optional custom file name (default: "Customers")
 * @param {Array} fields - Optional array of fields to export ["Name", "Email", "Phone", ...]
 */
export const exportCustomersToExcel = (customers, fileName = "Customers", fields = null) => {
  const allFieldsMapper = {
    Name: (c) => c.name ?? "-",
    Email: (c) => c.email ?? "-",
    Phone: (c) => c.phone ?? "-",
    "Total Orders": (c) => (c.successfulOrdersCount ?? 0) + (c.cancelledOrdersCount ?? 0),
    "Successful Orders": (c) => c.successfulOrdersCount ?? 0,
    "Cancelled Orders": (c) => c.cancelledOrdersCount ?? 0,
    Active: (c) => (c.isActive ? "Yes" : "No"),
    Banned: (c) => (c.isBanned ? "Yes" : "No"),
    "Ban Reason": (c) => c.banReason ?? "-",
    "Banned At": (c) => (c.bannedAt ? new Date(c.bannedAt).toLocaleString() : "-"),
    "Created At": (c) => (c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"),
  };

  const allColumnWidths = {
    Name: { wch: 25 },
    Email: { wch: 30 },
    Phone: { wch: 15 },
    "Total Orders": { wch: 12 },
    "Successful Orders": { wch: 15 },
    "Cancelled Orders": { wch: 15 },
    Active: { wch: 10 },
    Banned: { wch: 10 },
    "Ban Reason": { wch: 20 },
    "Banned At": { wch: 20 },
    "Created At": { wch: 20 },
  };

  const exportFields = fields || Object.keys(allFieldsMapper);

  const dataMapper = (customer) => {
    const mapped = {};
    exportFields.forEach((field) => {
      if (allFieldsMapper[field]) {
        mapped[field] = allFieldsMapper[field](customer);
      }
    });
    return mapped;
  };

  const columnWidths = exportFields
    .map((field) => allColumnWidths[field])
    .filter(Boolean);

  return exportToExcel({
    data: customers,
    fileName,
    sheetName: "Customers",
    columnWidths,
    dataMapper,
    successMessage: `Exported ${customers.length} customer${customers.length === 1 ? "" : "s"} to Excel`,
  });
};

/**
 * Helper function to export flash sell products to Excel
 * @param {Array} flashSellProducts - Array of flash sell product objects
 * @param {string} fileName - Optional custom file name (default: "Flash_Sell")
 */
export const exportFlashSellToExcel = (flashSellProducts, fileName = "Flash_Sell") => {
  const dataMapper = (product) => {
    const regularPrice = product.price || 0;
    const flashPrice = product.flashSellPrice || product.price || 0;
    const discount = regularPrice > 0 
      ? (((regularPrice - flashPrice) / regularPrice) * 100).toFixed(0)
      : 0;
    
    const now = new Date();
    const startTime = product.flashSellStartTime ? new Date(product.flashSellStartTime) : null;
    const endTime = product.flashSellEndTime ? new Date(product.flashSellEndTime) : null;
    
    let status = "Scheduled";
    if (startTime && endTime) {
      if (now < startTime) status = "Scheduled";
      else if (now >= startTime && now <= endTime) status = "Active";
      else status = "Expired";
    }

    return {
      Name: product.name || "-",
      SKU: product.sku || "-",
      "Regular Price": regularPrice,
      "Flash Price": flashPrice,
      "Discount (%)": `${discount}%`,
      "Start Time": startTime ? startTime.toLocaleString() : "-",
      "End Time": endTime ? endTime.toLocaleString() : "-",
      Status: status,
    };
  };

  const columnWidths = [
    { wch: 30 }, // Name
    { wch: 15 }, // SKU
    { wch: 15 }, // Regular Price
    { wch: 15 }, // Flash Price
    { wch: 12 }, // Discount
    { wch: 20 }, // Start Time
    { wch: 20 }, // End Time
    { wch: 12 }, // Status
  ];

  return exportToExcel({
    data: flashSellProducts,
    fileName,
    sheetName: "Flash Sell",
    columnWidths,
    dataMapper,
    successMessage: `Exported ${flashSellProducts.length} flash sell product${flashSellProducts.length === 1 ? "" : "s"} to Excel`,
  });
};

/**
 * Helper function to export order items to Excel
 * @param {Array} orderItems - Array of order item objects
 * @param {string} fileName - Optional custom file name (default: "Order_Items")
 */
export const exportOrderItemsToExcel = (orderItems, fileName = "Order_Items") => {
  const dataMapper = (item) => ({
    "Order ID": item.orderId ?? "-",
    Product: item.productName ?? "-",
    SKU: item.sku ?? "-",
    Quantity: item.quantity ?? 0,
    "Unit Price": item.unitPrice ?? 0,
    "Total Price": item.totalPrice ?? 0,
    "Order Status": item.orderStatus ?? "-",
    "Created At": item.createdAt ? new Date(item.createdAt).toLocaleString() : "-",
  });

  const columnWidths = [
    { wch: 15 }, // Order ID
    { wch: 30 }, // Product
    { wch: 15 }, // SKU
    { wch: 10 }, // Quantity
    { wch: 15 }, // Unit Price
    { wch: 15 }, // Total Price
    { wch: 15 }, // Order Status
    { wch: 20 }, // Created At
  ];

  return exportToExcel({
    data: orderItems,
    fileName,
    sheetName: "Order Items",
    columnWidths,
    dataMapper,
    successMessage: `Exported ${orderItems.length} order item${orderItems.length === 1 ? "" : "s"} to Excel`,
  });
};

