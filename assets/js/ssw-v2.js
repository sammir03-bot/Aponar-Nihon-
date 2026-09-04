(()=>{
  'use strict';

  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>Array.from(root.querySelectorAll(selector));
  const norm=value=>(value||'').toString().trim().toLowerCase();

  function initFieldSearch(){
    const input=$('#field-search');
    const buttons=$$('[data-field-filter]');
    const cards=$$('[data-field]');
    if(!input||!cards.length)return;

    let active='all';
    const apply=()=>{
      const query=norm(input.value);
      cards.forEach(card=>{
        const type=card.dataset.field||'';
        const matchesType=active==='all'||type===active;
        const matchesQuery=!query||norm(card.textContent).includes(query);
        card.hidden=!(matchesType&&matchesQuery);
      });
      const count=cards.filter(card=>!card.hidden).length;
      const output=$('#field-result-count');
      if(output)output.textContent=`${count}টি ফলাফল`;
    };

    input.addEventListener('input',apply);
    buttons.forEach(button=>button.addEventListener('click',()=>{
      active=button.dataset.fieldFilter||'all';
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      apply();
    }));
    apply();
  }

  function closeFaq(item){
    const button=$('.faq-question',item);
    if(!button)return;
    const answer=document.getElementById(button.getAttribute('aria-controls'));
    button.setAttribute('aria-expanded','false');
    if(answer)answer.hidden=true;
  }

  function initFaq(){
    const filters=$$('[data-faq-filter]');
    const items=$$('[data-faq-category]');

    // Progressive enhancement: answers remain readable when JavaScript is disabled.
    items.forEach(closeFaq);

    filters.forEach(button=>button.addEventListener('click',()=>{
      const active=button.dataset.faqFilter||'all';
      filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      items.forEach(item=>{
        const categories=(item.dataset.faqCategory||'').split(' ').filter(Boolean);
        const visible=active==='all'||categories.includes(active);
        item.hidden=!visible;
        if(!visible)closeFaq(item);
      });
    }));

    $$('.faq-question').forEach(button=>button.addEventListener('click',()=>{
      const answer=document.getElementById(button.getAttribute('aria-controls'));
      if(!answer)return;
      const isOpen=button.getAttribute('aria-expanded')==='true';
      button.setAttribute('aria-expanded',String(!isOpen));
      answer.hidden=isOpen;
    }));
  }

  function focusHashTarget(){
    if(!location.hash)return;
    const id=decodeURIComponent(location.hash.slice(1));
    const element=document.getElementById(id);
    if(!element)return;
    element.setAttribute('tabindex','-1');
    element.focus({preventScroll:true});
    setTimeout(()=>element.removeAttribute('tabindex'),700);
  }

  function initAnchorFocus(){
    window.addEventListener('hashchange',focusHashTarget);
    if(location.hash)setTimeout(focusHashTarget,0);
  }

  function initNav(){
    const nav=$('.site-nav');
    if(!nav)return;
    const update=()=>nav.classList.toggle('is-scrolled',window.scrollY>8);
    window.addEventListener('scroll',update,{passive:true});
    update();
  }

  document.addEventListener('DOMContentLoaded',()=>{
    initFieldSearch();
    initFaq();
    initAnchorFocus();
    initNav();
  });
})();
