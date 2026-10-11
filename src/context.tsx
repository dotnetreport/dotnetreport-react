import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { CommonProps, Resolved } from './KoApp';

type Config = Pick<CommonProps, 'baseUrl' | 'fetchInit' | 'assetsBaseUrl' | 'engineVersion'>;
const ConfigContext = createContext<Config>({});

/** Set the backend URL (and other shared options) once; ReportBuilder, ReportDashboard and ReportSetup all read it. */
export function DotNetReportProvider({ children, baseUrl, fetchInit, assetsBaseUrl, engineVersion }: Config & { children: ReactNode }) {
  const value = useMemo(() => ({ baseUrl, fetchInit, assetsBaseUrl, engineVersion }), [baseUrl, fetchInit, assetsBaseUrl, engineVersion]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

/** Props given directly to a component win over the Provider's values. */
export function useResolved<T extends CommonProps>(props: T): Resolved<T> {
  const ctx = useContext(ConfigContext);
  const own = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined));
  const merged = { ...ctx, ...own } as T;
  if (!merged.baseUrl && merged.baseUrl !== '') {
    throw new Error('dotnetreport-react: baseUrl is missing. Pass baseUrl to <DotNetReportProvider> (once) or to the component.');
  }
  return merged as Resolved<T>;
}
