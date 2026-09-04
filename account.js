(()=>{
  const config=window.AN_SUPABASE;
  if(!config||!window.supabase){
    console.error('Aponar Nihon auth: Supabase config is unavailable.');
    return;
  }

  const sb=window.supabase.createClient(config.url,config.key,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });

  const PROD_ORIGIN='https://app.aponar-nihon.workers.dev';
  const CALLBACK_PATH='/auth-callback.html';
  const RESET_PATH='/reset-password.html';
  const clean=v=>typeof v==='string'?v.trim():v;

  const appOrigin=()=>{
    const host=(location.hostname||'').toLowerCase();
    if(location.protocol==='file:') return PROD_ORIGIN;
    if(host==='localhost'||host==='127.0.0.1'||host==='0.0.0.0'||host==='[::1]') return location.origin;
    return location.origin||PROD_ORIGIN;
  };

  const safeNext=(value,fallback='/profile.html')=>{
    try{
      const raw=clean(value||'');
      if(!raw||raw.startsWith('//')) return fallback;
      const url=new URL(raw,appOrigin());
      if(url.origin!==appOrigin()) return fallback;
      return `${url.pathname}${url.search}${url.hash}`;
    }catch(_){return fallback;}
  };

  // Auth emails/OAuth must always return to production.
  // This prevents localhost previews from leaking into Supabase verification links.
  const callbackUrl=()=>new URL(CALLBACK_PATH,PROD_ORIGIN).toString();
  const resetUrl=()=>new URL(RESET_PATH,PROD_ORIGIN).toString();

  const storage={
    set(key,value){try{localStorage.setItem(key,value)}catch(_){ }},
    get(key){try{return localStorage.getItem(key)||''}catch(_){return ''}},
    remove(key){try{localStorage.removeItem(key)}catch(_){ }}
  };

  async function getSession(){
    const {data,error}=await sb.auth.getSession();
    if(error) throw error;
    return data.session||null;
  }

  async function getProfile(){
    const s=await getSession();
    if(!s) return null;
    const {data,error}=await sb.from('profiles').select('*').eq('id',s.user.id).maybeSingle();
    if(error) throw error;
    return data||null;
  }

  async function ensureProfile(){
    const s=await getSession();
    if(!s) return null;
    const existing=await getProfile();
    if(existing) return existing;
    const meta=s.user.user_metadata||{};
    const row={
      id:s.user.id,
      email:s.user.email||null,
      full_name:clean(meta.full_name||meta.name||''),
      avatar_url:clean(meta.avatar_url||meta.picture||''),
      jlpt_target:clean(meta.jlpt_target||'N5'),
      last_active_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    };
    const {data,error}=await sb.from('profiles').upsert(row,{onConflict:'id'}).select('*').single();
    if(error) throw error;
    return data;
  }

  async function updateProfile(values={}){
    const s=await getSession();
    if(!s) throw new Error('Login required');
    const allowed=['full_name','school','nationality','jlpt_target','study_goal','avatar_url','phone','city','preferred_language','daily_study_minutes','bio'];
    const row={};
    for(const key of allowed){
      if(Object.prototype.hasOwnProperty.call(values,key)){
        row[key]=typeof values[key]==='string'?values[key].trim():values[key];
      }
    }
    row.updated_at=new Date().toISOString();
    row.last_active_at=new Date().toISOString();
    const {data,error}=await sb.from('profiles').update(row).eq('id',s.user.id).select('*').single();
    if(error) throw error;
    window.dispatchEvent(new CustomEvent('an-profile-updated',{detail:data}));
    return data;
  }

  async function signInGoogle(){
    const {data,error}=await sb.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:callbackUrl()}
    });
    if(error) throw error;
    return data;
  }

  async function signInPassword(email,password){
    const {data,error}=await sb.auth.signInWithPassword({email:clean(email),password});
    if(error) throw error;
    return data;
  }

  async function signUpEmail({email,password,full_name,jlpt_target='N5'}){
    const normalizedEmail=clean(email);
    const {data,error}=await sb.auth.signUp({
      email:normalizedEmail,
      password,
      options:{
        emailRedirectTo:callbackUrl(),
        data:{full_name:clean(full_name||''),jlpt_target:clean(jlpt_target||'N5')}
      }
    });
    if(error) throw error;
    if(!data.session) storage.set('an_pending_verify_email',normalizedEmail);
    return data;
  }

  async function resendSignupEmail(email){
    const normalizedEmail=clean(email||storage.get('an_pending_verify_email'));
    if(!normalizedEmail) throw new Error('Verification email address পাওয়া যায়নি।');
    const {data,error}=await sb.auth.resend({
      type:'signup',
      email:normalizedEmail,
      options:{emailRedirectTo:callbackUrl()}
    });
    if(error) throw error;
    storage.set('an_pending_verify_email',normalizedEmail);
    return data;
  }

  async function requestPasswordReset(email){
    const normalizedEmail=clean(email);
    if(!normalizedEmail) throw new Error('Email দিন।');
    const {data,error}=await sb.auth.resetPasswordForEmail(normalizedEmail,{
      redirectTo:resetUrl()
    });
    if(error) throw error;
    return data;
  }

  async function updatePassword(password){
    const {data,error}=await sb.auth.updateUser({password});
    if(error) throw error;
    return data;
  }

  function authUrlError(){
    const query=new URLSearchParams(location.search);
    const hash=new URLSearchParams((location.hash||'').replace(/^#/,''));
    const code=query.get('error_code')||hash.get('error_code')||query.get('error')||hash.get('error');
    const description=query.get('error_description')||hash.get('error_description');
    if(!code&&!description) return null;
    const message=decodeURIComponent((description||code||'Authentication failed').replace(/\+/g,' '));
    const err=new Error(message);
    err.code=code||'auth_redirect_error';
    return err;
  }

  async function waitForSession(timeoutMs=3000){
    const existing=await getSession();
    if(existing) return existing;
    return await new Promise(resolve=>{
      let done=false;
      let timer=null;
      let subscription=null;
      const finish=session=>{
        if(done) return;
        done=true;
        if(timer) clearTimeout(timer);
        subscription?.unsubscribe?.();
        resolve(session||null);
      };
      const authChange=sb.auth.onAuthStateChange((_event,session)=>{if(session) finish(session);});
      subscription=authChange?.data?.subscription||null;
      timer=setTimeout(async()=>{
        try{finish(await getSession());}catch(_){finish(null);}
      },timeoutMs);
    });
  }

  async function completeAuthRedirect(){
    const redirectError=authUrlError();
    if(redirectError) throw redirectError;

    let session=await waitForSession(1800);
    const url=new URL(location.href);

    if(!session&&url.searchParams.get('code')){
      const {data,error}=await sb.auth.exchangeCodeForSession(url.searchParams.get('code'));
      if(error) throw error;
      session=data.session||null;
    }

    if(!session){
      const hash=new URLSearchParams((location.hash||'').replace(/^#/,''));
      const access_token=hash.get('access_token');
      const refresh_token=hash.get('refresh_token');
      if(access_token&&refresh_token){
        const {data,error}=await sb.auth.setSession({access_token,refresh_token});
        if(error) throw error;
        session=data.session||null;
      }
    }

    if(!session) throw new Error('Verification linkটি invalid বা expire হয়ে গেছে। নতুন verification email পাঠান।');
    await ensureProfile();
    storage.remove('an_pending_verify_email');
    return {session,next:'/profile.html?verified=1'};
  }

  async function logout(){
    const {error}=await sb.auth.signOut();
    if(error) throw error;
    location.replace('/');
  }

  async function log(event,meta={}){
    const s=await getSession();
    if(!s) return;
    try{
      const module=meta.module||location.pathname.replace(/^\//,'').replace(/\.html$/,'')||'home';
      const item_key=meta.item_key||location.hash.replace(/^#/,'')||'';
      await sb.from('activity_events').insert({
        user_id:s.user.id,
        event_type:event,
        page:location.pathname,
        metadata:{...meta,module,item_key,url:location.pathname+location.search+location.hash}
      });
      await sb.rpc('touch_profile_activity');
    }catch(e){console.debug('activity log',e);}
  }

  async function progress(module,item_key,progressValue=0,score=null,metadata={}){
    const s=await getSession();
    if(!s) return;
    try{
      await sb.from('student_progress').upsert({
        user_id:s.user.id,module,item_key,progress:progressValue,score,metadata,updated_at:new Date().toISOString()
      },{onConflict:'user_id,module,item_key'});
      await log('progress_update',{module,item_key,progress:progressValue,score});
    }catch(e){console.debug('progress',e);}
  }

  window.AN={
    sb,
    session:getSession,
    user:async()=>{const s=await getSession();return s?.user||null;},
    profile:getProfile,
    ensureProfile,
    updateProfile,
    signInGoogle,
    signInPassword,
    signUpEmail,
    resendSignupEmail,
    requestPasswordReset,
    updatePassword,
    completeAuthRedirect,
    pendingVerificationEmail:()=>storage.get('an_pending_verify_email'),
    logout,
    log,
    progress
  };

  sb.auth.onAuthStateChange((event,session)=>{
    window.dispatchEvent(new CustomEvent('an-auth-changed',{detail:{event,session}}));
  });
})();
