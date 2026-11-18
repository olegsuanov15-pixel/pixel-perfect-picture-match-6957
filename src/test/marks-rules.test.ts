import {describe,it,expect} from 'vitest';import {markSubmission,pendingMark,canModerate,profileInput,SUBMISSION_INTERVAL_SECONDS} from '@/lib/marks-rules';
const id='00000000-0000-4000-8000-000000000001';const input={familyId:id,country:'Испания',city:'Барселона',consent:true,processingConsent:true};
describe('Map privacy rules',()=>{
 it('creates pending guest points without identity or exact coordinates',()=>{const parsed=markSubmission.parse({...input,status:'approved'});expect(pendingMark(parsed,null)).toMatchObject({status:'pending',user_id:null,latitude:null,longitude:null});});
 it('binds signed-in points to the verified owner',()=>{expect(pendingMark(markSubmission.parse(input),'owner').user_id).toBe('owner');});
 it('requires consent to processing',()=>{expect(markSubmission.safeParse({...input,processingConsent:false}).success).toBe(false);});
 it('requires publication consent',()=>{expect(markSubmission.safeParse({...input,consent:false}).success).toBe(false);});
 it('only admin moderates, not user or legacy moderator',()=>{expect(canModerate(['moderator','user'])).toBe(false);expect(canModerate(['admin'])).toBe(true);});
 it('limits about to 300 characters',()=>{const p={name:'',familyName:'',country:'',city:'',showOnMap:false,avatarPath:null,processingConsent:true};expect(profileInput.safeParse({...p,about:'а'.repeat(300)}).success).toBe(true);expect(profileInput.safeParse({...p,about:'а'.repeat(301)}).success).toBe(false);});
 it('limits submissions to one per 60 seconds',()=>{expect(SUBMISSION_INTERVAL_SECONDS).toBe(60);});
});
