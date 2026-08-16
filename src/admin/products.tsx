import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../services/Api";

import {
  Upload,
  X,
  Image as ImageIcon,
  Package,
  Star,
  CheckCircle2,
  Tag,
} from "lucide-react";

// =====================================
// TYPES
// =====================================

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
}

// =====================================
// PRODUCTS
// =====================================

export default function Products() {
  // =====================================
  // CATEGORIES
  // =====================================

  const [categories, setCategories] = useState<Category[]>([]);

  const [fetchingCategories, setFetchingCategories] = useState(true);

  // =====================================
  // IMAGES
  // =====================================

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<File[]>([]);

  const [previews, setPreviews] = useState<string[]>([]);

  // =====================================
  // FORM
  // =====================================

  const [form, setForm] = useState({
    name: "",
    description: "",

    // Original/crossed-out price
    originalPrice: "",

    // Real selling price
    price: "",

    category: "",
    stock: "",

    featured: false,
    active: true,
  });

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // =====================================
  // FETCH CATEGORIES
  // =====================================

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      setMessage("");

      const response = await API.get("/admin/categories");

      setCategories(
        Array.isArray(response.data?.data) ? response.data.data : [],
      );
    } catch (error: any) {
      console.error("Failed to fetch categories:", error);

      setMessage(
        error?.response?.data?.message || "Failed to load categories.",
      );
    } finally {
      setFetchingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================
  // IMAGE CHANGE
  // =====================================

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    const selectedFiles = Array.from(e.target.files);

    const selectedPreviews = selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );

    previews.forEach((url) => URL.revokeObjectURL(url));

    setImages(selectedFiles);
    setPreviews(selectedPreviews);
  };

  // =====================================
  // REMOVE IMAGES
  // =====================================

  const removeImages = () => {
    previews.forEach((url) => URL.revokeObjectURL(url));

    setImages([]);
    setPreviews([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================
  // VALIDATE PRICES
  // =====================================

  const originalPrice = Number(form.originalPrice || 0);

  const sellingPrice = Number(form.price || 0);

  const hasDiscount =
    originalPrice > 0 && sellingPrice > 0 && sellingPrice < originalPrice;

  const discountAmount = hasDiscount ? originalPrice - sellingPrice : 0;

  const discountPercentage = hasDiscount
    ? Math.round((discountAmount / originalPrice) * 100)
    : 0;

  // =====================================
  // CREATE PRODUCT
  // =====================================

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // -------------------------------------
    // BASIC VALIDATION
    // -------------------------------------

    if (!form.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    if (!form.category) {
      setMessage("Please select a category.");
      return;
    }

    if (!form.price || sellingPrice <= 0) {
      setMessage("Please enter a valid selling price.");
      return;
    }

    if (form.originalPrice && originalPrice < sellingPrice) {
      setMessage("Original price cannot be lower than the selling price.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      // ===================================
      // PRODUCT INFORMATION
      // ===================================

      formData.append("name", form.name.trim());

      formData.append("description", form.description.trim());

      // ===================================
      // PRICES
      // ===================================

      // Crossed-out/original price
      formData.append("originalPrice", form.originalPrice);
      console.log("FORM DATA VALUES:", {
        originalPrice: form.originalPrice,
        price: form.price,
        category: form.category,
        stock: form.stock,
      });
      // Real selling price
      formData.append("price", form.price);

      // ===================================
      // OTHER PRODUCT DATA
      // ===================================

      formData.append("category", form.category);

      formData.append("stock", form.stock || "0");

      formData.append("featured", String(form.featured));

      formData.append("active", String(form.active));

      // ===================================
      // MULTIPLE IMAGES
      // ===================================

      images.forEach((file) => {
        formData.append("images", file);
      });

      // ===================================
      // API
      // ===================================

      const response = await API.post("/admin/products", formData);

      setMessage(response.data?.message || "Product created successfully.");

      // ===================================
      // RESET
      // ===================================

      removeImages();

      setForm({
        name: "",
        description: "",
        originalPrice: "",
        price: "",
        category: "",
        stock: "",
        featured: false,
        active: true,
      });
    } catch (error: any) {
      console.error("Failed to create product:", error);

      setMessage(error?.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // ACTIVE CATEGORIES
  // =====================================

  const activeCategories = categories.filter((category) => category.active);

  // =====================================
  // UI
  // =====================================

  return (
    <div className="space-y-6">
      {/* =================================
          PAGE HEADER
      ================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Package size={16} />

            <span>Store</span>

            <span>/</span>

            <span className="text-slate-900">Products</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Add Product
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new product and add it to your store.
          </p>
        </div>
      </div>

      {/* =================================
          MESSAGE
      ================================== */}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message.includes("successfully")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* =================================
          FORM
      ================================== */}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1fr_360px]"
      >
        {/* =================================
            LEFT
        ================================== */}

        <div className="space-y-6">
          {/* PRODUCT INFORMATION */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">
                Product information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information about your product.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* NAME */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product name
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Premium Wireless Headphones"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Describe your product..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* =================================
                  PRICE SECTION
              ================================== */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-slate-500" />

                  <h3 className="text-sm font-semibold text-slate-900">
                    Pricing
                  </h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* ORIGINAL PRICE */}

                  <div>
                    <label
                      htmlFor="originalPrice"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Original price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        ₦
                      </span>

                      <input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.originalPrice}
                        onChange={handleChange}
                        placeholder="100.00"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Displayed crossed out.
                    </p>
                  </div>

                  {/* REAL PRICE */}

                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Selling price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                        ₦
                      </span>

                      <input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="75.00"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-4 text-sm font-semibold outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">
                      Actual customer price.
                    </p>
                  </div>
                </div>

                {/* PRICE PREVIEW */}

                {sellingPrice > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Customer sees
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {originalPrice > sellingPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          ₦{originalPrice.toFixed(2)}
                        </span>
                      )}

                      <span className="text-xl font-bold text-slate-900">
                        ₦{sellingPrice.toFixed(2)}
                      </span>

                      {hasDiscount && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <p className="mt-2 text-xs text-slate-500">
                        Customer saves ₦{discountAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* STOCK */}

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Stock quantity
                </label>

                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={fetchingCategories}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {fetchingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {activeCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {!fetchingCategories && activeCategories.length === 0 && (
                  <p className="mt-2 text-xs text-red-500">
                    No active categories available. Create a category first.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* =================================
              PRODUCT SETTINGS
          ================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">Product settings</h2>

              <p className="mt-1 text-sm text-slate-500">
                Control how this product appears in your store.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Active product
                    </p>

                    <p className="text-xs text-slate-500">
                      Product will be visible to customers.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>

              {/* FEATURED */}

              <label className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Star size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Featured product
                    </p>

                    <p className="text-xs text-slate-500">
                      Highlight this product on your store.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>
            </div>
          </section>
        </div>

        {/* =================================
            RIGHT
        ================================== */}

        <div className="space-y-6">
          {/* IMAGE UPLOAD */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-semibold text-slate-900">Product images</h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload your product images.
              </p>
            </div>

            <div className="p-6">
              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {previews.map((src, index) => (
                      <div
                        key={src}
                        className="relative overflow-hidden rounded-2xl border border-slate-200"
                      >
                        <img
                          src={src}
                          alt={`Product preview ${index + 1}`}
                          className="aspect-square w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      Change images
                    </button>

                    <button
                      type="button"
                      onClick={removeImages}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <X size={16} />
                      Remove all
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-slate-400 hover:bg-slate-100"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                    <ImageIcon size={25} />
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    Upload product images
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    PNG, JPG or WEBP
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                    <Upload size={14} />
                    Choose images
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="sr-only"
              />

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Maximum file size: 5MB per image.
              </p>
            </div>
          </section>

          {/* =================================
              PRICE SUMMARY
          ================================== */}

          {sellingPrice > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Price summary</h2>

              <div className="mt-4 space-y-3">
                {originalPrice > sellingPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Original price</span>

                    <span className="text-slate-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Selling price
                  </span>

                  <span className="text-lg font-bold text-slate-900">
                    ${sellingPrice.toFixed(2)}
                  </span>
                </div>

                {hasDiscount && (
                  <div className="flex justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm text-emerald-600">Discount</span>

                    <span className="text-sm font-bold text-emerald-600">
                      {discountPercentage}% OFF
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =================================
              PUBLISH
          ================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Publish</h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Review your product information before publishing.
            </p>

            <button
              type="submit"
              disabled={
                loading || fetchingCategories || activeCategories.length === 0
              }
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating product...
                </>
              ) : (
                <>
                  <Upload size={17} />
                  Create product
                </>
              )}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
