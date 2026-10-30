# माँ दशमद्वार मानस मंडली वेबसाइट

## उत्तराखंड समाचार फीड
- अमर उजाला: उत्तराखंड और चमोली RSS
- हिन्दुस्तान: उत्तराखंड और चमोली RSS
- Netlify Scheduled Function हर 30 मिनट में RSS अपडेट करती है।
- अधिकतम 10 खबरें, पिछले 7 दिनों की; चमोली को प्राथमिकता।
- समाचार शीर्षक पर क्लिक करने से मूल समाचार खुलेगा।

## Netlify
1. GitHub repository को Netlify site से जोड़ें।
2. Base directory खाली/`/`, Publish directory `.`, Functions directory `netlify/functions` रखें (netlify.toml में भी सेट है)।
3. पहली production deploy के बाद Netlify Dashboard → Functions में `refresh-news` खोलकर **Run now** दबाएँ। पहली बार डेटा भरने के बाद यह हर 30 मिनट में अपने आप चलेगा।
4. `news-feed` function से फ्रंटएंड नवीनतम खबरें पढ़ता है।

Netlify Blobs का उपयोग news cache के लिए है; Firebase configuration या existing Firebase data में बदलाव नहीं किया गया है।
