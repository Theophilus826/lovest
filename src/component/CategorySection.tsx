import type { Category } from "../types/category";
import CategoryItem from "./CategoryItem";

interface Props {
  categories: Category[];
}

export default function CategorySection({
  categories,
}: Props) {
  return (
    <section className="px-4 py-5">

      <div className="flex justify-between items-center mb-4">

        <h2 className="text-lg font-bold">
          Categories
        </h2>

        <button className="text-orange-500 text-sm font-semibold">
          See All
        </button>

      </div>

      <div className="grid grid-cols-4 gap-5">

        {categories.map((category) => (
          <CategoryItem
            key={category._id}
            category={category}
          />
        ))}

      </div>

    </section>
  );
}