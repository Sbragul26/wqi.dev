import React from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = ({ placeholder }) => {
  
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        className="w-100 px-4 py-2 text-sm border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
      <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    </div>
  );
};

export default Search;
