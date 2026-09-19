
(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const money = (n) => {
  if (!Number.isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 1e7) return "₹" + (n/1e7).toFixed(2) + " Cr";
  if (abs >= 1e5) return "₹" + (n/1e5).toFixed(2) + " L";
  return "₹" + Math.round(n).toLocaleString("en-IN");
};
const num = (id, fallback=0) => {
  const n = parseFloat($(id)?.value);
  return Number.isFinite(n) ? n : fallback;
};

/* Editable site statistics: values come from stats.js. */
function applyStats() {
  if (typeof IGRIS_STATS === "undefined") return;
  const s = IGRIS_STATS;
  [["heroAum",s.aum],["statAum",s.aum]].forEach(([id,v])=>{if($(id))$(id).textContent=v});
  [["heroClients",s.clients],["statClients",s.clients]].forEach(([id,v])=>{if($(id))$(id).textContent=v});
  [["heroInsurance",s.insurance],["statInsurance",s.insurance]].forEach(([id,v])=>{if($(id))$(id).textContent=v});
  if($("statExp")) $("statExp").textContent = `${s.experience}+`;
}

/* Theme */
const root=document.documentElement, themeBtn=$("themeBtn");
const saved=localStorage.getItem("igris-theme");
root.classList.toggle("light", saved==="light");
if(themeBtn) themeBtn.textContent=root.classList.contains("light")?"☀":"◐";
themeBtn?.addEventListener("click",()=>{
  root.classList.toggle("light");
  const mode=root.classList.contains("light")?"light":"dark";
  localStorage.setItem("igris-theme",mode);
  themeBtn.textContent=mode==="light"?"☀":"◐";
});

/* Mobile navigation */
const menuBtn=$("menuBtn"), mobileMenu=$("mobileMenu");
menuBtn?.addEventListener("click",()=>{
  mobileMenu.classList.toggle("open");
  const open=mobileMenu.classList.contains("open");
  menuBtn.setAttribute("aria-expanded",String(open));
});
mobileMenu?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mobileMenu.classList.remove("open")));

/* Scroll progress */
function progress(){
  const h=document.documentElement.scrollHeight-window.innerHeight;
  if($("progress")) $("progress").style.width=(h>0?(window.scrollY/h)*100:0)+"%";
}
window.addEventListener("scroll",progress,{passive:true}); progress();

