// Gemini AI backend. Add GEMINI_API_KEY in Netlify Environment variables.
// Keep the API key out of all public website files.
const MODEL="gemini-2.5-flash";
const MAX=1200;
const SITE="https://maadashamdwar.netlify.app";
export default async (req)=>{
 const origin=req.headers.get("origin")||"";
 const headers={"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":origin===SITE?SITE:SITE,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin","Cache-Control":"no-store"};
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return new Response(JSON.stringify({error:"केवल POST अनुरोध स्वीकार है।"}),{status:405,headers});
 try{
  const key=Netlify.env.get("GEMINI_API_KEY");
  if(!key)return new Response(JSON.stringify({error:"AI API key सेट नहीं है।"}),{status:503,headers});
  const body=await req.json(),message=String(body.message||"").trim();
  if(!message||message.length>MAX)return new Response(JSON.stringify({error:"कृपया 1 से 1200 अक्षरों में प्रश्न लिखें।"}),{status:400,headers});
  const history=Array.isArray(body.history)?body.history.slice(-8):[];
  const contents=history.map(x=>({role:x.role==="model"?"model":"user",parts:[{text:String(x.text||"").slice(0,MAX)}]})).filter(x=>x.parts[0].text);
  if(!contents.length||contents[contents.length-1].role!=="user"||contents[contents.length-1].parts[0].text!==message)contents.push({role:"user",parts:[{text:message}]});
  const instruction=`आप माँ दशमद्वार मानस मंडली की वेबसाइट के हिंदी धार्मिक सहायता सहायक हैं। सरल, सम्मानजनक देवनागरी हिंदी में उत्तर दें। पूजा-पाठ, भारतीय धार्मिक परंपराओं, विवाह संस्कार, गृह प्रवेश और सामान्य धार्मिक जानकारी पर संतुलित सामान्य मार्गदर्शन दें। परंपराएँ क्षेत्र और संप्रदाय के अनुसार बदल सकती हैं। तिथि, पंचांग, मुहूर्त, ग्रह-स्थिति, ज्योतिषीय निष्कर्ष या शास्त्रीय उद्धरण के बारे में निश्चित जानकारी न हो तो अनुमान न लगाएँ और पंडित जी से पुष्टि करने को कहें। स्वयं को वास्तविक पंडित या प्रमाणित ज्योतिषी न बताएं। चिकित्सा, कानूनी या वित्तीय निर्णय धार्मिक आधार पर निर्देशित न करें। पासवर्ड, OTP, बैंक विवरण या अनावश्यक निजी जानकारी न माँगें। संक्षिप्त, उपयोगी और विनम्र उत्तर दें।`;
  const api=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemInstruction:{parts:[{text:instruction}]},contents,generationConfig:{temperature:0.45,maxOutputTokens:550}}),signal:AbortSignal.timeout(25000)});
  const data=await api.json().catch(()=>({}));
  if(!api.ok){console.error("Gemini error",api.status,data?.error?.message);return new Response(JSON.stringify({error:"AI सेवा अभी उपलब्ध नहीं है।"}),{status:502,headers});}
  const reply=data?.candidates?.[0]?.content?.parts?.map(p=>p.text||"").join("").trim();
  if(!reply)return new Response(JSON.stringify({error:"अभी उत्तर उपलब्ध नहीं है।"}),{status:502,headers});
  return new Response(JSON.stringify({reply}),{status:200,headers});
 }catch(err){console.error("Pandit chat error",err);return new Response(JSON.stringify({error:"प्रश्न भेजने में समस्या हुई।"}),{status:500,headers});}
};