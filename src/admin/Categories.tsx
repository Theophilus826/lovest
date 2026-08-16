
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import API from "../services/Api";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  FolderOpen,
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  imagePublicId?: string;
  active: boolean;
  createdAt?: string;
}

interface CategoryForm {
  name: string;
  description: string;
  active: boolean;
}

export default function Categories() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =====================================
  // CATEGORIES
  // =====================================

  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  // =====================================
  // MODAL
  // =====================================

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  // =====================================
  // FORM
  // =====================================

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    description: "",
    active: true,
  });

  // =====================================
  // IMAGE
  // =====================================

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  // =====================================
  // STATE
  // =====================================

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  // =====================================
  // FETCH CATEGORIES
  // =====================================

  const fetchCategories = async () => {
    try {
      setFetching(true);

      const response = await API.get("/admin/categories");

      setCategories(response.data?.data || []);
    } catch (error: any) {
      console.error(
        "Failed to fetch categories:",
        error
      );

      setMessage(
        error?.response?.data?.message ||
          "Failed to fetch categories."
      );
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =====================================
  // CLEAN PREVIEW URL
  // =====================================

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      active: true,
    });

    setImage(null);
    setPreview("");
    setEditingCategory(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================
  // OPEN CREATE
  // =====================================

  const openCreateModal = () => {
    resetForm();
    setMessage("");
    setShowModal(true);
  };

  // =====================================
  // OPEN EDIT
  // =====================================

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    setForm({
      name: category.name,
      description: category.description || "",
      active: category.active,
    });

    setImage(null);
    setPreview(category.image || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessage("");
    setShowModal(true);
  };

  // =====================================
  // CLOSE MODAL
  // =====================================

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    resetForm();
  };

  // =====================================
  // INPUT CHANGE
  // =====================================

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
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

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setMessage(
        "Image must be less than 5MB."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // Allowed image types
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "Please upload a PNG, JPG or WEBP image."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    // Remove previous blob preview
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // =====================================
  // REMOVE IMAGE
  // =====================================

  const removeImage = () => {
    if (preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================
  // CREATE / UPDATE CATEGORY
  // =====================================

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    setMessage("");

    // =====================================
    // VALIDATION
    // =====================================

    if (!form.name.trim()) {
      setMessage(
        "Category name is required."
      );
      return;
    }

    try {
      setLoading(true);

      // =====================================
      // FORM DATA
      // =====================================

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "active",
        String(form.active)
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      // =====================================
      // CREATE
      // =====================================

      if (!editingCategory) {
        await API.post(
          "/admin/categories",
          formData
        );

        setMessage(
          "Category created successfully."
        );
      }

      // =====================================
      // UPDATE
      // =====================================

      else {
        await API.put(
          `/admin/categories/${editingCategory._id}`,
          formData
        );

        setMessage(
          "Category updated successfully."
        );
      }

      // =====================================
      // CLOSE + REFRESH
      // =====================================

      setShowModal(false);
      resetForm();

      await fetchCategories();
    } catch (error: any) {
      console.error(
        "Category save error:",
        error
      );

      setMessage(
        error?.response?.data?.message ||
          `Failed to ${
            editingCategory
              ? "update"
              : "create"
          } category.`
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // DELETE CATEGORY
  // =====================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      await API.delete(
        `/admin/categories/${id}`
      );

      setCategories((prev) =>
        prev.filter(
          (category) =>
            category._id !== id
        )
      );

      setMessage(
        "Category deleted successfully."
      );
    } catch (error: any) {
      console.error(
        "Delete category error:",
        error
      );

      setMessage(
        error?.response?.data?.message ||
          "Failed to delete category."
      );
    }
  };

  // =====================================
  // FILTER
  // =====================================

  const filteredCategories =
    categories.filter((category) => {
      const searchValue =
        search.toLowerCase();

      return (
        category.name
          .toLowerCase()
          .includes(searchValue) ||
        category.description
          ?.toLowerCase()
          .includes(searchValue)
      );
    });

  // =====================================
  // UI
  // =====================================

  return (
    <div className="space-y-6">

      {/* =====================================
          HEADER
      ====================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <FolderOpen size={16} />

            <span>Store</span>

            <span>/</span>

            <span className="text-slate-900">
              Categories
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Organize your products into
            categories.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Add category
        </button>
      </div>

      {/* =====================================
          MESSAGE
      ====================================== */}

      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            message
              .toLowerCase()
              .includes("successfully")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* =====================================
          SEARCH
      ====================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search categories..."
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </div>
      </div>

      {/* =====================================
          TABLE
      ====================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Category
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* LOADING */}

              {fetching ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (

                /* EMPTY */

                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center"
                  >
                    <FolderOpen
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      No categories found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create your first
                      category.
                    </p>
                  </td>
                </tr>

              ) : (

                /* DATA */

                filteredCategories.map(
                  (category) => (
                    <tr
                      key={category._id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* CATEGORY */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          {category.image ? (
                            <img
                              src={
                                category.image
                              }
                              alt={
                                category.name
                              }
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <FolderOpen
                                size={20}
                              />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-900">
                              {category.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              ID:{" "}
                              {category._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-xs px-6 py-4">
                        <p className="truncate text-sm text-slate-500">
                          {category.description ||
                            "No description"}
                        </p>
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            category.active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {category.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                category
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="Edit"
                          >
                            <Pencil
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                category._id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>

                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================
          CREATE / EDIT MODAL
      ====================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory
                    ? "Edit category"
                    : "Add category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingCategory
                    ? "Update category information."
                    : "Create a new product category."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6"
            >

              {/* IMAGE */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Category image
                </label>

                {preview ? (
                  <div className="relative w-40 overflow-hidden rounded-xl border border-slate-200">

                    <img
                      src={preview}
                      alt="Category preview"
                      className="h-40 w-40 object-cover"
                    />

                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={loading}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow hover:text-red-600 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>

                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={loading}
                    className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ImageIcon
                      size={28}
                      className="text-slate-400"
                    />

                    <span className="mt-2 text-sm font-semibold text-slate-700">
                      Upload image
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      PNG, JPG or WEBP
                    </span>

                    <span className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
                      <Upload size={14} />
                      Choose image
                    </span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Maximum file size: 5MB.
                </p>
              </div>

              {/* NAME */}

              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category name
                </label>

                <input
                  id="category-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g. Electronics"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                  placeholder="Describe this category..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:bg-slate-50"
                />
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Active category
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Customers can see this
                    category.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.active}
                  disabled={loading}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      active:
                        e.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-slate-300"
                />
              </label>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />

                      {editingCategory
                        ? "Save changes"
                        : "Create category"}
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

