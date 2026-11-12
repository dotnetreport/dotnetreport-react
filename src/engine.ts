// Loads the same scripts and styles as the main app's layout, in the same order.
// dotnetreport.js is a classic script that needs window.$, ko, _, GridStack, echarts, so it can't be bundled as an ES module.
declare const __ENGINE_VERSION__: string; // this package's version, from package.json
declare const __LIB_VERSIONS__: Record<string, string>; // the main app's package.json dependencies

const CDN = 'https://cdn.jsdelivr.net/npm/';

const lib = (name: string, file: string) => `${name}@${__LIB_VERSIONS__[name]}/${file}`;

const css = (v: string) => [
  lib('bootstrap', 'dist/css/bootstrap.min.css'),
  // Font Awesome 7 with the v4 shims, like the main app, so fa fa-* names keep working
  lib('@fortawesome/fontawesome-free', 'css/all.min.css'),
  lib('@fortawesome/fontawesome-free', 'css/v4-shims.min.css'),
  lib('@fortawesome/fontawesome-free', 'css/v4-font-face.min.css'),
  lib('bootstrap-datepicker', 'dist/css/bootstrap-datepicker.min.css'),
  lib('select2', 'dist/css/select2.min.css'),
  `dotnetreport@${v}/src/dotnetreport.css`,
  lib('gridstack', 'dist/gridstack.min.css'),
  lib('tributejs', 'dist/tribute.css'),
  lib('summernote', 'dist/summernote-bs5.min.css'),
  lib('leaflet', 'dist/leaflet.css'),
  lib('x-editable-bs4', 'dist/bootstrap4-editable/css/bootstrap-editable.css'),
];

const js = (v: string) => [
  lib('jquery', 'dist/jquery.min.js'),
  lib('bootstrap', 'dist/js/bootstrap.bundle.min.js'),
  lib('summernote', 'dist/summernote-bs5.min.js'),
  lib('leaflet', 'dist/leaflet.js'),
  lib('echarts', 'dist/echarts.min.js'),
  lib('leaflet.heat', 'dist/leaflet-heat.js'),
  lib('knockout', 'build/output/knockout-latest.js'),
  lib('jquery-blockui', 'jquery.blockUI.js'),
  lib('bootbox', 'dist/bootbox.min.js'),
  lib('bootstrap-datepicker', 'dist/js/bootstrap-datepicker.min.js'),
  lib('jquery-ui-dist', 'jquery-ui.min.js'),
  lib('knockout-sortable', 'build/knockout-sortable.min.js'),
  lib('select2', 'dist/js/select2.min.js'),
  lib('lodash', 'lodash.min.js'),
  lib('tributejs', 'dist/tribute.min.js'),
  lib('knockout-mapping', 'dist/knockout.mapping.js'),
  lib('x-editable-bs4', 'dist/bootstrap4-editable/js/bootstrap-editable.min.js'),
  lib('knockout-x-editable', 'knockout.x-editable.min.js'),
  `dotnetreport@${v}/src/dotnetreport.js`,
  `dotnetreport@${v}/src/dotnetreport-helper.js`,
  `dotnetreport@${v}/src/dotnetreport-setup.js`,
  `dotnetreport@${v}/src/dotnetreport-users.js`,
  lib('gridstack', 'dist/gridstack-all.js'),
];

export interface EngineOptions {
  /** Base URL that serves the npm files. Default: jsDelivr. Use your own host/proxy for offline or CSP-restricted apps. */
  assetsBaseUrl?: string;
  /** Version of the `dotnetreport` npm package to load. Default: this package's own version (package.json). */
  engineVersion?: string;
}

const add = (tag: 'link' | 'script', url: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(`${tag}[data-dnr="${url}"]`)) return resolve();
    const el: any = document.createElement(tag);
    el.dataset.dnr = url;
    if (tag === 'link') { el.rel = 'stylesheet'; el.href = url; } else { el.src = url; el.async = false; }
    el.onload = () => resolve();
    el.onerror = () => { el.remove(); reject(new Error(`dotnetreport-react: failed to load ${url}`)); };
    document.head.appendChild(el);
  });

let loading: Promise<void> | null = null;

/** Loads the engine once per page; later calls reuse the same promise. */
export function loadEngine({ assetsBaseUrl = CDN, engineVersion = __ENGINE_VERSION__ }: EngineOptions = {}) {
  return (loading ??= (async () => {
    const base = assetsBaseUrl.replace(/\/?$/, '/');
    await Promise.all(css(engineVersion).map((u) => add('link', base + u)));
    for (const u of js(engineVersion)) await add('script', base + u); // order matters
  })().catch((e) => { loading = null; throw e; }));
}
