export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Иронкарта` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Иронкарта` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
