// Loads the same scripts/styles that the Angular app listed in angular.json, in the same order.
// dotnetreport.js is a classic script that needs window.$, ko, _, GridStack, echarts, so it can't be bundled as an ES module.
const CDN = 'https://cdn.jsdelivr.net/npm/';

const css = (v: string) => [
  'bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'font-awesome@4.7.0/css/font-awesome.min.css',
  'bootstrap-datepicker@1.10.0/dist/css/bootstrap-datepicker.min.css',
  'select2@4.0.13/dist/css/select2.min.css',
  `dotnetreport@${v}/src/dotnetreport.css`,
  'gridstack@12.1.0/dist/gridstack.min.css',
  'tributejs@5.1.3/dist/tribute.css',
  'summernote@0.9.1/dist/summernote-bs5.min.css',
  'leaflet@1.9.4/dist/leaflet.css',
  'x-editable-bs4@1.5.6/dist/bootstrap4-editable/css/bootstrap-editable.css',
];

const js = (v: string) => [
  'jquery@3.7.1/dist/jquery.min.js',
  'bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'summernote@0.9.1/dist/summernote-bs5.min.js',
  'leaflet@1.9.4/dist/leaflet.js',
  'echarts@6.0.0/dist/echarts.min.js',
  'leaflet.heat@0.2.0/dist/leaflet-heat.js',
  'knockout@3.5.1/build/output/knockout-latest.js',
  'jquery-blockui@2.7.0/jquery.blockUI.js',
  'bootbox@6.0.4/dist/bootbox.min.js',
  'bootstrap-datepicker@1.10.0/dist/js/bootstrap-datepicker.min.js',
  'jquery-ui-dist@1.13.3/jquery-ui.min.js',
  'knockout-sortable@1.2.2/build/knockout-sortable.min.js',
  'select2@4.0.13/dist/js/select2.min.js',
  'lodash@4.17.21/lodash.min.js',
  'tributejs@5.1.3/dist/tribute.min.js',
  'knockout-mapping@2.6.0/dist/knockout.mapping.js',
  'x-editable-bs4@1.5.6/dist/bootstrap4-editable/js/bootstrap-editable.min.js',
  'knockout-x-editable@0.1.2/knockout.x-editable.min.js',
  `dotnetreport@${v}/src/dotnetreport.js`,
  `dotnetreport@${v}/src/dotnetreport-helper.js`,
  `dotnetreport@${v}/src/dotnetreport-setup.js`,
  'gridstack@12.1.0/dist/gridstack-all.js',
];

export interface EngineOptions {
  /** Base URL that serves the npm files. Default: jsDelivr. Use your own host/proxy for offline or CSP-restricted apps. */
  assetsBaseUrl?: string;
  /** Version of the `dotnetreport` npm package to load. */
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
export function loadEngine({ assetsBaseUrl = CDN, engineVersion = '6.3.4' }: EngineOptions = {}) {
  return (loading ??= (async () => {
    const base = assetsBaseUrl.replace(/\/?$/, '/');
    await Promise.all(css(engineVersion).map((u) => add('link', base + u)));
    for (const u of js(engineVersion)) await add('script', base + u); // order matters
  })().catch((e) => { loading = null; throw e; }));
}
