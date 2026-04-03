export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const parseSRTTime = (timeStr: string) => {
  const [h, m, s_ms] = timeStr.split(':');
  const [s, ms] = s_ms.split(',');
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
};

export const getSmartName = (title: string, fileName: string) => {
  return title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : fileName.split('.')[0];
};

export const generateSRT = (segments: any[]) => {
  return segments.map((s, i) => `${i + 1}\n${s.time} --> ${s.time}\n${s.text}${s.translated_text ? `\n${s.translated_text}` : ''}`).join('\n\n');
};
