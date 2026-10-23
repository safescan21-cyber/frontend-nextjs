'use client';
// Wraps a page component rendered by a Next.js route so React Router hooks inside it
// (useParams…) keep working:  <RoutePage path="/shop/:id"><SingleProduct /></RoutePage>
import { Routes, Route } from 'react-router-dom';

export default function RoutePage({ path, children }) {
  return (
    <Routes>
      <Route path={path} element={children} />
    </Routes>
  );
}
