// /wishlist
import Wishlist from '../../../components/pages/Wishlist';

export const metadata = {
  title: { absolute: 'Wishlist | Food Pharma Machinery' },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <Wishlist />;
}
