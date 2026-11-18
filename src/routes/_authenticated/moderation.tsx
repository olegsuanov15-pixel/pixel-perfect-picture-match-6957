import {createFileRoute,redirect} from '@tanstack/react-router';import {pageHead} from '@/data/demo';
export const Route=createFileRoute('/_authenticated/moderation')({head:()=>pageHead('Модерация','Переход к админке Иронкарты.'),beforeLoad:()=>{throw redirect({to:'/admin'});}});
