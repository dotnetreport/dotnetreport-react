# dotnet report for React &nbsp; [www.dotnetreport.com](https://www.dotnetreport.com)

dotnet Report Builder is an Ad hoc Reporting software that allows programmers to easily add Reporting functionality to their ASP .NET Web Application.

This repository is for using dotnet report as a **React** component.

It features an easy and intuitive Report Builder for end users, and all the tools you need to create different types of List or Summary Reports. It can also handle Pie Charts, Bar Charts and Line Charts. Users can also select functions like Sorting, Formatting, Filtering, Grouping and apply Aggregate functions like COUNT, SUM, MIN, MAX and AVERAGE.

![Report Builder](https://dotnetreport.com/wp-content/uploads/2021/12/mk-7-1024x775.png)

For more details, see

- Feature details on the project's website
- Online examples at [https://dotnetreport.com/demo/Report](https://dotnetreport.com/demo/Report)

The easiest way to add .Net Report Builder to your application is to install the Nuget Package. For complete details, please see the getting started guide.

Please see our knowledgebase for detailed documentation.

dotnet Report Builder is licensed under LGPL and EULA.

---

## Requirements

- React 18 or newer
- An ASP .NET backend with dotnet Report set up (NuGet package) that exposes the `/api/DotNetReportApi/*` endpoints

## Installation

```bash
npm install dotnetreport-react
```

## Quick start

Set the backend URL **once** on the provider. Every component below reads it from there.

```tsx
import {
  DotNetReportProvider,
  ReportBuilder,
  ReportDashboard,
  ReportSetup,
} from 'dotnetreport-react';

export default function App() {
  return (
    <DotNetReportProvider baseUrl="https://localhost:5001">
      <ReportBuilder />
    </DotNetReportProvider>
  );
}
```

Need all three screens? Put them anywhere inside the same provider:

```tsx
<DotNetReportProvider baseUrl="https://localhost:5001">
  <ReportBuilder />                      {/* build and run reports  */}
  <ReportDashboard dashboardId={3} />    {/* saved dashboards       */}
  <ReportSetup />                        {/* tables, joins, access  */}
</DotNetReportProvider>
```

A `baseUrl` given directly to a component overrides the provider's value.

### Next.js (App Router)

The engine uses the browser, so render it on the client only:

```tsx
'use client';
import dynamic from 'next/dynamic';

const ReportBuilder = dynamic(() => import('dotnetreport-react').then((m) => m.ReportBuilder), { ssr: false });
```

Wrap the page in `DotNetReportProvider` the same way (import it from a `'use client'` file).

## Components

| Component | What it does |
|---|---|
| `<ReportBuilder />` | Report builder, report list, run and export |
| `<ReportDashboard />` | Dashboards made of saved reports |
| `<ReportSetup />` | Admin setup: tables, joins, data connections, access |
| `<DotNetReportProvider />` | Sets `baseUrl` and shared options once |

## Props

### `DotNetReportProvider` and every component

| Prop | Type | Description |
|---|---|---|
| `baseUrl` | `string` | Root URL of your backend (the one that serves `/api/DotNetReportApi/*`). Required: on the provider, or on the component |
| `fetchInit` | `RequestInit` | Extra options for every request, e.g. `{ credentials: 'include', headers: { Authorization: '...' } }` |
| `assetsBaseUrl` | `string` | Where the vendor scripts and styles are loaded from. Default: jsDelivr |
| `engineVersion` | `string` | Version of the `dotnetreport` engine to load. Default: this package's version |

### Components only

| Prop | Type | Description |
|---|---|---|
| `onReady` | `(vm) => void` | Called when the report is ready, with the underlying view model |
| `onError` | `(error) => void` | Called when loading fails (backend unreachable, scripts blocked ...) |
| `className` | `string` | Class for the wrapper `div` |

### `ReportBuilder`

| Prop | Type | Description |
|---|---|---|
| `reportId` | `number \| string` | Open a saved report directly |
| `linkedReport` | `boolean` | Open in linked-report mode |

### `ReportDashboard`

| Prop | Type | Description |
|---|---|---|
| `dashboardId` | `number` | Dashboard to open. Default: the first one |
| `adminMode` | `boolean` | Show admin-mode dashboards. Default: `localStorage.reportAdminMode` |

### `ReportSetup`

| Prop | Type | Description |
|---|---|---|
| `databaseApiKey` | `string` | Database API key to set up |
| `onlyApi` | `boolean` | Set up API-only data |

## Backend and CORS

The components call your backend directly from the browser. During development the easiest way to avoid CORS errors is a dev-server proxy. Vite example, then use `baseUrl=""`:

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'https://localhost:5001', changeOrigin: true, secure: false } },
  },
});
```

## Styles and scripts

Styles (Bootstrap, Font Awesome, Select2, GridStack, Leaflet, ...) and scripts (jQuery, Knockout, ECharts, ...) that the engine needs are loaded automatically, once per page, from jsDelivr. There is nothing to import.

Behind a strict firewall or Content-Security-Policy? Host the same npm files yourself and point `assetsBaseUrl` at them:

```tsx
<DotNetReportProvider baseUrl="..." assetsBaseUrl="/vendor/">
```

## Versions

One source: `"version"` in `package.json`. It is the npm package version **and** the dotnetreport engine version loaded at runtime (injected at build time by `tsup.config.ts`). Change it, then run `npm run build`.

## Development

```bash
npm install
npm run build      # outputs ESM, CJS and .d.ts into dist/
npm pack           # creates dotnetreport-react-<version>.tgz to install in a test app
```

### Project layout

```
src/
├── index.ts              public exports
├── context.tsx           DotNetReportProvider (baseUrl and shared options)
├── components.tsx        ReportBuilder, ReportDashboard, ReportSetup
├── KoApp.tsx             hosts one screen: render, start, clean up
├── engine.ts             loads the vendor scripts and styles once
└── templates/
    ├── common.html       templates shared by all three screens
    ├── report.html       ReportBuilder markup
    ├── dashboard.html    ReportDashboard markup
    ├── setup.html        ReportSetup markup
    ├── date-format-popover.html
    └── index.ts          joins common.html into each screen
```

Each screen's HTML contains a `<!--COMMON_TEMPLATES-->` marker where `common.html` is inserted, and its root element must keep `id="dot-net-report"`.

### Testing in a React app

```bash
npm run build && npm pack
cd ../my-test-app
npm install ../dotnetreport-react/dotnetreport-react-<version>.tgz
```

### Syncing templates from the upstream library

```bash
npm run sync-templates -- path/to/dotnetreport-lib/src/lib
```

This **overwrites** everything in `src/templates/`. Do not run it after editing those files by hand.

## License

dotnet Report Builder is licensed under LGPL and EULA.