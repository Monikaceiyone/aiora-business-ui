import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

// Marketing page components
import CommencePage from './(website)/page';
import WebsiteLayout from './(website)/layout';

export default async function Home() {
  const headersList = await headers();
  const isMarketingSite = headersList.get('x-marketing-site') === 'true';
  // If marketing site OR running locally in dev mode
  const isDev = process.env.NODE_ENV === 'development';
  if (isMarketingSite || isDev) {
    return (
      <WebsiteLayout>
        <CommencePage />
      </WebsiteLayout>
    );
  }

  // Otherwise redirect to dashboard login
  redirect('/login');
}
