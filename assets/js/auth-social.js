(()=>{
  const PROD_CALLBACK='https://app.aponar-nihon.workers.dev/auth-callback.html';
  const $=sel=>document.querySelector(sel);
  const msg=$('#msg');
  const tabs=$('.tabs');
  if(!tabs||!window.AN||!window.AN.sb) return;

  const wrap=document.createElement('section');
  wrap.className='social-auth';
  wrap.setAttribute('aria-label','Social login');
  wrap.innerHTML=`
    <div class="social-auth-grid">
      <button class="social-btn social-google" id="googleAuthBtn" type="button">
        <span class="social-icon" aria-hidden="true">G</span><span>Google দিয়ে চালিয়ে যান</span>
      </button>
      <button class="social-btn social-facebook" id="facebookAuthBtn" type="button">
        <span class="social-icon" aria-hidden="true">f</span><span>Facebook দিয়ে চালিয়ে যান</span>
      </button>
    </div>
    <div class="social-divider"><span>Email / Password</span></div>`;
  tabs.insertAdjacentElement('afterend',wrap);

  const buttons={
    google:document.getElementById('googleAuthBtn'),
    facebook:document.getElementById('facebookAuthBtn')
  };

  function showMessage(text,bad=true){
    if(!msg) return;
    msg.className='msg '+(bad?'bad':'good');
    msg.textContent=text;
  }

  function busy(btn,on){
    if(!btn) return;
    btn.disabled=on;
    const label=btn.querySelector('span:last-child');
    if(!label) return;
    if(!btn.dataset.label) btn.dataset.label=label.textContent;
    label.textContent=on?'সংযোগ হচ্ছে...':btn.dataset.label;
  }

  async function signIn(provider){
    const btn=buttons[provider];
    try{
      busy(btn,true);
      const {error}=await window.AN.sb.auth.signInWithOAuth({
        provider,
        options:{redirectTo:PROD_CALLBACK}
      });
      if(error) throw error;
    }catch(err){
      busy(btn,false);
      const text=(err?.message||String(err||'')).toLowerCase();
      if(text.includes('provider')&&(text.includes('enabled')||text.includes('unsupported'))){
        showMessage(`${provider==='google'?'Google':'Facebook'} Login এখনো Supabase-এ enable করা হয়নি।`,true);
      }else if(text.includes('redirect')){
        showMessage('OAuth redirect configuration ঠিক নেই। Supabase ও provider callback URL আবার check করুন।',true);
      }else{
        showMessage(err?.message||'Social login শুরু করা যায়নি। আবার চেষ্টা করুন।',true);
      }
    }
  }

  buttons.google?.addEventListener('click',()=>signIn('google'));
  buttons.facebook?.addEventListener('click',()=>signIn('facebook'));

  // Keep both choices visible, but softly disable providers that Supabase reports as off.
  (async()=>{
    try{
      const cfg=window.AN_SUPABASE;
      if(!cfg?.url||!cfg?.key) return;
      const res=await fetch(`${cfg.url}/auth/v1/settings`,{headers:{apikey:cfg.key}});
      if(!res.ok) return;
      const data=await res.json();
      const external=data?.external||{};
      for(const provider of ['google','facebook']){
        if(external[provider]===false&&buttons[provider]){
          buttons[provider].disabled=true;
          buttons[provider].title=`Supabase-এ ${provider==='google'?'Google':'Facebook'} provider enable করুন`;
        }
      }
    }catch(_){ }
  })();
})();
