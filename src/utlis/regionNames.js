// Indian state and union territory names by region code, for Nova's greeting: [English, Hindi]
const NAMES = {
  AP: ['Andhra Pradesh', 'आंध्र प्रदेश'], AR: ['Arunachal Pradesh', 'अरुणाचल प्रदेश'], AS: ['Assam', 'असम'], BR: ['Bihar', 'बिहार'],
  CT: ['Chhattisgarh', 'छत्तीसगढ़'], CG: ['Chhattisgarh', 'छत्तीसगढ़'], GA: ['Goa', 'गोवा'], GJ: ['Gujarat', 'गुजरात'], HR: ['Haryana', 'हरियाणा'],
  HP: ['Himachal Pradesh', 'हिमाचल प्रदेश'], JH: ['Jharkhand', 'झारखंड'], KA: ['Karnataka', 'कर्नाटक'], KL: ['Kerala', 'केरल'],
  MP: ['Madhya Pradesh', 'मध्य प्रदेश'], MH: ['Maharashtra', 'महाराष्ट्र'], MN: ['Manipur', 'मणिपुर'], ML: ['Meghalaya', 'मेघालय'],
  MZ: ['Mizoram', 'मिज़ोरम'], NL: ['Nagaland', 'नागालैंड'], OR: ['Odisha', 'ओडिशा'], OD: ['Odisha', 'ओडिशा'], PB: ['Punjab', 'पंजाब'],
  RJ: ['Rajasthan', 'राजस्थान'], SK: ['Sikkim', 'सिक्किम'], TN: ['Tamil Nadu', 'तमिलनाडु'], TG: ['Telangana', 'तेलंगाना'], TS: ['Telangana', 'तेलंगाना'],
  TR: ['Tripura', 'त्रिपुरा'], UP: ['Uttar Pradesh', 'उत्तर प्रदेश'], UT: ['Uttarakhand', 'उत्तराखंड'], UK: ['Uttarakhand', 'उत्तराखंड'], WB: ['West Bengal', 'पश्चिम बंगाल'],
  AN: ['Andaman and Nicobar Islands', 'अंडमान और निकोबार'], CH: ['Chandigarh', 'चंडीगढ़'], DL: ['Delhi', 'दिल्ली'], JK: ['Jammu and Kashmir', 'जम्मू और कश्मीर'],
  DN: ['Dadra and Nagar Haveli and Daman and Diu', 'दादरा और नगर हवेली और दमन और दीव'], LA: ['Ladakh', 'लद्दाख'], LD: ['Lakshadweep', 'लक्षद्वीप'], PY: ['Puducherry', 'पुडुचेरी'],
};

export const regionName = (code, hindi) => NAMES[code]?.[hindi ? 1 : 0] || '';

// The language Nova greets in, by region code: Hindi in the north, the state's language in the
// south, west and east, and nothing (English) anywhere else or when the state isn't known
const LANGUAGES = {
  hi: ['HR', 'UP', 'UT', 'UK', 'HP', 'DL', 'RJ', 'MP', 'BR', 'JH', 'CT', 'CG', 'PB', 'CH', 'JK', 'LA'],
  ta: ['TN', 'PY'],
  te: ['AP', 'TG', 'TS'],
  kn: ['KA'],
  ml: ['KL', 'LD'],
  gu: ['GJ'],
  mr: ['MH'],
  bn: ['WB', 'TR'],
};
export const regionLanguage = (code) => Object.keys(LANGUAGES).find((l) => LANGUAGES[l].includes(code)) || '';

export const REGIONAL_GREETING = {
  ta: 'ஃபுட் ஃபார்மா மெஷினரிக்கு வரவேற்கிறோம்! நான் நோவா. உங்களுக்கு எந்த வகை இயந்திரம் வேண்டும்?',
  te: 'ఫుడ్ ఫార్మా మెషినరీకి స్వాగతం! నేను నోవా. మీకు ఏ రకమైన యంత్రం కావాలి?',
  kn: 'ಫುಡ್ ಫಾರ್ಮಾ ಮೆಷಿನರಿಗೆ ಸ್ವಾಗತ! ನಾನು ನೋವಾ. ನಿಮಗೆ ಯಾವ ರೀತಿಯ ಯಂತ್ರ ಬೇಕು?',
  ml: 'ഫുഡ് ഫാർമ മെഷിനറിയിലേക്ക് സ്വാഗതം! ഞാൻ നോവ. നിങ്ങൾക്ക് ഏത് തരം യന്ത്രമാണ് വേണ്ടത്?',
  gu: 'ફૂડ ફાર્મા મશીનરીમાં આપનું સ્વાગત છે! હું નોવા છું. તમે કયા પ્રકારનું મશીન શોધી રહ્યા છો?',
  mr: 'फूड फार्मा मशिनरीमध्ये आपले स्वागत आहे! मी नोवा. तुम्ही कोणत्या प्रकारचे मशीन शोधत आहात?',
  bn: 'ফুড ফার্মা মেশিনারিতে আপনাকে স্বাগতম! আমি নোভা। আপনি কোন ধরনের মেশিন খুঁজছেন?',
};
