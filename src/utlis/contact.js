// Company WhatsApp for "message us" links: wa.me needs country code + number, no "+"
export const WHATSAPP_NUMBER = '918700792607'; // +91 87007 92607

export const whatsappLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
