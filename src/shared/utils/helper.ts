export const buildFilterQuery = (
  filters: Record<string, string | number | undefined> | unknown
): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "")
      params.append(key, value.toString());
  });
  const query = params.toString();
  return query ? `&${query}` : "";
};
