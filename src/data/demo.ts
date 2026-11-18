export type DemoPoint = {
  id: string;
  family: string;
  city: string;
  country: string;
  people: number;
};
export const demoPoints: DemoPoint[] = [
  { id: "newyork", family: "Биазровы", city: "Нью-Йорк", country: "США", people: 6 },
  { id: "barcelona", family: "Суановы", city: "Барселона", country: "Испания", people: 12 },
  { id: "paris", family: "Кокаевы", city: "Париж", country: "Франция", people: 5 },
  { id: "london", family: "Суановы", city: "Лондон", country: "Великобритания", people: 3 },
  { id: "berlin", family: "Тедеевы", city: "Берлин", country: "Германия", people: 9 },
  { id: "vladikavkaz", family: "Суановы", city: "Владикавказ", country: "Россия", people: 24 },
  { id: "moscow", family: "Дзгоевы", city: "Москва", country: "Россия", people: 18 },
  { id: "seoul", family: "Ходокаевы", city: "Сеул", country: "Южная Корея", people: 8 },
  { id: "tokyo", family: "Цаллаговы", city: "Токио", country: "Япония", people: 2 },
  { id: "sydney", family: "Габараевы", city: "Сидней", country: "Австралия", people: 4 },
  { id: "buenosaires", family: "Кабисовы", city: "Буэнос-Айрес", country: "Аргентина", people: 3 },
  { id: "almaty", family: "Суановы", city: "Алматы", country: "Казахстан", people: 4 },
];
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
