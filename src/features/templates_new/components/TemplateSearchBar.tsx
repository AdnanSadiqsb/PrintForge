import { FiSearch } from "react-icons/fi";

export const TemplateSearchBar = ({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) => (
  <label className="relative block">
    <span className="sr-only">Search templates</span>
    <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      className="w-full rounded-2xl border border-slate-200/80 bg-white px-11 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:bg-white"
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search templates, categories, or tags"
      type="search"
      value={value}
    />
  </label>
);
