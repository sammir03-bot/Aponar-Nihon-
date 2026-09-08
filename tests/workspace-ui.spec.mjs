import {test,expect} from '@playwright/test';

// Synthetic account data exercises UI without touching a real account/database.
async function mockAccount(page,role='student'){
 await page.route('**/account.js*',route=>route.fulfill({contentType:'application/javascript',body:`
 const demo={id:'00000000-0000-0000-0000-000000000001',full_name:'Demo Student',email:'demo@example.test',role:'${role}',jlpt_target:'N4',city:'Tokyo',school:'Demo School'};
 const query={select(){return this},eq(){return this},order(){return this},limit(){return this},then(resolve){return Promise.resolve({data:this.table==='profiles'?[{...demo,role:'student'}]:[],error:null}).then(resolve)}};
 window.AN={session:async()=>({user:{id:demo.id,email:demo.email,user_metadata:{},app_metadata:{provider:'email'}}}),profile:async()=>demo,ensureProfile:async()=>demo,log:async()=>{},logout:async()=>{},sb:{from(table){return {...query,table}}}};
 `}));
}
async function noOverflow(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}

test('CV review returns to a missing field and filled details survive reload',async({page})=>{
 await page.goto('/cv-builder.html');
 await expect(page.locator('#cvStepHelp')).toContainText('কাজের ধরন');
 await page.locator('[data-step="4"]').click();
 await page.locator('#cvReview button').filter({hasText:'পুরো নাম'}).click();
 await expect(page.locator('#name')).toBeFocused();
 await page.locator('#name').fill('テスト');
 await page.locator('[data-step="4"]').click();
 await expect(page.locator('#cvReview button').filter({hasText:'পুরো নাম'})).toHaveClass('done');
 await page.reload();
 await page.locator('[data-step="1"]').click();
 await expect(page.locator('#name')).toHaveValue('テスト');
 await noOverflow(page);
});

test('student learning and settings tabs preserve the real form and activity IDs',async({page})=>{
 await mockAccount(page);
 await page.goto('/profile.html');
 await expect(page.locator('#loadingLayer')).toBeHidden();
 await expect(page.locator('#studentLearning')).toBeVisible();
 await expect(page.locator('#studentSettings')).toBeHidden();
 await expect(page.locator('#studentLearning #events')).toHaveText('0');
 await page.locator('#studentTab1').click();
 await expect(page.locator('#name')).toHaveValue('Demo Student');
 await page.locator('#studentTab1').press('ArrowLeft');
 await expect(page.locator('#studentLearning')).toBeVisible();
 await noOverflow(page);
});

test('admin filters reset and student drawer supports escape with restored focus',async({page})=>{
 await mockAccount(page,'admin');
 await page.goto('/admin.html');
 await expect(page.locator('#studentRows .tr')).toHaveCount(1);
 await page.locator('#searchInput').fill('no matching student');
 await expect(page.locator('#studentRows .tr')).toHaveCount(0);
 await page.locator('#resetStudentFilters').click();
 await expect(page.locator('#studentRows .tr')).toHaveCount(1);
 await page.locator('.view-btn').click();
 await expect(page.locator('#studentDrawer')).toHaveAttribute('aria-hidden','false');
 await expect(page.locator('#drawerClose')).toBeFocused();
 await page.locator('#drawerClose').press('Escape');
 await expect(page.locator('#studentDrawer')).toHaveAttribute('aria-hidden','true');
 await expect(page.locator('.view-btn')).toBeFocused();
 await noOverflow(page);
});

test('jobs category filters only the employer directory and restores all groups',async({page})=>{
 await page.goto('/jobs-in-japan.html');
 await expect(page.locator('#employerFilters')).toBeVisible();
 await page.locator('#employerFilters [data-category="1"]').click();
 await expect(page.locator('.an-brand-groups>div').nth(0)).toBeHidden();
 await expect(page.locator('.an-brand-groups>div').nth(1)).toBeVisible();
 await page.locator('#employerFilters [data-category="all"]').click();
 await expect(page.locator('.an-brand-groups>div').nth(0)).toBeVisible();
 await expect(page.locator('#find')).toBeVisible();
 await noOverflow(page);
});
