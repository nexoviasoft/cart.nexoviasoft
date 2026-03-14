import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useUpdateProductMutation,
  useGetProductQuery,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import {
  ProductFormHeader,
  ProductCoverImageSection,
  ProductImagesSection,
  ProductNameSection,
  ProductCategorySection,
  ProductSizeVariantSection,
  ProductVariantSection,
  ProductDescriptionSection,
  ProductShippingSection,
  ProductPricingSection,
  ProductFormActions,
} from "@/pages/products/components/sections";

const productSchema = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be less than 200 characters")
    .trim(),
  description: yup
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0"),
  discountPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Discount price must be a number")
    .positive("Discount price must be greater than 0")
    .test(
      "less-than-price",
      "Discount price must be less than regular price",
      function (value) {
        const { price } = this.parent;
        if (!value || !price) return true;
        return value < price;
      },
    ),
  stock: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
  weight: yup.number().nullable().transform((v, o) => (o === "" ? null : v)).min(0),
  length: yup.number().nullable().transform((v, o) => (o === "" ? null : v)).min(0),
  breadth: yup.number().nullable().transform((v, o) => (o === "" ? null : v)).min(0),
  width: yup.number().nullable().transform((v, o) => (o === "" ? null : v)).min(0),
});

export default function ProductEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: product, isLoading: isLoadingProduct } = useGetProductQuery(
    parseInt(id, 10),
    { skip: !id }
  );
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });

  const [categoryOption, setCategoryOption] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [sizes, setSizes] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSizeValue, setNewSizeValue] = useState("");
  const [variants, setVariants] = useState([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantColor, setNewVariantColor] = useState("#6366f1");
  const [selectedType, setSelectedType] = useState("");
  const initializedRef = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const typeOptions = useMemo(() => ["tshirt", "shirt", "shoes", "pant", "coqizitem"], []);
  const sizeOptionsMap = useMemo(
    () => ({
      tshirt: [
        { value: "XS", label: "XS" },
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
        { value: "XL", label: "XL" },
        { value: "XXL", label: "XXL" },
        { value: "XXXL", label: "XXXL" },
      ],
      shirt: [
        { value: "XS", label: "XS" },
        { value: "S", label: "S" },
        { value: "M", label: "M" },
        { value: "L", label: "L" },
        { value: "XL", label: "XL" },
        { value: "XXL", label: "XXL" },
        { value: "XXXL", label: "XXXL" },
      ],
      pant: [
        { value: "28", label: "28" },
        { value: "30", label: "30" },
        { value: "32", label: "32" },
        { value: "34", label: "34" },
        { value: "36", label: "36" },
        { value: "38", label: "38" },
        { value: "40", label: "40" },
        { value: "42", label: "42" },
      ],
      shoes: [
        { value: "28", label: "28" },
        { value: "30", label: "30" },
        { value: "32", label: "32" },
        { value: "34", label: "34" },
        { value: "36", label: "36" },
        { value: "38", label: "38" },
        { value: "40", label: "40" },
        { value: "42", label: "42" },
      ],
      coqizitem: [
        { value: "100gm", label: "100gm" },
        { value: "250gm", label: "250gm" },
        { value: "500gm", label: "500gm" },
        { value: "1kg", label: "1kg" },
      ],
    }),
    [],
  );

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories],
  );

  const watchedName = watch("name");

  // Pre-fill form and state from product (same structure as create)
  useEffect(() => {
    if (!product || initializedRef.current) return;
    initializedRef.current = true;
    setValue("name", product.name || "");
    setValue("price", product.price ?? "");
    setValue("discountPrice", product.discountPrice ?? "");
    setValue("description", product.description || "");
    setValue("stock", product.stock ?? 0);
    setValue("weight", product.weight ?? "");
    setValue("length", product.length ?? "");
    setValue("breadth", product.breadth ?? "");
    setValue("width", product.width ?? "");

    if (product.thumbnail) setThumbnailUrl(product.thumbnail);
    if (product.images?.length) {
      setImageFiles(
        product.images.map((img) => ({
          url: img.url,
          alt: img.alt || "",
          isPrimary: !!img.isPrimary,
          file: null,
        }))
      );
    }

    if (product.category || product.categoryId) {
      const catId = product.category?.id ?? product.categoryId;
      const found = categories.find((c) => c.id === catId);
      if (found) setCategoryOption({ label: found.name, value: found.id });
    }

    if (product.types?.length) {
      setSelectedType(product.types[0] || "");
    }

    if (product.sizes?.length) {
      const defaultSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const sizeList = [
        ...new Set([...defaultSizes, ...product.sizes.map(String)]),
      ];
      setSizes(sizeList);
      setSelectedSizes(product.sizes.map(String));
    }

    if (product.variants?.length) {
      setVariants(
        product.variants.map((v, i) => ({
          name: typeof v === "object" ? v.name : String(v),
          color: typeof v === "object" ? (v.color || "#6366f1") : "#6366f1",
          id: v.id ?? Date.now() + i,
        }))
      );
    }
  }, [product, categories, setValue]);

  const handleAddVariant = useCallback(() => {
    if (newVariantName.trim()) {
      setVariants((prev) => [
        ...prev,
        { name: newVariantName.trim(), color: newVariantColor, id: Date.now() },
      ]);
      setNewVariantName("");
      setNewVariantColor("#6366f1");
      setIsAddingVariant(false);
    }
  }, [newVariantName, newVariantColor]);

  const removeVariant = useCallback((id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const updateVariant = useCallback((id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  }, []);

  const removeImage = useCallback((index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = useCallback(
    async (data, options = {}) => {
      const asDraft = options.asDraft ?? false;
      if (!product) return;
      try {
        let finalThumbnailUrl = null;
        if (thumbnailFile) {
          finalThumbnailUrl = await uploadImage(thumbnailFile);
          if (!finalThumbnailUrl) {
            toast.error(t("productForm.failedUploadThumbnail"));
            return;
          }
        } else if (thumbnailUrl?.trim()) {
          finalThumbnailUrl = thumbnailUrl.trim();
        } else if (product.thumbnail) {
          finalThumbnailUrl = product.thumbnail;
        }

        const uploadedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const img = imageFiles[i];
          if (img.file) {
            const url = await uploadImage(img.file);
            if (url)
              uploadedImages.push({
                url,
                alt: img.alt || `Product image ${i + 1}`,
                isPrimary: !!img.isPrimary,
              });
          } else if (img.url) {
            uploadedImages.push({
              url: img.url,
              alt: img.alt || `Product image ${i + 1}`,
              isPrimary: !!img.isPrimary,
            });
          }
        }
        if (
          uploadedImages.length > 0 &&
          !uploadedImages.some((img) => img.isPrimary)
        ) {
          uploadedImages[0].isPrimary = true;
        }

        const payload = {
          name: data.name.trim(),
          price: parseFloat(data.price) || 0,
          discountPrice: data.discountPrice
            ? parseFloat(data.discountPrice)
            : null,
          description: data.description?.trim() || "",
          images: uploadedImages,
          thumbnail: finalThumbnailUrl || null,
          categoryId: categoryOption?.value || null,
          status: asDraft ? "draft" : "published",
          stock: data.stock != null ? parseInt(data.stock, 10) : 0,
          sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
          variants:
            variants.length > 0 ? variants.map((v) => ({ name: v.name })) : undefined,
          weight: data.weight ? parseFloat(data.weight) : undefined,
          length: data.length ? parseFloat(data.length) : undefined,
          breadth: data.breadth ? parseFloat(data.breadth) : undefined,
          width: data.width ? parseFloat(data.width) : undefined,
          unit: "Piece",
          types: selectedType ? [selectedType] : undefined,
        };

        await updateProduct({
          id: product.id,
          body: payload,
          params: { companyId: user?.companyId },
        }).unwrap();
        toast.success(
          asDraft
            ? t("productForm.productSavedAsDraft")
            : t("productForm.productUpdated")
        );
        navigate("/products");
      } catch (err) {
        toast.error(err?.data?.message || t("productForm.productUpdateFailed"));
      }
    },
    [
      product,
      thumbnailFile,
      thumbnailUrl,
      imageFiles,
      categoryOption,
      selectedSizes,
      variants,
      selectedType,
      uploadImage,
      updateProduct,
      user,
      navigate,
      t,
    ]
  );

  if (isLoadingProduct || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t("products.loadingProductDetails")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <ProductFormHeader 
        title={t("productForm.editProduct")} 
        backLabel={t("productForm.backToProductList")} 
      />

      <div className="max-w-[1600px] mx-auto p-6 pt-8">
        <form
          onSubmit={handleSubmit((d) => onSubmit(d, { asDraft: false }))}
          className="grid grid-cols-12 gap-8"
        >
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <ProductCoverImageSection
              thumbnailFile={thumbnailFile}
              thumbnailUrl={thumbnailUrl}
              setThumbnailFile={setThumbnailFile}
              setThumbnailUrl={setThumbnailUrl}
            />
            <ProductImagesSection
              imageFiles={imageFiles}
              setImageFiles={setImageFiles}
              imageUrlInput={imageUrlInput}
              setImageUrlInput={setImageUrlInput}
              removeImage={removeImage}
            />
            <ProductNameSection register={register} errors={errors} />
            <ProductCategorySection
              categoryOptions={categoryOptions}
              categoryOption={categoryOption}
              setCategoryOption={setCategoryOption}
            />

            <div className="space-y-4 rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Product Types
                </h3>
              </div>
              <RadioGroup value={selectedType} onValueChange={(val) => {
                setSelectedType(val);
                setSelectedSizes([]);
              }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {typeOptions.map((opt) => {
                  const id = `type-${opt}`;
                  return (
                    <div key={opt} className="flex items-center gap-2 p-2 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                      <RadioGroupItem value={opt} id={id} />
                      <label htmlFor={id} className="text-sm cursor-pointer">
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {selectedType && (
              <div className="space-y-4 rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Size Options
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(sizeOptionsMap[selectedType] || []).map((opt) => {
                    const checked = selectedSizes.includes(opt.value);
                    return (
                      <div
                        key={opt.value}
                        onClick={() =>
                          setSelectedSizes((prev) =>
                            checked
                              ? prev.filter((v) => v !== opt.value)
                              : [...prev, opt.value],
                          )
                        }
                        className={`cursor-pointer select-none px-3 py-2 rounded-xl border ${
                          checked
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                            : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-gray-700 dark:text-gray-300"
                        } text-sm font-medium text-center`}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
     
            <ProductDescriptionSection
              control={control}
              errors={errors}
              watchedName={watchedName}
            />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24 h-fit">
            <ProductShippingSection register={register} errors={errors} />
            <ProductPricingSection register={register} errors={errors} />
            <ProductFormActions
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              isUpdating={isUpdating}
              isUploading={isUploading}
              isValid={isValid}
              submitLabel={t("productForm.publish")}
              savingLabel={t("productForm.saving")}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
