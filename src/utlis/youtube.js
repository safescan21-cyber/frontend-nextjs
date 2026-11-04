// YouTube films (SGWEIGH's own channel), shown with YouTube's player. Browsers only start a
// video by itself when it is muted. youtube-nocookie: no YouTube tracking cookies before a click.
export const youtubeId = (url) => (String(url || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/) || [])[1] || null;
export const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const youtubeEmbed = (id, { controls = 0 } = {}) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=${controls}&rel=0&playsinline=1&modestbranding=1`;
