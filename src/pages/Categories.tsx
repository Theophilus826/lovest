import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
  image: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);

  useEffect(() => {
    const data: Category[] = [
      {
        _id: "1",
        name: "Phones",
        image: "https://picsum.photos/200?1",
      },
      {
        _id: "2",
        name: "Fashion",
        image: "https://picsum.photos/200?2",
      },
      {
        _id: "3",
        name: "Electronics",
        image: "https://picsum.photos/200?3",
      },
      {
        _id: "4",
        name: "Beauty",
        image: "https://picsum.photos/200?4",
      },
      {
        _id: "5",
        name: "Computing",
        image: "https://picsum.photos/200?5",
      },
      {
        _id: "6",
        name: "Home",
        image: "https://picsum.photos/200?6",
      },
      {
        _id: "7",
        name: "Sports",
        image: "https://picsum.photos/200?7",
      },
    ];

    setCategories(data);

    if (data.length > 0) {
      setSelected(data[0]);
    }
  }, []);

  return (
    <div className="flex h-[calc(100vh-9rem)] bg-gray-100">
      {/* Left Categories */}
      <aside className="w-32 overflow-y-auto border-r bg-white">
        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => setSelected(category)}
            className={`w-full border-l-4 px-3 py-4 text-left text-sm transition ${
              selected?._id === category._id
                ? "border-orange-500 bg-orange-50 font-semibold text-orange-600"
                : "border-transparent hover:bg-gray-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </aside>

      {/* Right Content */}
      <main className="flex-1 overflow-y-auto p-4">
        {selected && (
          <>
            <h2 className="mb-5 text-xl font-bold">
              {selected.name}
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <button
                  key={index}
                  className="rounded-xl bg-white p-3 shadow transition hover:shadow-lg"
                >
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="mx-auto h-16 w-16 rounded-full object-cover"
                  />

                  <p className="mt-3 text-sm font-medium">
                    {selected.name} {index + 1}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}