// Plain, readable copy of the page for crawlers and for the moment before the
// app loads. Inline styles only: Tailwind classes here might not be generated.
export default function SeoSummary({ summary }) {
  if (!summary) return null;
  const { crumbs, heading, image, lines = [], list = [], links = [] } = summary;
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '110px 16px 40px', fontFamily: 'system-ui, sans-serif', color: '#1f2937', lineHeight: 1.6 }}>
      {crumbs && (
        <nav aria-label="Breadcrumb" style={{ fontSize: 14, color: '#6b7280' }}>
          {crumbs.map(([name, href], i) => (
            <span key={name}>
              {i > 0 && ' › '}
              {href ? <a href={href}>{name}</a> : name}
            </span>
          ))}
        </nav>
      )}
      {heading && <h1 style={{ fontSize: 28, margin: '12px 0' }}>{heading}</h1>}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={heading || ''} width={480} style={{ maxWidth: '100%', height: 'auto', borderRadius: 12 }} />
      )}
      {lines.map((l, i) => (
        <p key={i}>{l}</p>
      ))}
      {list.length > 0 && (
        <ul>
          {list.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <p>
          {links.map(([href, label], i) => (
            <span key={href}>
              {i > 0 && ' · '}
              <a href={href}>{label}</a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