/* Reveal on scroll */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("show");observer.unobserve(e.target)}});
},{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

/* Calculator engine - based on the original Igris formulas. */
function calcSIP(){
  const P=Math.max(100,num("sipAmount",5000));
  const rate=Math.max(0.01,num("sipRate",12));
  const years=Math.max(1,num("sipYears",10));
  const r=rate/100/12,n=years*12;
  const fv=P*((Math.pow(1+r,n)-1)/r)*(1+r);
  const invested=P*n;
  const inflationOn=$("sipInflationOn")?.checked;
  const inf=inflationOn?Math.max(0,num("sipInflation",6)):0;
  const real=fv/Math.pow(1+inf/100,years);
  $("sipTotal").textContent=money(fv);$("sipInvested").textContent=money(invested);$("sipReturns").textContent=money(fv-invested);$("sipReal").textContent=money(real);
  drawChart(P,rate,years);
}
function drawChart(P,rate,years){
  const chart=$("sipChart"); if(!chart)return; chart.innerHTML="";
  const r=rate/100/12, steps=Math.min(Math.max(1,Math.round(years)),10);
  let max=0,data=[];
  for(let i=1;i<=steps;i++){const y=i*(years/steps),n=Math.round(y*12);const fv=P*((Math.pow(1+r,n)-1)/r)*(1+r),inv=P*n;data.push({y:Math.round(y),fv,inv});max=Math.max(max,fv)}
  data.forEach(d=>{const w=document.createElement("div");w.className="bar-wrap";const ret=document.createElement("div"),inv=document.createElement("div"),lab=document.createElement("div");ret.className="bar-returns";inv.className="bar-invested";lab.className="bar-yr";ret.style.height=Math.max(2,(d.fv-d.inv)/max*100)+"px";inv.style.height=Math.max(2,d.inv/max*100)+"px";lab.textContent=d.y+"y";w.append(ret,inv,lab);chart.append(w)});
}
function calcLS(){
  const P=Math.max(100,num("lsAmount",100000)), rate=Math.max(0.01,num("lsRate",12)), years=Math.max(1,num("lsYears",10));
  const fv=P*Math.pow(1+rate/100,years), on=$("lsInflationOn")?.checked, inf=on?Math.max(0,num("lsInflation",6)):0, real=fv/Math.pow(1+inf/100,years);
  $("lsTotal").textContent=money(fv);$("lsInvested").textContent=money(P);$("lsReturns").textContent=money(fv-P);$("lsMultiple").textContent=(fv/P).toFixed(1)+"x";$("lsReal").textContent=money(real);
}
function calcGoal(){
  const target=Math.max(1000,num("goalTarget",1000000)), rate=Math.max(0.01,num("goalRate",12)), years=Math.max(1,num("goalYears",10));
  const on=$("goalInflationOn")?.checked, inf=on?Math.max(0,num("goalInflation",6)):0;
  const inflated=target*Math.pow(1+inf/100,years), r=rate/100/12,n=years*12;
  const sip=inflated*r/((Math.pow(1+r,n)-1)*(1+r)), invested=sip*n;
  $("goalSip").textContent=money(sip);$("goalCorpus").textContent=money(target);$("goalInflated").textContent=money(inflated);$("goalInvested").textContent=money(invested);$("goalReturns").textContent=money(inflated-invested);
}
function calcEMI(){
  const P=Math.max(1000,num("emiAmount",1000000)), annual=Math.max(0.01,num("emiRate",9)), years=Math.max(1,num("emiYears",10));
  const r=annual/100/12,n=years*12,emi=P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1),total=emi*n;
  $("emiMonthly").textContent=money(emi);$("emiPrincipal").textContent=money(P);$("emiInterest").textContent=money(total-P);$("emiTotal").textContent=money(total);
}
function recalc(){if($("calc-sip"))calcSIP();if($("calc-lumpsum"))calcLS();if($("calc-goal"))calcGoal();if($("calc-emi"))calcEMI()}
document.querySelectorAll("#calc-sip input,#calc-lumpsum input,#calc-goal input,#calc-emi input").forEach(i=>i.addEventListener("input",()=>{
  if(i.id.startsWith("sip"))calcSIP(); else if(i.id.startsWith("ls"))calcLS(); else if(i.id.startsWith("goal"))calcGoal(); else calcEMI();
}));
["sip","ls","goal"].forEach(p=>$(p+"InflationOn")?.addEventListener("change",recalc));
document.querySelectorAll(".calc-tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".calc-tab").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".calc-panel").forEach(p=>p.classList.remove("active"));
  btn.classList.add("active"); $("calc-"+btn.dataset.calc).classList.add("active");
}));
recalc();

/* Contact → Formspree. Keep WhatsApp and Calendar as separate direct paths. */
const form=$("contactForm");
form?.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const honeypot=form.querySelector("[name='_gotcha']");
  if(honeypot?.value)return;
  const btn=$("formBtn"), original=btn.textContent;
  btn.disabled=true;btn.textContent="Sending…";
  try{
    const response=await fetch(form.action,{method:"POST",body:new FormData(form),headers:{Accept:"application/json"}});
    if(!response.ok) throw new Error("Form submission failed");
    $("formView").hidden=true;$("formSuccess").hidden=false;
  }catch(err){
    btn.disabled=false;btn.textContent=original;
    alert("We couldn't send the enquiry right now. Please use WhatsApp or email instead.");
  }
});

/* Keep anchor navigation predictable after loading. */
window.addEventListener("load",applyStats);
applyStats();
})();
