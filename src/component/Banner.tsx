import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import API from "../services/Api";

interface BannerData {
  _id: string;
  title: string;
  subtitle?: string;
  image?: string;
  active: boolean;
  order: number;
}

export default function Banner() {
  const [banners, setBanners] = useState<BannerData[]>(
    []
  );

  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD BANNERS
  // ==========================================

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response =
          await API.get("/banners");

        console.log(
          "HOME BANNERS:",
          response.data
        );

        const bannerData =
          response.data?.data;

        const activeBanners = Array.isArray(
          bannerData
        )
          ? bannerData
              .filter(
                (banner: BannerData) =>
                  banner.active &&
                  banner.image
              )
              .sort(
                (
                  a: BannerData,
                  b: BannerData
                ) =>
                  (a.order || 0) -
                  (b.order || 0)
              )
          : [];

        setBanners(activeBanners);
        setCurrent(0);
      } catch (error) {
        console.error(
          "FAILED TO LOAD BANNERS:",
          error
        );

        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  // ==========================================
  // AUTO SLIDE
  // ==========================================

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === banners.length - 1
          ? 0
          : prev + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  // ==========================================
  // NEXT
  // ==========================================

  const next = () => {
    if (banners.length === 0) return;

    setCurrent((prev) =>
      prev === banners.length - 1
        ? 0
        : prev + 1
    );
  };

  // ==========================================
  // PREVIOUS
  // ==========================================

  const previous = () => {
    if (banners.length === 0) return;

    setCurrent((prev) =>
      prev === 0
        ? banners.length - 1
        : prev - 1
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <section className="mt-4 px-4">
        <div className="h-52 animate-pulse rounded-2xl bg-gray-200" />
      </section>
    );
  }

  // ==========================================
  // NO BANNERS
  // ==========================================

  if (banners.length === 0) {
    return null;
  }

  const banner = banners[current];

  // ==========================================
  // UI
  // ==========================================

  return (
    <section className="mt-4 px-4">

      <div className="relative h-52 overflow-hidden rounded-2xl shadow-lg">

        {/* IMAGE */}

        <img
          src={banner.image || undefined}
          alt={banner.title}
          className="h-full w-full object-cover"
        />

        {/* OVERLAY */}

        <div className="absolute inset-0 bg-black/40" />

        {/* CONTENT */}

        <div className="absolute inset-0 flex flex-col justify-center px-8 text-white">

          <h1 className="text-3xl font-bold">
            {banner.title}
          </h1>

          {banner.subtitle && (
            <p className="mt-2 text-lg">
              {banner.subtitle}
            </p>
          )}

          <button
            type="button"
            className="mt-5 w-36 rounded-lg bg-orange-500 py-2 font-semibold transition hover:bg-orange-600"
          >
            Shop Now
          </button>

        </div>

        {/* PREVIOUS */}

        {banners.length > 1 && (
          <button
            type="button"
            onClick={previous}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition hover:bg-white"
          >
            <FaChevronLeft />
          </button>
        )}

        {/* NEXT */}

        {banners.length > 1 && (
          <button
            type="button"
            onClick={next}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-800 shadow transition hover:bg-white"
          >
            <FaChevronRight />
          </button>
        )}

      </div>

      {/* DOTS */}

      {banners.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">

          {banners.map((bannerItem, index) => (
            <button
              key={bannerItem._id}
              type="button"
              aria-label={`Go to banner ${
                index + 1
              }`}
              onClick={() =>
                setCurrent(index)
              }
              className={`h-3 w-3 rounded-full transition ${
                current === index
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />
          ))}

        </div>
      )}

    </section>
  );
}