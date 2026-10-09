import { KoApp, done, type CommonProps, type Run } from '../KoApp';
import { reportHtml,dateFormatPopover } from '../templates.generated';
import { ReportBuilderProps } from './props';
const $root = (root: HTMLElement) => root.querySelector('#dot-net-report') as HTMLElement;
const A = (api: string) => api + '/DotNetReportApi/';

export function ReportBuilder(props: ReportBuilderProps) {
  const { reportId = 0, linkedReport = false } = props;
  const run: Run = async ({ root, api, baseUrl, signal, getJson }) => {
    const { $, ko } = window;
    const a = A(api);
    const result = await getJson(a + 'GetUsersAndRoles');
    if (signal.aborted) return;
    const vm = new window.reportViewModel({
      runReportUrl: api + '/DotNetReport/Report',
      reportWizard: $('#modal-reportbuilder'),
      execReportUrl: a + 'RunReport',
      runLinkReportUrl: a + 'RunReportLink',
      getSchemaFromSql: a + 'GetSchemaFromSql',
      linkModal: $('#linkModal'),
      reportHeader: 'report-header',
      fieldOptionsModal: $('#fieldOptionsModal'),
      lookupListUrl: a + 'GetLookupList',
      apiUrl: a + 'CallReportApi',
      runReportApiUrl: a + 'RunReportApi',
      getUsersAndRolesUrl: a + 'GetUsersAndRoles',
      userSettings: result,
      dataFilters: result.dataFilters,
      runExportUrl: a,
      getTimeZonesUrl: a + 'GetAllTimezones',
      previewEmailListUrl: a + 'PreviewEmailList',
      printReportUrl: baseUrl + '/DotNetReport/ReportPrint',
      samePageOnRun: true,
      reportMode: linkedReport ? 'linked' : '',
      reportId: reportId || 0,
    });
    vm.printReport = () => {
      const w = window.open('');
      w?.document.open();
      w?.document.write('<html><head><link href="/Content/bootstrap.css" rel="stylesheet" /><style type="text/css">a[href]:after {content: none !important;}</style></head><body>' + $('.report-inner').html() + '</body></html>');
      setTimeout(() => { w?.print(); w?.close(); }, 250);
    };
    vm.dateFormatPopoverContent = dateFormatPopover;
    vm.init(0, result.noAccount);
    vm.textQuery.setupSearch();
    ko.applyBindings(vm, $root(root));
    const onResize = () => { if (vm.reportMode == 'execute') vm.DrawChart(); };
    $(window).on('resize', onResize);
    return { vm, cleanup: () => $(window).off('resize', onResize) };
  };
  return <KoApp html={reportHtml} run={run} deps={[props.baseUrl, reportId, linkedReport]} props={props} />;
}