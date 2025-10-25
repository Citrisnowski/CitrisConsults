import Link from 'next/link';
import Container from '../components/Container';

/**
 * Custom 404 page displayed when no route matches. It maintains the same
 * visual language as the rest of the site and offers a link back to the
 * home page.
 */
export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-gray-600 mb-6">Sorry, we couldn’t find the page you’re looking for.</p>
      <Link href="/" className="text-red-600 hover:underline">Return to home</Link>
    </Container>
  );
}