import { FaSearch } from "react-icons/fa";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search products...",
}: SearchBarProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
      <FaSearch className="text-gray-400 mr-3" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm"
      />
    </div>
  );
}