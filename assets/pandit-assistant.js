(() => {
"use strict";
if (window.__panditAssistantLoaded) return;
window.__panditAssistantLoaded = true;
const PANDIT_PHONE = "917827160848"; // +91 सहित; नंबर बदलने पर केवल यही पंक्ति बदलें
const ENDPOINT = "/.netlify/functions/pandit-chat";
const css = `
#pa-root{position:fixed;right:16px;bottom:16px;z-index:9998;font-family:'Hind',Arial,sans-serif;color:#30251d}
#pa-root *{box-sizing:border-box}
#pa-launch{border:1px solid #f5d58b;border-radius:999px;padding:9px 16px 9px 10px;display:flex;align-items:center;gap:9px;background:linear-gradient(135deg,#81301d,#c47b29 60%,#dfb65e);color:#fffdf4;box-shadow:0 8px 25px #54200b55;cursor:pointer;font:600 15px 'Hind',Arial,sans-serif}
#pa-launch .pa-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#fff2d5;color:#84351e;font-size:22px}
#pa-launch small{display:block;font-size:11px;font-weight:400}
#pa-panel{display:none;position:absolute;right:0;bottom:66px;width:min(365px,calc(100vw - 28px));height:min(590px,calc(100dvh - 110px));min-height:390px;background:#fffaf0;border:1px solid #e5c98d;border-radius:20px;overflow:hidden;box-shadow:0 18px 55px #2b160b44;flex-direction:column}
#pa-panel.open{display:flex}
.pa-head{padding:13px;background:linear-gradient(120deg,#70251e,#a34e23);color:#fff8e9;display:flex;align-items:center;gap:10px}
.pa-head-icon{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#fff0ce;color:#7b321d;font-size:22px}
.pa-title{font-weight:700;font-size:15px}.pa-sub{font-size:11px;opacity:.9}
.pa-close{margin-left:auto;border:0;background:#ffffff20;color:white;border-radius:50%;width:34px;height:34px;font-size:22px}
.pa-messages{padding:13px;overflow:auto;flex:1;background:#fffaf3}
.pa-msg{max-width:92%;padding:10px 12px;margin:0 0 10px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere}
.pa-bot{background:#f3e6cd;border:1px solid #ead7b3;border-top-left-radius:4px}
.pa-user{margin-left:auto;background:#7b3423;color:#fffaf0;border-top-right-radius:4px}
.pa-suggest{display:flex;gap:6px;overflow:auto;padding:0 10px 9px;background:#fff}
.pa-suggest button{white-space:nowrap;border:1px solid #d8b979;border-radius:20px;background:#fff8e8;color:#74321f;padding:6px 9px;font:12px 'Hind',Arial,sans-serif}
.pa-compose{display:flex;gap:7px;padding:9px;border-top:1px solid #eadcc3;background:#fff}
.pa-compose input{min-width:0;flex:1;border:1px solid #d9c9ad;border-radius:22px;padding:10px 12px;font:14px 'Hind',Arial,sans-serif}
.pa-send{border:0;border-radius:50%;width:42px;height:42px;background:#8a3822;color:#fff;font-size:18px}
.pa-actions{display:flex;gap:8px;padding:0 10px 9px;background:#fff}
.pa-actions a{flex:1;text-align:center;text-decoration:none;border-radius:10px;padding:8px 4px;font:600 12px 'Hind',Arial,sans-serif}
.pa-wa{background:#16834a;color:#fff}.pa-call{background:#f3e7d0;color:#71301e;border:1px solid #e0c99e}
.pa-note{font-size:10px;color:#877968;text-align:center;padding:0 8px 8px;background:#fff}
@media(max-width:480px){#pa-root{right:11px;bottom:11px}#pa-panel{right:-2px;width:calc(100vw - 22px);height:min(600px,calc(100dvh - 95px))}}
`;
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
const root=document.createElement("div");root.id="pa-root";
root.innerHTML=`
<section id="pa-panel" role="dialog" aria-label="पंडित जी से धार्मिक सहायता">
<header class="pa-head"><div class="pa-head-icon">🙏</div><div><div class="pa-title">पंडित जी से संपर्क सहायता</div><div class="pa-sub">हिंदी में अपना प्रश्न पूछें</div></div><button class="pa-close" type="button" aria-label="बंद करें">×</button></header>
<div class="pa-messages" aria-live="polite"><div class="pa-msg pa-bot">नमस्कार! 🙏 आपका स्वागत है। पूजा-पाठ, विवाह, गृह प्रवेश, मुहूर्त या अन्य धार्मिक विषय पर अपना प्रश्न लिखें। विशेष/स्थानीय निर्णय के लिए पंडित जी से पुष्टि अवश्य करें।</div></div>
<div class="pa-suggest"><button>पूजा-पाठ</button><button>विवाह मुहूर्त</button><button>गृह प्रवेश</button><button>जन्मपत्री</button></div>
<form class="pa-compose"><input maxlength="1200" placeholder="अपना प्रश्न यहाँ लिखें…" aria-label="अपना प्रश्न लिखें" required><button class="pa-send" type="submit">➤</button></form>
<div class="pa-actions"><a class="pa-wa" target="_blank" rel="noopener noreferrer">WhatsApp पर भेजें</a><a class="pa-call">📞 फोन कॉल</a></div><div class="pa-note">WhatsApp भेजने से पहले संदेश की जाँच कर लें।</div></section>
<button id="pa-launch" type="button" aria-expanded="false"><span class="pa-icon">🙏</span><span>पंडित जी से पूछें<small>धार्मिक सहायता यहाँ पाएँ</small></span></button>`;
document.body.appendChild(root);
const panel=root.querySelector("#pa-panel"), launch=root.querySelector("#pa-launch"), msgs=root.querySelector(".pa-messages"), form=root.querySelector("form"), input=form.querySelector("input"), wa=root.querySelector(".pa-wa"), call=root.querySelector(".pa-call");
const history=[];
function contacts(){call.href="tel:+"+PANDIT_PHONE;const transcript=history.map(x=>(x.role==="user"?"आगंतुक: ":"सहायक: ")+x.text).join("\n\n");wa.href="https://wa.me/"+PANDIT_PHONE+"?text="+encodeURIComponent("नमस्कार पंडित जी, मुझे धार्मिक मार्गदर्शन चाहिए।\n\n"+(transcript||"कृपया मुझसे संपर्क करें।"));}
function add(text,who){const d=document.createElement("div");d.className="pa-msg "+(who==="user"?"pa-user":"pa-bot");d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function toggle(open){panel.classList.toggle("open",open);launch.setAttribute("aria-expanded",String(open));if(open)input.focus();}
launch.onclick=()=>toggle(!panel.classList.contains("open"));root.querySelector(".pa-close").onclick=()=>toggle(false);
root.querySelectorAll(".pa-suggest button").forEach(b=>b.onclick=()=>{input.value=b.textContent;form.requestSubmit();});
contacts();
form.addEventListener("submit",async e=>{e.preventDefault();const message=input.value.trim();if(!message)return;input.value="";add(message,"user");history.push({role:"user",text:message});contacts();const wait=document.createElement("div");wait.className="pa-msg pa-bot";wait.textContent="उत्तर तैयार हो रहा है…";msgs.appendChild(wait);const send=form.querySelector("button");send.disabled=true;
try{const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message,history:history.slice(-8)})});const data=await r.json();if(!r.ok||!data.reply)throw Error("AI unavailable");wait.remove();add(data.reply,"bot");history.push({role:"model",text:data.reply});}
catch(_){wait.remove();add("अभी AI सेवा से उत्तर नहीं मिल पाया। आप अपना प्रश्न WhatsApp पर पंडित जी को भेज सकते हैं या सीधे फोन कर सकते हैं।","bot");}
finally{send.disabled=false;contacts();}
});
})();