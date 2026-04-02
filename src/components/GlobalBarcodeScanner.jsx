import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLazyGetProductsQuery } from "@/features/product/productApiSlice";
import { Package, ScanLine, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const GlobalBarcodeScanner = () => {
  const { t } = useTranslation();
  const [triggerSearch, { isLoading }] = useLazyGetProductsQuery();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [productData, setProductData] = useState(null);
  const [errorStatus, setErrorStatus] = useState("");
  
  const keyBuffer = useRef("");
  const timer = useRef(null);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept modifier keys alone
      if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      
      const isInputFocused = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);
      
      if (e.key === "Enter" && keyBuffer.current.length >= 3) {
        const scannedCode = keyBuffer.current;
        keyBuffer.current = "";
        clearTimeout(timer.current);
        
        // Prevent form sumit if focused on input
        if (isInputFocused) e.preventDefault();
        
        handleBarcodeScanned(scannedCode);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        keyBuffer.current += e.key;
        
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          keyBuffer.current = "";
        }, 60); // 60ms is sufficient for scanner typing interval
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer.current);
    };
  }, []);

  const handleBarcodeScanned = async (code) => {
    setModalOpen(true);
    setProductData(null);
    setErrorStatus("");
    
    try {
      const res = await triggerSearch({ search: code }).unwrap();
      const exactMatch = res?.find(p => p.sku?.toUpperCase() === code.toUpperCase());
      
      if (exactMatch) {
         setProductData(exactMatch);
      } else if (res?.length > 0) {
         setProductData(res[0]);
      } else {
         setErrorStatus(t("products.productNotFound", "No product found with this barcode."));
      }
    } catch (err) {
      setErrorStatus(t("common.error", "Error fetching data."));
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 dark:text-white">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <ScanLine className="w-6 h-6 text-white" />
             </div>
             {t("products.scannedProduct", "Scanned Product")}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
             {t("products.scannedDetailsMsg", "Details for the barcode you just scanned.")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-12">
               <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
               <p className="text-slate-500 font-medium animate-pulse">{t("common.loading", "Loading...")}</p>
             </div>
          ) : errorStatus ? (
             <div className="flex flex-col items-center justify-center py-16 text-center bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/20">
                <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t("common.notFound", "Not Found")}</h3>
                <p className="text-slate-500 max-w-xs">{errorStatus}</p>
             </div>
          ) : productData ? (
             <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-[200px] flex-shrink-0">
                   <div className="aspect-square rounded-[24px] bg-slate-100 dark:bg-slate-800/50 overflow-hidden flex items-center justify-center relative border border-slate-200/50 dark:border-slate-700/50 shadow-inner group transition-all">
                      {productData.thumbnail ? (
                        <img src={productData.thumbnail} alt={productData.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <Package className="w-16 h-16 text-slate-300" />
                      )}
                      
                      {productData.stock <= 0 && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                           {t("products.outOfStock", "Out of Stock")}
                        </div>
                      )}
                   </div>
                </div>
                
                <div className="flex-1 space-y-5">
                   <div>
                       <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">{productData.name}</h3>
                       <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                             SKU: {productData.sku}
                           </span>
                           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                             {productData.category?.name || "Uncategorized"}
                           </span>
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">{t("products.price", "Price")}</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">৳ {productData.price}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">{t("products.stock", "Stock")}</p>
                          <p className={`text-2xl font-black ${productData.stock > 10 ? 'text-emerald-500' : productData.stock > 0 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {productData.stock}
                          </p>
                       </div>
                   </div>
                   
                   {productData.description && (
                       <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mt-2 p-4 rounded-2xl bg-white/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                           <div dangerouslySetInnerHTML={{ __html: productData.description.substring(0, 150) + "..." }}></div>
                       </div>
                   )}
                </div>
             </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalBarcodeScanner;
