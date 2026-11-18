import { createFileRoute } from '@tanstack/react-router';
import { familyQuery } from '@/lib/catalog-query';
import { pageHead } from '@/data/demo';
import { SurnamePage,type SurnameTab } from '@/components/ironkarta/surname-page';
import { DataError,DataNotFound } from '@/components/ironkarta/data-boundaries';
export const Route=createFileRoute('/family/$slug')({
  validateSearch:(s:Record<string,unknown>):{tab?:SurnameTab}=>({tab:s['tab']==='tree'||s['tab']==='villages'||s['tab']==='sources'?s['tab']:'overview'}),
  loader:({context,params})=>context.queryClient.ensureQueryData(familyQuery(params.slug)),
  head:({loaderData})=>pageHead(loaderData?.family.name??'Фамилия не найдена',loaderData?.cards[0]?.summary??'История фамилии и места, где живут участники Иронкарты.'),
  component:FamilyRoute,errorComponent:DataError,notFoundComponent:DataNotFound,
});
function FamilyRoute(){const {slug}=Route.useParams();const {tab='overview'}=Route.useSearch();const navigate=Route.useNavigate();return <SurnamePage slug={slug} tab={tab} onTab={tab=>void navigate({search:{tab}})}/>;}