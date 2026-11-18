import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";
import { getCatalog, getFamily } from "./catalog.functions";
export const catalogQuery = (q = "") =>
  queryOptions({ queryKey: ["catalog", q], queryFn: () => getCatalog({ data: { q } }) });
export const familyQuery = (slug: string) =>
  queryOptions({
    queryKey: ["family", slug],
    queryFn: async () => {
      const family = await getFamily({ data: { slug } });
      if (!family) throw notFound();
      return family;
    },
  });
