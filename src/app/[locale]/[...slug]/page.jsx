// Any address no page above matches: 404 inside the site header and footer
// (app/[locale]/not-found.jsx). Without this route Next.js would show the bare
// root 404 page.
import { notFound } from 'next/navigation';

export default function UnknownPage() {
  notFound();
}
