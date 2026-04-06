import WebsiteLayout from './(website)/layout';
import CommencePage from './(website)/page';

// Marketing page — always render at root
export default function Home() {
  return (
    <WebsiteLayout>
      <CommencePage />
    </WebsiteLayout>
  );
}
