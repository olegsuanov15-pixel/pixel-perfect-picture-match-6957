import { describe, expect, it } from "vitest";
import { matchesSurname, publicMarks, sourcedHistories } from "@/lib/catalog-rules";
describe("Catalog rules", () => {
  const family = { id: "1", name: "Суановы", slug: "suanovy", aliases: ["Суанов", "Суанова"] };
  it("finds Суановы by surname or alias without case sensitivity", () => {
    expect(matchesSurname(family, " СУАНОВ ")).toBe(true);
    expect(matchesSurname(family, "Кокаев")).toBe(false);
  });
  it("publishes only approved participant marks with consent", () => {
    const base = {
      family_id: "1",
      country: "Испания",
      city: "Барселона",
      latitude: null,
      longitude: null,
    };
    expect(
      publicMarks([
        { ...base, id: "approved", status: "approved", consent_to_publish: true },
        { ...base, id: "pending", status: "pending", consent_to_publish: true },
        { ...base, id: "rejected", status: "rejected", consent_to_publish: true },
        { ...base, id: "no-consent", status: "approved", consent_to_publish: false },
      ]).map((p) => p.id),
    ).toEqual(["approved"]);
  });
  it("shows only published editorial history supported by published sources", () => {
    expect(
      sourcedHistories([
        {
          id: "sourced",
          published: true,
          family_history_sources: [{ history_sources: { published: true } }],
        },
        { id: "no-source", published: true, family_history_sources: [] },
        {
          id: "draft",
          published: false,
          family_history_sources: [{ history_sources: { published: true } }],
        },
        {
          id: "unpublished-source",
          published: true,
          family_history_sources: [{ history_sources: { published: false } }],
        },
      ]).map((h) => h.id),
    ).toEqual(["sourced"]);
  });
});
