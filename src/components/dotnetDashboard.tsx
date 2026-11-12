import { useResolved } from '../context';
import { KoApp, done, type Run } from '../KoApp';
import { dashboardHtml, dateFormatPopover } from '../templates';
import type { ReportDashboardProps } from './props';

const $root = (root: HTMLElement) => root.querySelector('#dot-net-report') as HTMLElement;
const A = (api: string) => api + '/DotNetReportApi/';

export function ReportDashboard(rawProps: ReportDashboardProps) {
  const props = useResolved(rawProps);
  const { dashboardId: idProp, adminMode } = props;
  const run: Run = async ({ root, api, baseUrl, signal, getJson, query }) => {
    const { $, ko, GridStack } = window;
    const a = A(api);
    const admin = adminMode ?? (localStorage.getItem('reportAdminMode') || 'false');
    const list = await getJson(a + 'GetDashboards?adminMode=' + admin);
    if (signal.aborted) return;
    if (list && list.noAccount === true) {
      $('#noaccountModal').modal('show');
      return;
    }
    const dashboards = (list || []).map((d: any) => ({
      id: d.Id, name: d.Name, description: d.Description, selectedReports: d.SelectedReports, schedule: d.Schedule,
      userId: d.UserId, userRoles: d.UserRoles, viewOnlyUserId: d.ViewOnlyUserId, viewOnlyUserRoles: d.ViewOnlyUserRoles,
      clientId: d.ClientId, canManage: d.CanManage, displayOrder: d.DisplayOrder,
    }));
    const dashboardId = idProp || parseInt(query.id || '0') || dashboards[0]?.id || 0;
    const result = await getJson(a + 'GetUsersAndRoles');
    if (signal.aborted) return;
    const vm = new window.dashboardViewModel({
      runReportUrl: api + '/DotNetReport/Report',
      execReportUrl: a + 'RunReport',
      runLinkReportUrl: a + 'RunReportLink',
      lookupListUrl: a + 'GetLookupList',
      apiUrl: a + 'CallReportApi',
      runReportApiUrl: a + 'RunReportApi',
      getSchemaFromSql: a + 'GetSchemaFromSql',
      reportMode: 'execute',
      reportWizard: $('#modal-reportbuilder'),
      linkModal: $('#linkModal'),
      fieldOptionsModal: $('#fieldOptionsModal'),
      dashboards,
      userSettings: result,
      users: result.users,
      userRoles: result.userRoles,
      allowAdmin: result.allowAdminMode,
      dataFilters: result.dataFilters,
      dashboardId,
      runExportUrl: a,
      printReportUrl: baseUrl + '/DotNetReport/ReportPrint',
      loadSavedDashbordUrl: a + 'LoadSavedDashboard',
      getDashbordsUrl: a + 'GetDashboards',
      getTimeZonesUrl: a + 'GetAllTimezones',
      previewEmailListUrl: a + 'PreviewEmailList',
      getUsersAndRolesUrl: a + 'GetUsersAndRoles',
      samePageOnRun: true,
    });
    vm.dateFormatPopoverContent = dateFormatPopover;
    await done(vm.init());
    await done(vm.loadDashboard(dashboardId));
    if (signal.aborted) return;
    ko.applyBindings(vm, $root(root));

    // Same grid setup as the Dashboard view; the live preview grid sets up its own
    const el = $(root).find('.grid-stack:not(.dash-preview-grid)').show()[0];
    const grid = GridStack.init({ cellHeight: 60, margin: 10, resizable: { handles: 'se, sw, ne, nw, n, e, s, w' }, oneColumnSize: 768 }, el);
    grid.on('change', (_e: unknown, items: any[]) => {
      if (!vm.arrangeDashboard() || !items) return;
      items.forEach((x: any) => { x.type = x.el.getAttribute('data-type'); vm.updatePosition(x); });
    });
    grid.on('resizestop', (_e: unknown, item: any) => {
      if (item && item.querySelector && item.querySelector('.report-chart')) vm.drawChart();
    });
    const t = setTimeout(() => { vm.drawChart(); grid.enableMove(false); grid.enableResize(false); vm.gridResponsive(); }, 1000);
    const onResize = () => { vm.gridResponsive(); vm.drawChart(); };
    $(window).on('resize', onResize);
    return { vm, cleanup: () => { clearTimeout(t); $(window).off('resize', onResize); try { grid.destroy(false); } catch { /* already gone */ } } };
  };
  return <KoApp html={dashboardHtml} run={run} deps={[props.baseUrl, idProp, adminMode]} props={props} />;
}
