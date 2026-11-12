import { useEffect, useRef } from 'react';
import { loadEngine, type EngineOptions } from './engine';

declare global {
  interface Window { $: any; ko: any; _: any; GridStack: any; reportViewModel: any; dashboardViewModel: any; manageViewModel: any; usersAccessViewModel: any }
}

export interface CommonProps extends EngineOptions {
  /** Root URL of the backend that exposes /api/DotNetReportApi/*. Optional here: set it once on <DotNetReportProvider> instead. */
  baseUrl?: string;
  /** Extra options for every fetch call (headers, credentials ...). */
  fetchInit?: RequestInit;
  /** Called with the Knockout view model once bindings are applied. */
  onReady?: (vm: any) => void;
  onError?: (error: unknown) => void;
  className?: string;
}

/** Props after the Provider's values have been merged in: baseUrl is guaranteed. */
export type Resolved<T extends CommonProps> = T & { baseUrl: string };

export type Ctx = { root: HTMLElement; api: string; baseUrl: string; signal: AbortSignal; getJson: (url: string) => Promise<any>; query: Record<string, string> };

// The dotnetreport scripts read these globals, which the Razor views define
function setGlobals(query: Record<string, string>) {
  const w = window as any;
  w.queryParams = { ...query };
  w.toastr = w.toastr || { error: (msg: string) => window.alert(msg), success: (msg: string) => window.alert(msg) };
}

// The API's POST calls need an anti-forgery token, which the scripts read from this hidden input
async function loadAntiForgeryToken(api: string, fetchInit?: RequestInit) {
  try {
    const r = await fetch(api + '/DotNetReportApi/GetAntiForgeryToken', { credentials: 'include', ...fetchInit });
    if (!r.ok) return; // older APIs don't have this endpoint
    const { token } = await r.json();
    let input = document.querySelector('input[name="__RequestVerificationToken"]') as HTMLInputElement | null;
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = '__RequestVerificationToken';
      document.body.appendChild(input);
    }
    input.value = token || '';
  } catch { /* keep going without it */ }
}
/** Receives the mounted DOM and returns a cleanup function. */
export type Run = (ctx: Ctx) => Promise<{ vm: any; cleanup: () => void } | undefined>;

/** Hosts one Knockout app: renders the markup, loads the engine, runs `run`, and tears everything down on unmount. */
export function KoApp({ html, run, deps, props }: { html: string; run: Run; deps: unknown[]; props: Resolved<CommonProps> }) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;

  useEffect(() => {
    const root = host.current!;
    const ac = new AbortController();
    let cleanup: (() => void) | undefined;
    const { baseUrl, fetchInit } = latest.current;

    const getJson = async (url: string) => {
      const r = await fetch(url, { ...fetchInit, signal: ac.signal });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText} - ${url}`);
      return r.json();
    };

    const base = baseUrl.replace(/\/$/, '');
    const query = Object.fromEntries(new URLSearchParams(window.location.search).entries());
    setGlobals(query);

    loadEngine(latest.current)
      .then(() => {
        // the scripts' own calls go through jQuery, so cross-origin cookies need this too
        if (fetchInit?.credentials === 'include') window.$.ajaxSetup({ xhrFields: { withCredentials: true } });
        return loadAntiForgeryToken(base + '/api', fetchInit);
      })
      .then(() => ac.signal.aborted ? undefined : run({ root, api: base + '/api', baseUrl: base, signal: ac.signal, getJson, query }))
      .then((res) => {
        if (!res) return;
        if (ac.signal.aborted) return res.cleanup();
        cleanup = res.cleanup;
        latest.current.onReady?.(res.vm);
      })
      .catch((e) => { if (!ac.signal.aborted) latest.current.onError?.(e) ?? console.error(e); });

    return () => {
      ac.abort();
      cleanup?.();
      if (window.ko) window.ko.cleanNode(root);
      root.innerHTML = html; // reset DOM that Knockout mutated, so a re-run starts clean
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return <div ref={host} className={props.className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** jQuery Deferred -> Promise */
export const done = (d: any) => new Promise<void>((res, rej) => d.done(res).fail(rej));
