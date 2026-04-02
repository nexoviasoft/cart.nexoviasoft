import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Printer, Search, Check, Package, QrCode as QrIcon, Barcode as BarIcon, X, Plus, Minus } from "lucide-react";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import JsBarcode from "jsbarcode";

const ProductStickerPage = () => {
    const { t } = useTranslation();
    const authUser = useSelector((state) => state.auth.user);
    const { data: products = [], isLoading } = useGetProductsQuery({ companyId: authUser?.companyId });
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [quantity, setQuantity] = useState(1);

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    useEffect(() => {
        if (selectedProduct) {
            // Generate Barcode for all copies
            const timer = setTimeout(() => {
                try {
                    JsBarcode(".barcode-element", selectedProduct.sku, {
                        format: "CODE128",
                        width: 2,
                        height: 60,
                        displayValue: true,
                        fontSize: 14,
                        margin: 10
                    });
                } catch (err) {
                    console.error("Barcode generation failed", err);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [selectedProduct, quantity]);

    const handlePrint = () => {
        window.print();
    };

    const StickerItem = ({ product, isPreview = false }) => (
        <div className={`bg-white p-3 w-[240px] text-black flex flex-col items-center justify-center rounded-xl bg-gradient-to-b from-white to-gray-50 ${isPreview ? 'shadow-2xl border-2 border-indigo-100' : 'm-2 border border-gray-200 shadow-sm page-break-inside-avoid'}`}>
            <div className="w-full text-center pb-2 mb-2 border-b border-gray-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Premium Quality</p>
                <p className="text-[12px] font-bold text-gray-900 leading-tight mt-1 px-2 line-clamp-2">{product?.name}</p>
            </div>
            
            <div className="w-full flex flex-col items-center">
                <svg className="barcode-element w-full h-[50px]"></svg>
            </div>
            
            <div className="w-full flex justify-between items-end mt-2 pt-2 border-t border-gray-100">
                <div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase">SKU / ITEM CODE</p>
                    <p className="text-[10px] font-bold text-gray-700">{product?.sku}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400 uppercase">MSRP</p>
                    <p className="text-[14px] font-black text-gray-900">৳ {product?.price}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans no-print">
            <div className="max-w-5xl mx-auto space-y-8 no-print">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Product Stickers</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Generate and print professional stickers for your products</p>
                    </div>
                </motion.div>

                {/* Selection Section */}
                <div className="relative group max-w-2xl no-print">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type product name or SKU to search..."
                            className="pl-12 h-14 rounded-2xl bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 focus:ring-2 focus:ring-indigo-500 shadow-sm text-lg"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>

                    {searchTerm && filteredProducts.length > 0 && !selectedProduct && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => {
                                        setSelectedProduct(product);
                                        setSearchTerm("");
                                        setQuantity(1);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors text-left border-b border-gray-50 dark:border-gray-800 last:border-0"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-black/40 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden">
                                        {product.thumbnail ? (
                                            <img src={product.thumbnail} alt="" className="w-full h-full object-cover" />
                                        ) : <Package className="w-6 h-6 text-gray-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                                        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 dark:text-white">৳ {product.price}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{product.category?.name || "Uncategorized"}</p>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Preview Section */}
                {selectedProduct ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start no-print"
                    >
                        {/* Control Panel */}
                        <div className="lg:col-span-5 space-y-6">
                            <Card className="rounded-[32px] border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-[#1a1f26] overflow-hidden">
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center">
                                            <Check className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Configuration</h2>
                                            <p className="text-sm text-gray-400 font-medium">Set quantity and details</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Product Title</p>
                                            <p className="font-black text-gray-900 dark:text-white truncate">{selectedProduct.name}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800/50">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Print Quantity</p>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <Input 
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-20 text-center font-black h-10 rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-black"
                                                />
                                                <button 
                                                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                                    className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-4">
                                        <Button 
                                            onClick={handlePrint}
                                            className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02]"
                                        >
                                            <Printer className="mr-3 w-6 h-6" />
                                            Print {quantity} Sticker{quantity > 1 ? 's' : ''}
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                setSearchTerm("");
                                            }}
                                            className="h-14 rounded-2xl text-gray-400 font-bold"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sticker Preview */}
                        <div className="lg:col-span-7 space-y-6 no-print">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Live Preview
                            </h3>
                            <div className="flex items-center justify-center p-8 bg-white dark:bg-black/20 rounded-[32px] border-2 border-dashed border-gray-100 dark:border-gray-800 overflow-hidden">
                                <StickerItem product={selectedProduct} isPreview={true} />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    !isLoading && (
                        <div className="text-center py-32 bg-white dark:bg-[#1a1f26] rounded-[40px] border border-gray-100 dark:border-gray-800 no-print">
                            <Package className="w-12 h-12 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-bold">Select a product to begin</h3>
                            <p className="text-gray-400 mt-2">Find a product to generate printable stickers</p>
                        </div>
                    )
                )}
            </div>

            {/* The actual hidden print container - moved to portal */}
            {selectedProduct && createPortal(
                <div id="print-area" className="bg-white">
                    <div className="flex flex-wrap justify-center gap-4 bg-white">
                        {Array.from({ length: quantity }).map((_, i) => (
                            <StickerItem key={i} product={selectedProduct} />
                        ))}
                    </div>
                </div>,
                document.body
            )}

            <style>
                {`
                @media screen {
                    #print-area {
                        display: none;
                    }
                }
                @media print {
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    /* NUCLEAR OPTION: Hide the entire app root */
                    #root {
                        display: none !important;
                    }
                    /* Show ONLY the portal content */
                    #print-area {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        min-height: 100vh !important;
                        background: white !important;
                        z-index: 99999 !important;
                        padding: 10px !important;
                    }
                    #print-area * {
                        visibility: visible !important;
                        color: black !important;
                        border-color: black !important;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default ProductStickerPage;

