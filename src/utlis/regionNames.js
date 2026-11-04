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
  LA: ['Ladakh', 'लद्दाख'], LD: ['Lakshadweep', 'लक्षद्वीप'], PY: ['Puducherry', 'पुडुचेरी'],
};

export const regionName = (code, hindi) => NAMES[code]?.[hindi ? 1 : 0] || '';
