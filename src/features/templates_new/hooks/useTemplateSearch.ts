import { useMemo, useState } from "react";

export const useTemplateSearch = () => {
  const [search, setSearch] = useState("");

  const normalizedSearch = useMemo(() => search.trim().toLowerCase(), [search]);

  return {
    normalizedSearch,
    search,
    setSearch,
  };
};
