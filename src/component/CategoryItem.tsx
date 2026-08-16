import { useNavigate } from "react-router-dom";
import type { Category } from "../types/category";

interface Props {
  category: Category;
}

export default function CategoryItem({
  category,
}: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${category._id}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex flex-col items-center"
    >
      <div className="h-16 w-16 overflow-hidden rounded-full bg-orange-100 shadow">

        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-orange-500">
            {category.name.charAt(0).toUpperCase()}
          </div>
        )}

      </div>

      <p className="mt-2 text-center text-xs font-medium">
        {category.name}
      </p>
    </button>
  );
}