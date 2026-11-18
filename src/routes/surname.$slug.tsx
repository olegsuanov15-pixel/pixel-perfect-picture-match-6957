import { createFileRoute } from '@tanstack/react-router';
import { familyQuery } from '@/lib/catalog-query';
import { pageHead } from '@/data/demo';
import { SurnamePage } from '@/components/ironkarta/surname-page';
import { DataError,DataNotFound } from '@/components/ironkarta/data-boundaries';
export const Route=createFileRoute('/surname/$slug')({
  loader:({context,params})=>context.queryClient.ensureQueryData(familyQuery(params.slug)),
  head:({loaderData})=>pageHead(loaderData?.family.name??'Фамилия не найдена',loaderData?.cards[0]?.summary??'История фамилии и места, где живут участники Иронкарты.'),
  component:SurnameRoute,errorComponent:DataError,notFoundComponent:DataNotFound,
});
function SurnameRoute(){const {slug}=Route.useParams();return <SurnamePage slug={slug}/>;}