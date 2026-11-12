import { useResolved } from '../context';
import { KoApp, type Run } from '../KoApp';
import { setupHtml, dateFormatPopover } from '../templates';
import type { ReportSetupProps } from './props';

const $root = (root: HTMLElement) => root.querySelector('#dot-net-report') as HTMLElement;
const A = (api: string) => api + '/DotNetReportApi/';

export function ReportSetup(rawProps: ReportSetupProps) {
  const props = useResolved(rawProps);
  const { databaseApiKey, onlyApi } = props;
  const run: Run = async ({ root, api, signal, getJson, query }) => {
    const { $, ko } = window;
    const a = A(api);
    const apiKey = databaseApiKey ?? query.databaseApiKey ?? '';
    const apiOnly = onlyApi ?? query.onlyApi !== 'false';
    const loadSchemaUrl = a + 'LoadSetupSchema';
    if ($.fn.editable) $.fn.editable.defaults.mode = 'inline';
    const model = await getJson(`${loadSchemaUrl}?databaseApiKey=${encodeURIComponent(apiKey)}&onlyApi=${apiOnly}`);
    if (signal.aborted) return;
    const r = '/ReportApi/';
    const vm = new window.manageViewModel({
      model,
      saveTableUrl: r + 'SaveTableData',
      deleteTableUrl: r + 'DeleteTable',
      getRelationsUrl: r + 'GetRelations',
      getDataConnectionsUrl: r + 'GetDataConnections',
      updateDataConnectionUrl: r + 'UpdateDataConnection',
      saveRelationsUrl: r + 'SaveRelationsData',
      addDataConnectionUrl: r + 'AddDataConnection',
      saveProcUrl: r + 'SaveProcedureData',
      deleteProcUrl: r + 'DeleteProcedure',
      saveCustomFuncUrl: r + 'SaveCustomFunctionData',
      deleteCustomFuncUrl: r + 'DeleteCustomFunction',
      getSchedulesUrl: r + 'GetScheduledReportsAndDashboards',
      deleteScheduleUrl: r + 'DeleteSchedule',
      saveCategoriesUrl: r + 'SaveCategoriesData',
      getCategoriesUrl: r + 'GetCategories',
      getEmailQueriesUrl: r + 'GetDataDrivenQueries',
      saveEmailQueryUrl: r + 'SaveDataDrivenQuery',
      deleteEmailQueryUrl: r + 'DeleteDataDrivenQuery',
      previewEmailListUrl: a + 'PreviewEmailList',
      getAppSettingUrl: r + 'GetAccountSettings',
      saveAppSettingUrl: r + 'ChangeAccountSettings',
      updateDbConnectionUrl: a + 'UpdateDbConnection',
      sendTestEmailUrl: a + 'SendTestEmail',
      getEmailSettingsUrl: a + 'GetEmailSettings',
      saveEmailSettingsUrl: a + 'SaveEmailSettings',
      switchWorkspaceUrl: a + 'SwitchWorkspace',
      reportsApiUrl: a + 'CallReportApi',
      runReportApiUrl: a + 'RunReportApi',
      getUsersAndRoles: a + 'GetUsersAndRoles',
      sendPasswordSetupUrl: a + 'SendUserPasswordSetup',
      searchProcUrl: a + 'SearchProcedure',
      getDatabaseRelationsUrl: a + 'GetDatabaseRelations',
      getTimeZonesUrl: a + 'GetAllTimezones',
      getSchemaFromSql: a + 'GetSchemaFromSql',
      apiUrl: a + 'CallPostReportApi',
      getPreviewFromSqlUrl: a + 'GetPreviewFromSql',
      onlyApi: apiOnly,
      loadSchemaUrl,
      buildDynamicFunctionsUrl: a + 'BuildDynamicFunctions',
      currentUserId: model.CurrentUserId,
    });
    vm.dateFormatPopoverContent = dateFormatPopover;
    vm.LoadJoins();
    vm.setupManageAccess();
    vm.LoadSchedules();
    vm.LoadCategories();
    ko.applyBindings(vm, $root(root));
    vm.LoadDataConnections();
    vm.customSql.textQuery.setupQuery();
    return { vm, cleanup: () => {} };
  };
  return <KoApp html={setupHtml} run={run} deps={[props.baseUrl, databaseApiKey, onlyApi]} props={props} />;
}
