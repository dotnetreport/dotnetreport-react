# dotnetreport-react

Thin React wrapper around the `dotnetreport` Knockout engine - same idea as `dotnetreport-ng`.
Your backend must expose the usual `/api/DotNetReportApi/*` endpoints.

## Install
    npm i dotnetreport-react

## Use (Vite / CRA)
    import { ReportBuilder, ReportDashboard, ReportSetup } from 'dotnetreport-react';

    <ReportBuilder baseUrl="https://localhost:5001" />
    <ReportDashboard baseUrl="https://localhost:5001" dashboardId={3} />
    <ReportSetup baseUrl="https://localhost:5001" />

## Use (Next.js App Router) - client only
    'use client';
    import dynamic from 'next/dynamic';
    const ReportBuilder = dynamic(() => import('dotnetreport-react').then(m => m.ReportBuilder), { ssr: false });

## Props (all components)
| prop | meaning |
|---|---|
| baseUrl | backend root (Angular: provideDotNetReport(baseUrl)) |
| fetchInit | extra fetch options, e.g. `{ credentials: 'include', headers: {...} }` |
| onReady(vm) / onError(e) | lifecycle callbacks |
| assetsBaseUrl | where the vendor scripts load from (default jsDelivr; point to your own host for offline/CSP) |
| engineVersion | version of the `dotnetreport` npm package to load (default 6.3.4) |

ReportBuilder: `reportId`, `linkedReport` - ReportDashboard: `dashboardId`, `adminMode` - ReportSetup: `databaseApiKey`, `onlyApi`

## Build / sync with upstream
    npm run sync-templates -- path/to/dotnetreport-ng-lib/projects/dotnetreport-lib/src/lib
    npm run build
