import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Tag, ArrowLeft, ShoppingBag, Info, ShoppingCart, User, Phone, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { useGetPublicProductQuery } from "@/features/product/productApiSlice";
import { useSaveIncompleteOrderMutation, useCreateOrderMutation } from "@/features/order/orderApiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

const PublicProductDetailPage = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const companyId = searchParams.get("cid");
    const navigate = useNavigate();

    const { data: product, isLoading, error } = useGetPublicProductQuery({ id, companyId }, {
        skip: !id || !companyId
    });

    const [saveIncomplete] = useSaveIncompleteOrderMutation();
    const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation();

    // Form state
    const [showCheckout, setShowCheckout] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        quantity: 1,
    });
    const [incompleteOrderId, setIncompleteOrderId] = React.useState(null);

    // Auto-save logic
    const saveTimeoutRef = React.useRef(null);
    const incompleteOrderIdRef = React.useRef(null);

    const performAutoSave = React.useCallback(async (data) => {
        if (!data.name.trim() && !data.phone.trim()) return;
        
        try {
            const payload = {
                customerName: data.name,
                customerPhone: data.phone,
                customerEmail: data.email,
                customerAddress: data.address,
                items: [{ productId: Number(id), quantity: data.quantity }],
                status: "incomplete"
            };

            const res = await saveIncomplete({
                body: payload,
                params: { companyId },
                orderId: incompleteOrderIdRef.current
            }).unwrap();

            if (res?.data?.id || res?.id) {
                const newId = res?.data?.id || res?.id;
                incompleteOrderIdRef.current = newId;
                setIncompleteOrderId(newId);
            }
        } catch (err) {
            console.error("Auto-save failed:", err);
        }
    }, [id, companyId, saveIncomplete]);

    React.useEffect(() => {
        if (!showCheckout) return;

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            performAutoSave(formData);
        }, 2000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [formData, showCheckout, performAutoSave]);

    // Handle beforeunload to save one last time
    React.useEffect(() => {
        const handleBeforeUnload = () => {
            if (showCheckout && (formData.name || formData.phone)) {
                performAutoSave(formData);
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            // Also call it on unmount (SPA navigation)
            if (showCheckout && (formData.name || formData.phone)) {
                performAutoSave(formData);
            }
        };
    }, [formData, showCheckout, performAutoSave]);

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error("Name and Phone are required");
            return;
        }

        try {
            const payload = {
                customerName: formData.name,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                customerAddress: formData.address,
                items: [{ productId: Number(id), quantity: formData.quantity }],
                companyId
            };

            await createOrder({ body: payload, params: { companyId } }).unwrap();
            toast.success("Order placed successfully!");
            setShowCheckout(false);
            setFormData({ name: "", phone: "", email: "", address: "", quantity: 1 });
            incompleteOrderIdRef.current = null;
            setIncompleteOrderId(null);
        } catch (err) {
            toast.error(err?.data?.message || "Failed to place order");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-widest">Loading Details</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-gray-100"
                >
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[28px] flex items-center justify-center mb-8 mx-auto">
                        <Info className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tighter">Product Unavailable</h1>
                    <p className="text-gray-500 mb-10 font-medium leading-relaxed">The product you are looking for might have been moved or the scan link is no longer active.</p>
                    <Button onClick={() => navigate("/")} className="w-full h-14 rounded-2xl bg-black text-white font-bold text-lg hover:bg-gray-900 transition-all">
                        Back to Home
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden pb-20">
            {/* Minimal Header */}
            <header className="h-20 border-b border-gray-50 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => window.history.back()} 
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-900" />
                    </button>
                    <div className="flex flex-col">
                        <span className="font-black text-2xl tracking-tighter italic leading-none">
                            NEXOVIA<span className="text-indigo-600">CART</span>
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-400">Authentic Catalog</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">Scan ID</span>
                        <span className="text-xs font-bold text-indigo-600">#{product.id}</span>
                     </div>
                     <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <ShoppingCart className="w-6 h-6" />
                     </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    {/* Image Section */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="sticky top-32"
                    >
                        <div className="relative group">
                            {/* Visual Glow */}
                            <div className="absolute -inset-4 bg-indigo-500/10 blur-3xl rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            
                            <div className="relative aspect-[4/5] bg-gray-50 rounded-[48px] overflow-hidden border border-gray-100 flex items-center justify-center shadow-inner group">
                                {product.thumbnail ? (
                                    <img 
                                        src={product.thumbnail} 
                                        alt={product.name} 
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-gray-200">
                                        <Package className="w-24 h-24" />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-300">No Image Preview</span>
                                    </div>
                                )}
                                
                                <div className="absolute bottom-6 left-6 right-6 flex gap-2">
                                    <div className="px-4 py-2 bg-white/90 backdrop-blur shadow-sm rounded-2xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black uppercase text-gray-900 tracking-wider">In Stock</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-10"
                    >
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge className="bg-indigo-600 text-white border-none rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-indigo-600/20">
                                    {product.category?.name || "Premium Collection"}
                                </Badge>
                                <div className="h-1 w-1 bg-gray-200 rounded-full"></div>
                                <span className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase leading-none mt-0.5">SKU: {product.sku}</span>
                            </div>
                            
                            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[0.95] tracking-tighter">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Exclusive Price</span>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-5xl font-black text-indigo-700 tracking-tighter italic leading-none">
                                            ৳ {product.discountPrice || product.price}
                                        </span>
                                        {product.discountPrice && (
                                            <span className="text-2xl text-gray-300 line-through font-bold decoration-red-500 decoration-2">
                                                ৳ {product.price}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-indigo-600 flex items-center gap-3">
                                    <div className="w-8 h-[2px] bg-indigo-600 rounded-full"></div>
                                    Product Blueprint
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-md font-medium">
                                    {product.description || "Every detail of this product has been engineered for excellence. From materials to assembly, we prioritize quality to ensure an exceptional experience for our valued clientele."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Weight</span>
                                    <span className="font-bold text-gray-900">{product.weight || "--"} {product.unit || "g"}</span>
                                </div>
                                <div className="bg-white p-4 rounded-3xl border border-gray-100 flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Availability</span>
                                    <span className="font-bold text-emerald-600">{product.stock > 0 ? "Ready to Ship" : "Backorder"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            {!showCheckout ? (
                                <Button 
                                    onClick={() => setShowCheckout(true)}
                                    className="w-full h-20 rounded-[28px] bg-black hover:bg-indigo-700 text-white font-black text-2xl transition-all duration-500 shadow-2xl shadow-indigo-500/20 active:scale-[0.98]"
                                >
                                    Purchase Now
                                </Button>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 space-y-6"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-black text-indigo-900 tracking-tighter italic">Complete Order</h3>
                                        <button onClick={() => setShowCheckout(false)} className="text-indigo-400 hover:text-indigo-600 transition-colors">
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                                <Input 
                                                    placeholder="Full Name" 
                                                    className="pl-12 h-14 rounded-2xl border-indigo-100 focus:border-indigo-500"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                                <Input 
                                                    placeholder="Phone Number" 
                                                    className="pl-12 h-14 rounded-2xl border-indigo-100 focus:border-indigo-500"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                                <Input 
                                                    placeholder="Email Address (Optional)" 
                                                    className="pl-12 h-14 rounded-2xl border-indigo-100 focus:border-indigo-500"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                />
                                            </div>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-6 w-5 h-5 text-indigo-300" />
                                                <Textarea 
                                                    placeholder="Shipping Address" 
                                                    className="pl-12 pt-5 h-32 rounded-2xl border-indigo-100 focus:border-indigo-500 resize-none"
                                                    value={formData.address}
                                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-indigo-100">
                                            <span className="text-xs font-black uppercase text-gray-400">Quantity</span>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData({...formData, quantity: Math.max(1, formData.quantity - 1)})}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="font-black text-lg w-8 text-center">{formData.quantity}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => setFormData({...formData, quantity: formData.quantity + 1})}
                                                    className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <Button 
                                            type="submit" 
                                            className="w-full h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl transition-all shadow-xl shadow-indigo-600/20"
                                            disabled={isPlacingOrder}
                                        >
                                            {isPlacingOrder ? "Processing..." : "Confirm Purchase"}
                                        </Button>

                                        <div className="flex items-center justify-center gap-2 pt-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Safe & Secured Checkout</p>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                            {!showCheckout && (
                                <div className="flex items-center justify-center gap-8 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Scan</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Merchant Verified</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="pt-10 border-t border-gray-100">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-indigo-600">
                                        <Info className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase">Need Assistance?</p>
                                        <p className="text-[10px] font-bold text-gray-400">Contact our support line for verified purchase.</p>
                                    </div>
                                </div>
                                <Button variant="link" className="text-indigo-600 font-bold p-0 h-auto">Contact Merchant</Button>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </main>
            
            <footer className="mt-20 py-12 px-6 text-center bg-gray-50/50">
                <div className="flex items-center justify-center gap-3 mb-4 grayscale opacity-30">
                     <span className="font-black text-lg tracking-tighter italic">NEXOVIA<span className="text-indigo-600">CART</span></span>
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.5em] mb-2 tracking-tighter">Unified E-Commerce Solutions Portfolio</p>
                <div className="text-[8px] text-gray-300 font-medium">EST 2024 • SYSTEM NODE-0192 • DHAKA, BD</div>
            </footer>
        </div>
    );
};

export default PublicProductDetailPage;
