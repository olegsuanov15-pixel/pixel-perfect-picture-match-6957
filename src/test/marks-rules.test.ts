import {describe,it,expect} from 'vitest';
import {markSubmission,pendingMark,canModerate,reviewInput} from '@/lib/marks-rules';
const id='00000000-0000-4000-8000-000000000001';
describe('Participant moderation',()=>{
 it('saves participant submission pending, not published',()=>{const parsed=markSubmission.parse({familyId:id,country:'Испания',city:'Барселона',consent:true,status:'approved'});expect(pendingMark(parsed,'owner')).toMatchObject({status:'pending',user_id:'owner',latitude:null,longitude:null});});
 it('requires publication consent',()=>{expect(markSubmission.safeParse({familyId:id,country:'Испания',city:'',consent:false}).success).toBe(false);});
 it('allows only assigned moderators or admins',()=>{expect(canModerate(['user'])).toBe(false);expect(canModerate([])).toBe(false);expect(canModerate(['moderator'])).toBe(true);expect(canModerate(['admin'])).toBe(true);});
 it('requires approximate coordinates for approval but not rejection',()=>{const base={id,note:'',latitude:null,longitude:null};expect(reviewInput.safeParse({...base,decision:'approved'}).success).toBe(false);expect(reviewInput.safeParse({...base,decision:'rejected'}).success).toBe(true);expect(reviewInput.safeParse({...base,decision:'approved',latitude:41.38,longitude:2.17}).success).toBe(true);});
});
