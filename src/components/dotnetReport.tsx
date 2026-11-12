import { useResolved } from '../context';
import { KoApp, type Run } from '../KoApp';
import { reportHtml, dateFormatPopover } from '../templates';
import type { ReportBuilderProps } from './props';

const $root = (root: HTMLElement) => root.querySelector('#dot-net-report') as HTMLElement;
const A = (api: string) => api + '/DotNetReportApi/';

export function ReportBuilder(rawProps: ReportBuilderProps) {
  const props = useResolved(rawProps);
  const { reportId, linkedReport, folderId } = props;
  const run: Run = async ({ root, api, baseUrl, signal, getJson, query }) => {
    const { $, ko } = window;
    const a = A(api);
    const id = reportId || query.reportId || 0;
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
      reportId: id,
      userSettings: result,
      dataFilters: result.dataFilters,
      runExportUrl: a,
      getTimeZonesUrl: a + 'GetAllTimezones',
      previewEmailListUrl: a + 'PreviewEmailList',
      printReportUrl: baseUrl + '/DotNetReport/ReportPrint',
      samePageOnRun: true,
      reportMode: (linkedReport ?? query.linkedreport === 'true') ? 'linked' : '',
    });
    vm.dateFormatPopoverContent = dateFormatPopover;
    vm.init(folderId || query.folderid || 0, result.noAccount, id);
    ko.applyBindings(vm, $root(root));
    vm.textQuery.setupSearch();
    const onResize = () => vm.DrawChart();
    $(window).on('resize', onResize);
    return { vm, cleanup: () => $(window).off('resize', onResize) };
  };
  return <KoApp html={reportHtml} run={run} deps={[props.baseUrl, reportId, linkedReport, folderId]} props={props} />;
}
