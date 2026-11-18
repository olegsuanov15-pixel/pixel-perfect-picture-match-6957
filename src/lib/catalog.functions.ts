import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { matchesSurname, publicMarks, sourcedHistories } from "./catalog-rules";

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ q: z.string().max(150).default("") }).parse(input))
  .handler(async ({ data }) => {
    const { publicDatabase } = await import("./catalog.server");
    const db = publicDatabase();
    const families = [];
    for (let offset = 0; ; offset += 1000) {
      const response = await db
        .from("families")
        .select("id,name,slug,aliases")
        .order("name")
        .range(offset, offset + 999);
      if (response.error) throw new Error(response.error.message);
      families.push(...response.data);
      if (response.data.length < 1000) break;
    }
    const response=await db.rpc("public_map_points");
    if(response.error)throw new Error(response.error.message);
    const marks=publicMarks(response.data);
    const visibleIds=new Set(marks.map(m=>m.family_id));
    return {families:families.filter(f=>visibleIds.has(f.id)&&matchesSurname(f,data.q)),marks};
  });
export const getFamily = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z
          .string()
          .regex(/^[a-z0-9-]+$/)
          .max(150),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { publicDatabase } = await import("./catalog.server");
    const db = publicDatabase();
    const familyResponse = await db
      .from("families")
      .select("id,name,slug,aliases")
      .eq("slug", data.slug)
      .maybeSingle();
    if (familyResponse.error) throw new Error(familyResponse.error.message);
    if (!familyResponse.data) return null;
    const family = familyResponse.data;
    const historyResponse = await db
      .from("family_histories")
      .select(
        "id,title,body,published,family_history_sources(id,pages,history_sources(id,title,author_or_organization,url,publication_year,published))",
      )
      .eq("family_id", family.id)
      .eq("published", true)
      .order("created_at");
    if (historyResponse.error) throw new Error(historyResponse.error.message);
    const response=await db.rpc("public_map_points");
    if(response.error)throw new Error(response.error.message);
    return {family,histories:sourcedHistories(historyResponse.data),marks:publicMarks(response.data).filter(m=>m.family_id===family.id)};
  });
