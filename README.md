# dotnetreport-react

React components for [Dotnet Report](https://dotnetreport.com), the embedded ad hoc reporting and dashboard builder for ASP.NET. Put the Report Designer, Dashboards, Setup and Users & Access screens inside your React app while your .NET backend serves the API.

![Report Builder](https://dotnetreport.com/wp-content/uploads/2021/12/mk-7-1024x775.png)

- List, summary, pivot and chart reports (bar, line, pie, map, gauge, funnel and more) with filtering, grouping and totals
- Dashboards with drag-and-drop tiles and a live preview while editing
- Export to Excel, PDF, Word and CSV, and scheduled email delivery
- Users, roles, tenants and permissions, without giving anyone full admin rights

Full guide: **[Install with React](https://dotnetreport.com/docs/#installation-react)** in the knowledge base.

## Requirements

- React 18 or newer
- An ASP.NET Core backend with the [`dotnetreport`](https://www.nuget.org/packages/dotnetreport/) or [`dotnetreport.backend`](https://www.nuget.org/packages/dotnetreport.backend/) NuGet package **at the same version** as this package

## Install

```bash
npm install dotnetreport-react
```

That is the only package you need. The components load jQuery, Knockout, ECharts, Bootstrap, the `dotnetreport` scripts and the other libraries they use themselves, once per page, at the versions they were tested with.

## Quick start

```tsx
import { DotNetReportProvider, ReportBuilder } from 'dotnetreport-react';

export default function App() {
  return (
    <DotNetReportProvider baseUrl="https://localhost:7001">
      <ReportBuilder />
    </DotNetReportProvider>
  );
}
```

`baseUrl` is your backend's origin, with no trailing slash. The components call `{baseUrl}/api/DotNetReportApi/...`. Use `""` when the API is on the same origin or behind a dev-server proxy.

## Components

| Component | Screen | Props |
|---|---|---|
| `<ReportBuilder />` | Report list, Report Designer, running and exporting | `reportId`, `folderId`, `linkedReport` |
| `<ReportDashboard />` | Dashboards | `dashboardId`, `adminMode` |
| `<ReportSetup />` | Setup: tables, relations, workspace and email settings | `databaseApiKey`, `onlyApi` (default `true`) |
| `<ReportUsers />` | Users & Access: users, roles, tenants and permissions | |
| `<DotNetReportProvider />` | Shared settings for the components inside it | `baseUrl`, `fetchInit`, `assetsBaseUrl`, `engineVersion` |

Screen props are optional and fall back to the page's query string, like the .NET pages: `?reportId=`, `?folderid=`, `?linkedreport=true`, `?id=` (dashboard), `?databaseApiKey=`, `?onlyApi=`.

Every component also takes `onReady(vm)`, `onError(error)` and `className`. A prop on a component wins over the provider's value.

```tsx
<DotNetReportProvider baseUrl={import.meta.env.VITE_REPORT_API}>
  <Routes>
    <Route path="/reports" element={<ReportBuilder />} />
    <Route path="/dashboard" element={<ReportDashboard />} />
    <Route path="/setup" element={<ReportSetup />} />
    <Route path="/users" element={<ReportUsers />} />
  </Routes>
</DotNetReportProvider>
```

## Backend

- **Anti-forgery token.** The API's POST calls check an anti-forgery token. The components get one from `GET /api/DotNetReportApi/GetAntiForgeryToken`, added in the 6.4.0 backend, so upgrade the backend with this package. With an older backend, running and saving reports fails with `400 Bad Request`.
- **Same origin is simplest.** In development, proxy `/api` to the backend and use `baseUrl=""`:

  ```ts
  // vite.config.ts
  export default defineConfig({
    plugins: [react()],
    server: { proxy: { '/api': { target: 'https://localhost:7001', changeOrigin: true, secure: false } } },
  });
  ```

- **Different origins.** Pass `fetchInit={{ credentials: 'include' }}` on the provider (this also makes the scripts' own jQuery calls send cookies). On the API, allow your front end's exact origin with `AllowCredentials()` and set the anti-forgery cookie to `SameSite=None` and `Secure`. Never allow any origin together with credentials.

## Hosting the scripts yourself

By default the scripts and styles come from `https://cdn.jsdelivr.net/npm/`. Behind a firewall or a strict Content Security Policy, serve the same npm files yourself and set `assetsBaseUrl`:

```tsx
<DotNetReportProvider baseUrl="" assetsBaseUrl="/vendor/">
```

Files are requested as `{assetsBaseUrl}{package}@{version}/{file}`, the same layout as jsDelivr. Call `loadEngine()` to start loading before a component is shown.

## Next.js

The components need the browser, so load them on the client only:

```tsx
'use client';
import dynamic from 'next/dynamic';

const ReportBuilder = dynamic(() => import('dotnetreport-react').then((m) => m.ReportBuilder), { ssr: false });
```

## Upgrading to 6.4.0

- Add a route for `<ReportUsers />`. Users & Roles is no longer a tab in Setup.
- `ReportSetup`'s `onlyApi` now defaults to `true`, like the .NET Setup page. Pass `onlyApi={false}` for the old behavior.
- Upgrade the backend at the same time, for the anti-forgery token endpoint.

## Developing this package

The source lives in the Dotnet Report repository under `react/`, next to the .NET front end it shares its markup with, and is published to npm by the release pipeline. The [GitHub repository](https://github.com/dotnetreport/dotnetreport-react) is a public copy.

```bash
npm install
npm run build   # generates src/templates.generated.ts from the Razor views, then builds dist/
npm run demo    # demo app on http://localhost:5173, proxying /api to the .NET app
```

The screens' markup is generated from the main app's Razor views by `../angular/scripts/sync-templates.mjs`, so change the views, not generated files. The versions of the libraries the components load come from the main app's `package.json` at build time.

## Documentation

See the [knowledge base](https://dotnetreport.com/docs/) for everything else.

## License

Dotnet Report is licensed under [LGPL](https://github.com/dotnetreport/ReportBuilder.Web/blob/master/LICENSE) and EULA.
