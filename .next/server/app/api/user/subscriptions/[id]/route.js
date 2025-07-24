(()=>{var a={};a.id=858,a.ids=[858],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11723:a=>{"use strict";a.exports=require("querystring")},11997:a=>{"use strict";a.exports=require("punycode")},12412:a=>{"use strict";a.exports=require("assert")},27910:a=>{"use strict";a.exports=require("stream")},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},39727:()=>{},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},47990:()=>{},49869:(a,b,c)=>{"use strict";c.d(b,{do:()=>g,k9:()=>e,oV:()=>f}),function(){var a=Error("Cannot find module '@sendgrid/mail'");throw a.code="MODULE_NOT_FOUND",a}(),process.env.SENDGRID_API_KEY&&Object(function(){var a=Error("Cannot find module '@sendgrid/mail'");throw a.code="MODULE_NOT_FOUND",a}())(process.env.SENDGRID_API_KEY);let d=a=>`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smakowało</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #7c9885; padding: 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .footer { background-color: #2d3748; color: white; padding: 20px; text-align: center; }
    .btn { background-color: #7c9885; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; }
    .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .status-update { background-color: #e8f5e8; padding: 15px; border-left: 4px solid #7c9885; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Smakowało</h1>
    </div>
    <div class="content">
      ${a}
    </div>
    <div class="footer">
      <p>Dziękujemy za wyb\xf3r Smakowało!</p>
      <p>📧 kontakt@smakowalo.pl | 📞 +48 999 999 999</p>
    </div>
  </div>
</body>
</html>
`;async function e(a,b,c,e,f){if(!process.env.SENDGRID_API_KEY)return void console.warn("SendGrid API key not configured, skipping email");let g=e.map(a=>`<li>${a.name} x${a.quantity} - ${a.price.toFixed(2)} zł</li>`).join(""),h=`
    <h2>Dziękujemy za zam\xf3wienie!</h2>
    <p>Dzień dobry ${a.name||""},</p>
    <p>Twoje zam\xf3wienie <strong>#${b}</strong> zostało pomyślnie złożone i oczekuje na realizację.</p>

    <div class="order-details">
      <h3>Szczeg\xf3ły zam\xf3wienia:</h3>
      <ul>${g}</ul>
      <hr>
      <p><strong>Łączna kwota: ${c.toFixed(2)} zł</strong></p>
      ${f?`<p><strong>Data dostawy: ${f}</strong></p>`:""}
    </div>

    <p>Twoje świeże składniki zostaną przygotowane przez nasz zesp\xf3ł i dostarczone prosto pod Twoje drzwi.</p>
    <p>O każdej zmianie statusu zam\xf3wienia będziemy Cię informować.</p>

    <p>Smacznego gotowania!</p>
    <p>Zesp\xf3ł Smakowało</p>
  `,i={to:a.email,from:{email:process.env.SENDGRID_FROM_EMAIL||"noreply@smakowalo.pl",name:"Smakowało"},subject:`Potwierdzenie zam\xf3wienia #${b}`,html:d(h)};try{await Object(function(){var a=Error("Cannot find module '@sendgrid/mail'");throw a.code="MODULE_NOT_FOUND",a}())(i),console.log(`Order confirmation email sent to ${a.email}`)}catch(a){throw console.error("SendGrid order confirmation error:",a),a}}async function f(a,b,c,e){if(!process.env.SENDGRID_API_KEY)return void console.warn("SendGrid API key not configured, skipping email");let f={confirmed:"Twoje zam\xf3wienie zostało potwierdzone i przekazane do realizacji.",preparing:"Nasz zesp\xf3ł przygotowuje Twoje świeże składniki.",shipped:"Twoje zam\xf3wienie zostało wysłane i jest w drodze do Ciebie.",delivered:"Twoje zam\xf3wienie zostało dostarczone. Smacznego gotowania!"}[c]||`Status został zaktualizowany na: ${c}`,g=`
    <h2>Aktualizacja statusu dostawy</h2>
    <p>Dzień dobry ${a.name||""},</p>

    <div class="status-update">
      <h3>Zam\xf3wienie #${b}</h3>
      <p><strong>${f}</strong></p>
      ${e?`<p>Przewidywana dostawa: <strong>${e}</strong></p>`:""}
    </div>

    ${"delivered"===c?`
      <p>Mamy nadzieję, że będziesz zadowolony z naszych składnik\xf3w!</p>
      <p>Podziel się swoją opinią lub zdjęciami przygotowanych dań - uwielbiamy widzieć, co tworzysz!</p>
    `:`
      <p>Śledzimy Twoje zam\xf3wienie i będziemy informować o kolejnych etapach realizacji.</p>
    `}

    <p>Dziękujemy za zaufanie!</p>
    <p>Zesp\xf3ł Smakowało</p>
  `,h={to:a.email,from:{email:process.env.SENDGRID_FROM_EMAIL||"noreply@smakowalo.pl",name:"Smakowało"},subject:`Aktualizacja dostawy #${b}`,html:d(g)};try{await Object(function(){var a=Error("Cannot find module '@sendgrid/mail'");throw a.code="MODULE_NOT_FOUND",a}())(h),console.log(`Delivery status email sent to ${a.email}`)}catch(a){throw console.error("SendGrid delivery status error:",a),a}}async function g(a,b,c,e){if(!process.env.SENDGRID_API_KEY)return void console.warn("SendGrid API key not configured, skipping email");let f=`
    <h2>Zmiana statusu subskrypcji</h2>
    <p>Dzień dobry ${a.name||""},</p>

    <div class="status-update">
      <h3>Subskrypcja #${b}</h3>
      <p><strong>${{paused:"Twoja subskrypcja została wstrzymana zgodnie z Twoją prośbą.",resumed:"Twoja subskrypcja została wznowiona. Kolejna dostawa zostanie zaplanowana.",canceled:"Twoja subskrypcja została anulowana. Dziękujemy za korzystanie z naszych usług.",modified:"Ustawienia Twojej subskrypcji zostały zaktualizowane."}[c]}</strong></p>
      ${e?`<p>${e}</p>`:""}
    </div>

    ${"canceled"===c?`
      <p>Jeśli w przyszłości zechcesz ponownie korzystać z naszych usług, będziemy czekać z otwartymi ramionami!</p>
    `:`
      <p>Możesz w każdej chwili zarządzać swoją subskrypcją w panelu klienta na naszej stronie.</p>
    `}

    <p>W razie pytań, jesteśmy do Twojej dyspozycji!</p>
    <p>Zesp\xf3ł Smakowało</p>
  `,g={to:a.email,from:{email:process.env.SENDGRID_FROM_EMAIL||"noreply@smakowalo.pl",name:"Smakowało"},subject:`Aktualizacja subskrypcji #${b}`,html:d(f)};try{await Object(function(){var a=Error("Cannot find module '@sendgrid/mail'");throw a.code="MODULE_NOT_FOUND",a}())(g),console.log(`Subscription status email sent to ${a.email}`)}catch(a){throw console.error("SendGrid subscription status error:",a),a}}},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},71958:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>G,patchFetch:()=>F,routeModule:()=>B,serverHooks:()=>E,workAsyncStorage:()=>C,workUnitAsyncStorage:()=>D});var d={};c.r(d),c.d(d,{DELETE:()=>A,PUT:()=>z});var e=c(96559),f=c(48088),g=c(37719),h=c(26191),i=c(81289),j=c(261),k=c(92603),l=c(39893),m=c(14823),n=c(47220),o=c(66946),p=c(47912),q=c(99786),r=c(46143),s=c(86439),t=c(43365),u=c(32190),v=c(19854),w=c(66437),x=c(49869);let y=(0,w.UU)("https://quqqpixujzxujauhessa.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY);async function z(a,{params:b}){try{let c=await (0,v.getServerSession)();if(!c?.user?.email)return u.NextResponse.json({error:"Authentication required"},{status:401});let d=Number.parseInt(b.id),e=await a.json(),{data:f,error:g}=await y.from("subscriptions").select("*").eq("id",d).eq("customer_email",c.user.email).single();if(g||!f)return u.NextResponse.json({error:"Subscription not found"},{status:404});let h={},i="modified",j="";switch(e.action){case"pause":h={status:"paused",pause_until:e.pause_until,updated_at:new Date().toISOString()},i="paused",j=e.pause_until?`Subskrypcja zostanie automatycznie wznowiona dnia ${e.pause_until}`:"Subskrypcja została wstrzymana na czas nieokreślony";break;case"resume":let k=e.next_delivery_date||new Date(Date.now()+6048e5).toISOString().split("T")[0];h={status:"active",pause_until:null,next_delivery_date:k,updated_at:new Date().toISOString()},i="resumed",j=`Następna dostawa zaplanowana na ${k}`;break;case"cancel":h={status:"canceled",canceled_at:new Date().toISOString(),updated_at:new Date().toISOString()},i="canceled";break;case"update_delivery_date":if(!e.next_delivery_date)return u.NextResponse.json({error:"Next delivery date is required"},{status:400});h={next_delivery_date:e.next_delivery_date,updated_at:new Date().toISOString()},j=`Data następnej dostawy została zmieniona na ${e.next_delivery_date}`;break;case"update_meal_plan":if(!e.meal_plan_config)return u.NextResponse.json({error:"Meal plan configuration is required"},{status:400});let l=e.meal_plan_config.numberOfPeople||f.meal_plan_config?.numberOfPeople||2,m=e.meal_plan_config.numberOfDays||f.meal_plan_config?.numberOfDays||3,n=l*m*30;h={meal_plan_config:{...f.meal_plan_config,...e.meal_plan_config},price_per_delivery:n,updated_at:new Date().toISOString()},j=`Plan posiłk\xf3w został zaktualizowany. Nowa cena za dostawę: ${n.toFixed(2)} zł`;break;default:return u.NextResponse.json({error:"Invalid action"},{status:400})}let{data:o,error:p}=await y.from("subscriptions").update(h).eq("id",d).select().single();if(p)return console.error("Error updating subscription:",p),u.NextResponse.json({error:"Failed to update subscription"},{status:500});return await y.from("audit_log").insert({user_id:null,action:`subscription_${e.action}`,table_name:"subscriptions",record_id:d.toString(),old_values:f,new_values:o,created_at:new Date().toISOString()}),(0,x.do)({email:f.customer_email,name:c.user.name||void 0},d,i,j).catch(a=>console.error("SendGrid subscription email error:",a)),u.NextResponse.json({success:!0,subscription:o,message:"Subscription updated successfully"})}catch(a){return console.error("Error in subscription update:",a),u.NextResponse.json({error:"Internal server error"},{status:500})}}async function A(a,{params:b}){try{let a=await (0,v.getServerSession)();if(!a?.user?.email)return u.NextResponse.json({error:"Authentication required"},{status:401});let c=Number.parseInt(b.id),{data:d,error:e}=await y.from("subscriptions").select("*").eq("id",c).eq("customer_email",a.user.email).single();if(e||!d)return u.NextResponse.json({error:"Subscription not found"},{status:404});let{error:f}=await y.from("subscriptions").update({status:"canceled",canceled_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",c);if(f)return console.error("Error canceling subscription:",f),u.NextResponse.json({error:"Failed to cancel subscription"},{status:500});return await y.from("audit_log").insert({user_id:null,action:"subscription_canceled",table_name:"subscriptions",record_id:c.toString(),old_values:d,new_values:{status:"canceled",canceled_at:new Date().toISOString()},created_at:new Date().toISOString()}),(0,x.do)({email:d.customer_email,name:a.user.name||void 0},c,"canceled").catch(a=>console.error("SendGrid cancellation email error:",a)),u.NextResponse.json({success:!0,message:"Subscription canceled successfully"})}catch(a){return console.error("Error canceling subscription:",a),u.NextResponse.json({error:"Internal server error"},{status:500})}}let B=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/user/subscriptions/[id]/route",pathname:"/api/user/subscriptions/[id]",filename:"route",bundlePath:"app/api/user/subscriptions/[id]/route"},distDir:".next",projectDir:"",resolvedPagePath:"/Users/greg_mac/Downloads/smakowalo-app/src/app/api/user/subscriptions/[id]/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:C,workUnitAsyncStorage:D,serverHooks:E}=B;function F(){return(0,g.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:D})}async function G(a,b,c){var d;let e="/api/user/subscriptions/[id]/route";"/index"===e&&(e="/");let g=await B.prepare(a,b,{srcPage:e,multiZoneDraftMode:"false"});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||B.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===B.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{dynamicIO:!!w.experimental.dynamicIO,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>B.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>B.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await B.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await B.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(L||await B.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[73,55,437,854],()=>b(b.s=71958));module.exports=c})();