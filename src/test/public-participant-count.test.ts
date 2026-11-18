import {it,expect} from 'vitest';
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
it('counts accounts only once and excludes guests, hidden, pending and nonconsenting marks',async()=>{
 const db=new PGlite();try{
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE TABLE profiles(id uuid,show_on_map boolean);CREATE TABLE map_points(family_id uuid,user_id uuid,status text,consent_to_publish boolean);INSERT INTO profiles VALUES ('00000000-0000-4000-8000-000000000001',true),('00000000-0000-4000-8000-000000000002',false);`);
  await db.exec(readFileSync('drizzle/migrations/0012_public_participant_count.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0013_family_participant_counts.sql','utf8'));
  await db.exec('CREATE TABLE family_details(family_id uuid PRIMARY KEY);');
  await db.exec(readFileSync('drizzle/migrations/0011_family_progenitor.sql','utf8'));
  await db.exec("INSERT INTO family_details(family_id,progenitor) VALUES('00000000-0000-4000-8000-000000000010','Суан'),('00000000-0000-4000-8000-000000000011','Кадза');");
  expect((await db.query('SELECT progenitor FROM family_details ORDER BY family_id')).rows).toEqual([{progenitor:'Суан'},{progenitor:'Кадза'}]);
  await db.exec(`INSERT INTO map_points VALUES('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','approved',true),('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','approved',true),('00000000-0000-4000-8000-000000000010',null,'approved',true),('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000002','approved',true),('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000001','pending',true),('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000002','approved',false);SET ROLE anon;`);
  expect((await db.query('select public.public_participant_count()::int as count')).rows).toEqual([{count:1}]);
  expect((await db.query('select family_id,participant_count::int as count from public.public_family_participant_counts()')).rows).toEqual([{family_id:'00000000-0000-4000-8000-000000000010',count:1}]);
 }finally{await db.close();}
},15000);