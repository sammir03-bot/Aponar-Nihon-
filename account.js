(()=>{
  const config=window.AN_SUPABASE;
  if(!config||!window.supabase){
    console.error('Aponar Nihon auth: Supabase config is unavailable.');
    return;
  }

  const sb=window.supabase.createClient(config.url,config.key,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });

  const clean=v=>typeof v==='string'?v.trim():v;
  const PROD_ORIGIN='https://app.aponar-nihon.workers.dev';
  const appOrigin=()=>{
    const host=(location.hostname||'').toLowerCase();
    if(host==='localhost'||host==='127.0.0.1'||host==='0.0.0.0'||host==='[::1]') return PROD_ORIGIN;
    if(location.protocol==='file:') return PROD_ORIGIN;
    return location.origin||PROD_ORIGIN;
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
      if(Object.prototype.hasOwnProperty.call(values,key)) row[key]=typeof values[key]==='string'?values[key].trim():values[key];
    }
    row.updated_at=new Date().toISOString();
    row.last_active_at=new Date().toISOString();
    const {data,error}=await sb.from('profiles').update(row).eq('id',s.user.id).select('*').single();
    if(error) throw error;
    window.dispatchEvent(new CustomEvent('an-profile-updated',{detail:data}));
    return data;
  }

  async function signInGoogle(){
    const redirectTo=`${appOrigin()}/profile.html`;
    const {data,error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo}});
    if(error) throw error;
    return data;
  }

  async function signInPassword(email,password){
    const {data,error}=await sb.auth.signInWithPassword({email:clean(email),password});
    if(error) throw error;
    return data;
  }

  async function signUpEmail({email,password,full_name,jlpt_target='N5'}){
    const {data,error}=await sb.auth.signUp({
      email:clean(email),
      password,
      options:{
        emailRedirectTo:`${appOrigin()}/profile.html`,
        data:{full_name:clean(full_name||''),jlpt_target:clean(jlpt_target||'N5')}
      }
    });
    if(error) throw error;
    return data;
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
    }catch(e){console.debug('activity log',e)}
  }

  async function progress(module,item_key,progressValue=0,score=null,metadata={}){
    const s=await getSession();
    if(!s) return;
    try{
      await sb.from('student_progress').upsert({
        user_id:s.user.id,module,item_key,progress:progressValue,score,metadata,updated_at:new Date().toISOString()
      },{onConflict:'user_id,module,item_key'});
      await log('progress_update',{module,item_key,progress:progressValue,score});
    }catch(e){console.debug('progress',e)}
  }

  window.AN={
    sb,
    session:getSession,
    user:async()=>{const s=await getSession();return s?.user||null},
    profile:getProfile,
    ensureProfile,
    updateProfile,
    signInGoogle,
    signInPassword,
    signUpEmail,
    logout,
    log,
    progress
  };

  sb.auth.onAuthStateChange((event,session)=>{
    window.dispatchEvent(new CustomEvent('an-auth-changed',{detail:{event,session}}));
  });
})();