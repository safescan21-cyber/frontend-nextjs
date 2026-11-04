// Reads text aloud with the voices on the visitor's own device (the browser's speech feature).
// Browsers only allow sound after a click, so it always starts from a button.
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
if (canSpeak()) window.speechSynthesis.getVoices(); // browsers load the voice list on first ask

const voices = () => new Promise((resolve) => {
  const list = window.speechSynthesis.getVoices();
  if (list.length) return resolve(list);
  window.speechSynthesis.addEventListener('voiceschanged', () => resolve(window.speechSynthesis.getVoices()), { once: true });
  setTimeout(() => resolve(window.speechSynthesis.getVoices()), 800); // some browsers never fire it
  return undefined;
});

export const stopSpeaking = () => { if (canSpeak()) window.speechSynthesis.cancel(); };

// Resolves false when the device has no voice for the language (an English voice would garble Hindi)
export const speak = async (text, onEnd) => {
  if (!canSpeak()) return false;
  const lang = /[ऀ-ॿ]/.test(text) ? 'hi' : 'en';
  // no waiting when the list is there: iPhones only speak straight from the tap itself
  const ready = window.speechSynthesis.getVoices();
  const list = ready.length ? ready : await voices();
  const voice = list.find((v) => v.lang.toLowerCase().startsWith(`${lang}-in`)) || list.find((v) => v.lang.toLowerCase().startsWith(lang));
  if (!voice) return false;
  if (window.speechSynthesis.speaking) stopSpeaking();
  const u = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, ''));
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.95;
  u.onend = onEnd;
  u.onerror = onEnd;
  window.speechSynthesis.speak(u);
  return true;
};
