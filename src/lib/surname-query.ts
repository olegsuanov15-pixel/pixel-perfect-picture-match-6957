import { queryOptions } from '@tanstack/react-query';
import { getSurnameAdmin } from './surname.functions';
export const surnameAdminQuery = () => queryOptions({queryKey:['surname-admin'],queryFn:()=>getSurnameAdmin()});