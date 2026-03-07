import { Search } from "lucide-react";

interface UserSearchBarProps {
  searchInput: string;
  searchTerm: string;
  onSearchInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
}

export function UserSearchBar({
  searchInput,
  searchTerm,
  onSearchInputChange,
  onSubmit,
  onClear,
}: UserSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-3 h-9 text-[13px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-slate-400 transition"
          />
        </div>
        <button
          type="submit"
          className="h-9 px-4 bg-indigo-600 text-white text-[12px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200/60"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={onClear}
            className="h-9 px-3 border border-slate-200 text-[12px] text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        )}
      </form>

      {searchTerm && (
        <p className="text-[12px] text-slate-500">
          Results for{" "}
          <span className="font-semibold text-slate-700">
            &ldquo;{searchTerm}&rdquo;
          </span>
        </p>
      )}
    </div>
  );
}
