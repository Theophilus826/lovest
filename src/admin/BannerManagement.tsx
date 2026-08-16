import { useEffect, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaImage,
  FaTimes,
} from "react-icons/fa";
import API from "../services/Api";

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] =
    useState<Banner | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [order, setOrder] = useState("0");
  const [active, setActive] = useState(true);

  const [image, setImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string>("");

  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD BANNERS
  // ==========================================

  const loadBanners = async () => {
    try {
      setLoading(true);

      const response = await API.get("/admin/banners");

      const data = response.data?.data;

      setBanners(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "FAILED TO LOAD BANNERS:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setOrder("0");
    setActive(true);
    setImage(null);
    setPreview("");
    setEditingBanner(null);
  };

  // ==========================================
  // OPEN CREATE
  // ==========================================

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT
  // ==========================================

  const openEdit = (banner: Banner) => {
    setEditingBanner(banner);

    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setOrder(String(banner.order || 0));
    setActive(banner.active);

    setImage(null);
    setPreview(banner.image);

    setShowForm(true);
  };

  // ==========================================
  // IMAGE SELECT
  // ==========================================

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Banner title is required.");
      return;
    }

    if (!editingBanner && !image) {
      alert("Banner image is required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "subtitle",
        subtitle.trim()
      );

      formData.append(
        "active",
        String(active)
      );

      formData.append(
        "order",
        order
      );

      if (image) {
        formData.append(
          "image",
          image
        );
      }

      if (editingBanner) {
        await API.put(
          `/admin/banners/${editingBanner._id}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      } else {
        await API.post(
          "/admin/banners",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      }

      setShowForm(false);
      resetForm();

      await loadBanners();
    } catch (error: any) {
      console.error(
        "SAVE BANNER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to save banner."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const deleteBanner = async (
    banner: Banner
  ) => {
    const confirmed = window.confirm(
      `Delete "${banner.title}"?`
    );

    if (!confirmed) return;

    try {
      await API.delete(`/admin/banners/${banner._id}`);

      await loadBanners();
    } catch (error: any) {
      console.error(
        "DELETE BANNER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to delete banner."
      );
    }
  };

  // ==========================================
  // TOGGLE
  // ==========================================

  const toggleBanner = async (
    banner: Banner
  ) => {
    try {
      await API.patch(`/admin/banners/${banner._id}/toggle`);

      await loadBanners();
    } catch (error: any) {
      console.error(
        "TOGGLE BANNER ERROR:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to update banner."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Banners
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the banners displayed on your
            homepage.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <FaPlus />
          Add Banner
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            Loading banners...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && banners.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

          <FaImage className="mx-auto text-5xl text-gray-300" />

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No banners yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload your first homepage banner.
          </p>

          <button
            onClick={openCreate}
            className="mt-5 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white"
          >
            Add Banner
          </button>

        </div>
      )}

      {/* BANNERS */}

      {!loading && banners.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">

          {banners.map((banner) => (
            <div
              key={banner._id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm"
            >

              {/* IMAGE */}

              <div className="relative h-52">

                <img
                  src={banner.image}
                  alt={banner.title}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/30" />

                {/* STATUS */}

                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                    banner.active
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {banner.active
                    ? "Active"
                    : "Inactive"}
                </span>

                {/* ORDER */}

                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                  Order: {banner.order}
                </span>

                {/* TEXT */}

                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">

                  <h2 className="text-xl font-bold">
                    {banner.title}
                  </h2>

                  {banner.subtitle && (
                    <p className="mt-1 text-sm">
                      {banner.subtitle}
                    </p>
                  )}

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex items-center justify-between gap-2 p-4">

                <button
                  onClick={() =>
                    toggleBanner(banner)
                  }
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    banner.active
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  <FaPowerOff />

                  {banner.active
                    ? "Deactivate"
                    : "Activate"}
                </button>

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      openEdit(banner)
                    }
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600"
                  >
                    <FaEdit />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteBanner(banner)
                    }
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
                  >
                    <FaTrash />
                    Delete
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ========================================
          FORM MODAL
      ======================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-100 p-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingBanner
                    ? "Edit Banner"
                    : "Add Banner"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Upload a banner for the homepage.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600"
              >
                <FaTimes />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >

              {/* IMAGE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Banner Image
                </label>

                <label className="block cursor-pointer">

                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-52 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
                      <div className="text-center">
                        <FaImage className="mx-auto text-4xl text-gray-300" />

                        <p className="mt-2 text-sm text-gray-500">
                          Click to select image
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                </label>

              </div>

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Mega Sale"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

              {/* SUBTITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Subtitle
                </label>

                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) =>
                    setSubtitle(e.target.value)
                  }
                  placeholder="Up to 50% OFF"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />

              </div>

              {/* ORDER */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Display Order
                </label>

                <input
                  type="number"
                  value={order}
                  onChange={(e) =>
                    setOrder(e.target.value)
                  }
                  min="0"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Lower numbers appear first.
                </p>

              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) =>
                    setActive(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5 accent-orange-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Show this banner on homepage
                </span>

              </label>

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingBanner
                    ? "Update Banner"
                    : "Upload Banner"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}