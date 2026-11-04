'use client';
// "Hindi mein suniye" under a machine film: reads the Hindi explanation (utlis/videoHindi.js) over
// the muted film. The written text shows too, for devices without a Hindi voice.
import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { speak, stopSpeaking } from '../../../utlis/speak';

export default function HindiVoice({ text }) {
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  useEffect(() => stopSpeaking, []);

  const toggle = async () => {
    setOpen(true);
    if (playing) { stopSpeaking(); setPlaying(false); return; }
    setPlaying(true);
    const ok = await speak(text, () => setPlaying(false));
    if (!ok) { setPlaying(false); setNoVoice(true); }
  };

  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3">
      <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">
        {playing ? <Square className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
        {playing ? 'रोकें' : 'हिंदी में सुनिए'}
      </button>
      {noVoice && <p className="mt-2 text-xs text-slate-600">इस डिवाइस में हिंदी आवाज़ नहीं है। नीचे पढ़ लीजिए।</p>}
      {open && <p lang="hi" className="mt-2 text-sm leading-relaxed text-slate-700">{text}</p>}
    </div>
  );
}
