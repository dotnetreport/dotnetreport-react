import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DotNetReportProvider, ReportBuilder, ReportDashboard, ReportSetup, ReportUsers } from '../src';

// One page per path, with full page loads between them like the main app
const pages: Record<string, () => JSX.Element> = {
  '/': () => <ReportBuilder />,
  '/dashboard': () => <ReportDashboard />,
  '/setup': () => <ReportSetup />,
  '/users': () => <ReportUsers />,
};
const Page = pages[window.location.pathname] || pages['/'];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <nav className="navbar navbar-expand navbar-light bg-light border-bottom mb-3 px-3">
      <span className="navbar-brand">dotnetreport-react</span>
      <ul className="navbar-nav">
        <li className="nav-item"><a className="nav-link" href="/">Reports</a></li>
        <li className="nav-item"><a className="nav-link" href="/dashboard">Dashboard</a></li>
        <li className="nav-item"><a className="nav-link" href="/setup">Setup</a></li>
        <li className="nav-item"><a className="nav-link" href="/users">Users &amp; Access</a></li>
      </ul>
    </nav>
    {/* baseUrl "" uses this server, which proxies /api to the main app; /vendor/ serves the scripts locally */}
    <DotNetReportProvider baseUrl="" assetsBaseUrl="/vendor/">
      <Page />
    </DotNetReportProvider>
  </StrictMode>
);
