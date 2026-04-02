/**
 * Detects if an order is likely fake based on name, phone, address, and notes.
 * Checks for gibberish and invalid phone formats.
 * 
 * @param {Object} order The order object to test
 * @returns {Object} { isFake: boolean, reasons: string[] }
 */
export const detectFakeOrder = (order) => {
  if (!order) return { isFake: false, reasons: [] };

  const reasons = [];

  // Phone validation
  // Checking typical Bangladeshi phone format: 01xxxxxxxxx (11 digits, sometimes starts with +88)
  const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  const checkPhone = (phoneStr, fieldName) => {
    if (phoneStr) {
      const cleanPhone = phoneStr.toString().replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
         reasons.push(`Invalid ${fieldName}: ${phoneStr}`);
      }
    }
  };

  const mainPhone = order.customerPhone || order.customer?.phone || order.shippingPhone;
  if (!mainPhone) {
    reasons.push("Missing phone number");
  } else {
    checkPhone(mainPhone, "phone number");
  }

  // Gibberish checking logic
  const checkGibberish = (text, fieldName) => {
    if (!text || typeof text !== 'string') return;
    
    const str = text.toLowerCase().trim();
    if (str.length === 0) return;

    // Pattern 1: Same character repeating many times (e.g., "aaaaa")
    if (/([a-z])\1{4,}/.test(str)) {
      reasons.push(`Suspicious ${fieldName} (repeating chars): ${text}`);
      return;
    }

    // Pattern 2: keyboard mashing on middle row (asdfg...)
    const asdfStr = str.replace(/[^asdfghjkl]/g, '');
    if (asdfStr.length > 6 && asdfStr.length / str.length > 0.6) {
      reasons.push(`Suspicious ${fieldName} (keyboard mashing): ${text}`);
      return;
    }

    // Pattern 3: No vowels in a relatively long string
    const alphaOnly = str.replace(/[^a-z]/g, '');
    if (alphaOnly.length > 6) {
      const vowels = alphaOnly.match(/[aeiou]/g) || [];
      if (vowels.length === 0) {
        reasons.push(`Suspicious ${fieldName} (no vowels): ${text}`);
      }
    }
    
    // Pattern 4: Alternating or repeating identical small chunks (e.g., "dadadad")
    if (/^([a-z]{2,3})\1{2,}$/.test(str)) {
      reasons.push(`Suspicious ${fieldName} (repeating pattern): ${text}`);
    }
  };

  const nameToCheck = order.customerName || order.customer?.name;
  if (!nameToCheck || nameToCheck.length < 2) {
     reasons.push("Extremely short or missing customer name");
  } else {
     checkGibberish(nameToCheck, "customer name");
  }

  checkGibberish(order.customerAddress || order.billingAddress, "address");
  if (order.notes) checkGibberish(order.notes, "order notes");

  return {
    isFake: reasons.length > 0,
    reasons
  };
};
