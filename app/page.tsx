import CompanyHome from "./_home/CompanyHome";
import MyksaHome from "./_home/MyksaHome";

// One codebase, two websites (each Vercel project sets its own SITE_MODE):
//   www.myksaconnect.com      → SITE_MODE=ksaconnect → MYKSA CONNECT homepage
//   www.moaappsdevelopers.com → SITE_MODE not set    → MOA Apps company homepage
// ("_home" starts with "_", so Next.js never turns it into a page of its own.)
export default function HomePage() {
  return process.env.SITE_MODE === "ksaconnect" ? <MyksaHome /> : <CompanyHome />;
}
