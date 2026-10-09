import { useEffect, useRef } from 'react';
import { loadEngine, type EngineOptions } from './engine';

declare global {
  interface Window { $: any; ko: any; _: any; GridStack: any; reportViewModel: any; dashboardViewModel: any; manageViewModel: any }
}

export interface CommonProps extends EngineOptions {
  /** Root URL of the backend that exposes /api/DotNetReportApi/* (same value as provideDotNetReport(baseUrl) in Angular). */
  baseUrl: string;
  /** Extra options for every fetch call (headers, credentials ...). */
  fetchInit?: RequestInit;
  /** Called with the Knockout view model once bindings are applied. */
  onReady?: (vm: any) => void;
  onError?: (error: unknown) => void;
  className?: string;
}

export type Ctx = { root: HTMLElement; api: string; baseUrl: string; signal: AbortSignal; getJson: (url: string) => Promise<any> };
/** Receives the mounted DOM and returns a cleanup function. */
export type Run = (ctx: Ctx) => Promise<{ vm: any; cleanup: () => void } | undefined>;

/** Hosts one Knockout app: renders the markup, loads the engine, runs `run`, and tears everything down on unmount. */
export function KoApp({ html, run, deps, props }: { html: string; run: Run; deps: unknown[]; props: CommonProps }) {
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

    loadEngine(latest.current)
      .then(() => run({ root, api: baseUrl.replace(/\/$/, '') + '/api', baseUrl: baseUrl.replace(/\/$/, ''), signal: ac.signal, getJson }))
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
