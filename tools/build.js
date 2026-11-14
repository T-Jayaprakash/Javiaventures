#!/usr/bin/env node
// Builds the public pages from tools/site.html. Run from the repo root: node tools/build.js
// Each URL becomes a real HTML file with its own title, description, canonical and structured data.
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..'),SITE='https://getjaviaventures.com',TODAY=new Date().toISOString().slice(0,10);
const ORG={"@type":["Organization","ProfessionalService"],"@id":SITE+"/#org",name:"Javia Ventures",url:SITE+"/",logo:SITE+"/logo-dark.png",image:SITE+"/og-home.png",telephone:"+919788995924",email:"jayaprakash@getjaviaventures.com",address:{"@type":"PostalAddress",addressLocality:"Tiruchirappalli",addressRegion:"Tamil Nadu",addressCountry:"IN"},areaServed:["Tiruchirappalli","Tamil Nadu","India"],founder:{"@type":"Person",name:"Jayaprakash"},description:"Website, mobile app and custom software development company in Trichy, Tamil Nadu. Also builds AI systems, automation and bots.",knowsAbout:["Website development","Mobile app development","Custom software development","CRM development","AI development","Business automation","Bot development"]};
const CAT={web:["website-development","Website Development Company in Trichy | Javia Ventures","Website development in Trichy: landing pages, business websites, e-commerce and web apps. See real client websites and what we build."],app:["mobile-app-development","Mobile App Development Company in Trichy | Javia Ventures","Android, iPhone and Flutter app development in Trichy. Makers of the Jayple salon booking app and the Jeya Hyper Store ordering app."],soft:["custom-software-development","Custom Software Development in Trichy | Javia Ventures","Billing, inventory, school, hospital and ERP software built in Trichy around how your business already runs."],crm:["crm-development","CRM Development and Business Software | Javia Ventures","Custom CRM, lead management, HR and admin dashboards. Built by Javia Ventures, Trichy."],ai:["ai-development","AI Development and Chatbots in Trichy | Javia Ventures","AI chatbots, document processing, RAG assistants and AI agents built on your own business information. Javia Ventures, Trichy."],auto:["business-automation","Workflow and Business Automation | Javia Ventures","WhatsApp, email, invoice and CRM automation. Let software handle repetitive work. Javia Ventures, Trichy."],bot:["bot-development","WhatsApp and Telegram Bot Development | Javia Ventures","WhatsApp, Telegram, Discord and AI bots for orders, bookings and support. Built by Javia Ventures, Trichy."],back:["backend-api-cloud","Backend, API and Cloud Development | Javia Ventures","Backend development, REST APIs, payment gateways and cloud setup. Javia Ventures, Trichy."],care:["maintenance-support","Website and App Maintenance Plans | Javia Ventures","Monthly website, app and software maintenance plans that keep everything running and up to date. Javia Ventures, Trichy."]};
const crumb=l=>({"@type":"BreadcrumbList",itemListElement:l.map(([n,u],i)=>({"@type":"ListItem",position:i+1,name:n,item:SITE+u}))});
const routes=[
 {u:'/',r:{page:'home'},t:'Javia Ventures | Website & App Development Company in Trichy',d:'Javia Ventures builds websites, mobile apps, business software, AI and automation in Trichy, Tamil Nadu. Makers of Jayple. See our apps and client websites.',ld:[{"@type":"WebSite","@id":SITE+"/#site",url:SITE+"/",name:"Javia Ventures",publisher:{"@id":SITE+"/#org"}},ORG]},
 {u:'/services/',r:{page:'services'},t:'Website, App and Software Development Services | Javia Ventures',d:'76 services: websites, mobile apps, custom software, CRM, AI, automation and bots. Javia Ventures, Trichy.',faq:1,ld:[crumb([["Home","/"],["Services","/services/"]])]},
 {u:'/work/',r:{page:'work'},t:'Our Apps and Websites | Javia Ventures',d:'Real work by Javia Ventures: the Jayple salon booking app, the Jeya Hyper Store ordering app and websites for businesses across Tamil Nadu.',ld:[crumb([["Home","/"],["Work","/work/"]])]},
 {u:'/work/jayple/',r:{page:'case',app:'jayple'},t:'Jayple Salon Booking App Case Study | Javia Ventures',d:'Jayple is a salon discovery and booking app for Trichy, on the web, Android and iPhone. Built and run by the team behind Javia Ventures.',ld:[crumb([["Home","/"],["Work","/work/"],["Jayple","/work/jayple/"]]),{"@type":"SoftwareApplication",name:"Jayple",applicationCategory:"LifestyleApplication",operatingSystem:"Web, Android, iOS",url:"https://customer.jayple.in/",downloadUrl:"https://play.google.com/store/apps/details?id=com.jayple.app"}]},
 {u:'/work/jeya-hyper-store/',r:{page:'case',app:'jeya'},t:'Jeya Hyper Store Supermarket App Case Study | Javia Ventures',d:'An online ordering app for a neighbourhood supermarket in Trichy, built by Javia Ventures. Try the live app.',ld:[crumb([["Home","/"],["Work","/work/"],["Jeya Hyper Store","/work/jeya-hyper-store/"]]),{"@type":"WebApplication",name:"Jeya Hyper Store",applicationCategory:"ShoppingApplication",operatingSystem:"Web",url:"https://jeyahyperstore.in/"}]},
 {u:'/partners/',r:{page:'partners'},t:'White-Label App Development Partner for Agencies | Javia Ventures',d:'iPhone and Android apps built under your agency brand. Send a brief, get a fixed quote in two working days. Makers of the Jayple app.',ld:[crumb([["Home","/"],["App partner for agencies","/partners/"]]),{"@type":"Service",name:"White-label mobile app development for agencies",provider:{"@id":SITE+"/#org"},areaServed:["United States","United Kingdom","Canada","Australia"],url:SITE+"/partners/"}]},
 {u:'/contact/',r:{page:'contact'},t:'Contact Javia Ventures, Trichy | +91 97889 95924',d:'Call or WhatsApp Javia Ventures in Trichy on +91 97889 95924 about your website, app, software or AI project.',ld:[crumb([["Home","/"],["Contact","/contact/"]]),{"@type":"ContactPage",url:SITE+"/contact/",about:{"@id":SITE+"/#org"}}]},
 ...Object.entries(CAT).map(([id,[s,t,d]])=>({u:`/services/${s}/`,r:{page:'services',cat:id},t,d,faq:1,cat:id,ld:[crumb([["Home","/"],["Services","/services/"],[t.split(' | ')[0],`/services/${s}/`]])]})),
];
const MIME={'.html':'text/html','.png':'image/png','.jpg':'image/jpeg','.js':'text/javascript','.webmanifest':'application/json'};
const srv=http.createServer((q,s)=>{let p=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));fs.readFile(p,(e,b)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'content-type':MIME[path.extname(p)]||'application/octet-stream'});s.end(b)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base=`http://localhost:${srv.address().port}`;
 const b=await chromium.launch();const urls=[];
 for(const rt of routes){
  const c=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce',serviceWorkers:'block'});const p=await c.newPage();
  await p.clock.setFixedTime(new Date('2030-03-01T00:00:00+05:30'));
  await p.addInitScript(r=>{window.__R=r},rt.r);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto(base+'/tools/site.html',{waitUntil:'load'});
  if(errs.length)throw new Error(rt.u+': '+errs.join('; '));
  const html=await p.evaluate(({rt,SITE})=>{
    document.body.dataset.r=JSON.stringify(rt.r);
    const H=document.head,add=(tag,a,txt)=>{const e=document.createElement(tag);for(const k in a)e.setAttribute(k,a[k]);if(txt)e.textContent=txt;return e};
    const first=H.querySelector('link[rel=icon]');const put=e=>H.insertBefore(e,first);
    put(add('title',{},rt.t));put(add('meta',{name:'description',content:rt.d}));put(add('link',{rel:'canonical',href:SITE+rt.u}));put(add('meta',{name:'robots',content:'index, follow, max-image-preview:large'}));
    for(const [k,v] of [['og:type','website'],['og:url',SITE+rt.u],['og:site_name','Javia Ventures'],['og:title',rt.t],['og:description',rt.d],['og:image',SITE+'/og-home.png'],['og:image:width','1200'],['og:image:height','630'],['og:locale','en_IN']])put(add('meta',{property:k,content:v}));
    put(add('meta',{name:'twitter:card',content:'summary_large_image'}));
    const g=[...rt.ld];
    if(rt.faq&&window.__FAQ)g.push({"@type":"FAQPage",mainEntity:window.__FAQ.map(([a,b])=>({"@type":"Question",name:a,acceptedAnswer:{"@type":"Answer",text:b}}))});
    if(rt.cat){const c=CATS.find(x=>x.id===rt.cat);g.push({"@type":"Service",name:c.title,serviceType:c.title,provider:{"@id":SITE+"/#org"},areaServed:"India",url:SITE+rt.u,hasOfferCatalog:{"@type":"OfferCatalog",name:c.title,itemListElement:c.items.map(i=>({"@type":"Offer",itemOffered:{"@type":"Service",name:i[0],description:i[1]}}))}})}
    if(rt.u!=='/')g.push({"@type":"Organization","@id":SITE+"/#org",name:"Javia Ventures",url:SITE+"/"});
    H.append(add('script',{type:'application/ld+json'},JSON.stringify({"@context":"https://schema.org","@graph":g})));
    document.title=rt.t;
    return '<!doctype html>\n'+document.documentElement.outerHTML;
  },{rt,SITE});
  const out=path.join(ROOT,rt.u,'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,html);urls.push(rt.u);console.log('built',rt.u,Math.round(html.length/1024)+'KB');
  await c.close();
 }
 await b.close();srv.close();
 const all=[...urls.map((u,i)=>[u,u==='/'?'1.0':u.split('/').length>3?'0.7':'0.8']),['/privacy/','0.2']];
 fs.writeFileSync(path.join(ROOT,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${all.map(([u,p])=>`  <url><loc>${SITE}${u}</loc><lastmod>${TODAY}</lastmod><priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
})().catch(e=>{console.error(e);process.exit(1)});
