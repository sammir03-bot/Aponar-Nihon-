window.AN_SUPABASE={url:'https://xgudgxnkolpqfovfmijl.supabase.co',key:'sb_publishable_b9WQvx81-1YVhMFiI7T5XA_KE1mAbhd'};
(()=>{
  const isAuth=/\/auth(?:\.html)?\/?$/.test(location.pathname||'');
  if(!isAuth) return;
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/assets/css/auth-social.css?v=20260907-1';
  document.head.appendChild(css);
  window.addEventListener('load',()=>{
    if(document.querySelector('script[data-an-social-auth]')) return;
    const script=document.createElement('script');
    script.src='/assets/js/auth-social.js?v=20260907-1';
    script.dataset.anSocialAuth='1';
    document.body.appendChild(script);
  },{once:true});
})();
