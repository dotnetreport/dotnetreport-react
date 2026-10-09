import { KoApp, done, type Run } from '../KoApp';

import { setupHtml, dateFormatPopover } from '../templates.generated';
import { ReportSetupProps } from './props';

const $root = (root: HTMLElement) => root.querySelector('#dot-net-report') as HTMLElement;
const A = (api: string) => api + '/DotNetReportApi/';




export function ReportSetup(props: ReportSetupProps) {
  const { databaseApiKey = '', onlyApi = false } = props;
  const run: Run = async ({ root, api, signal, getJson }) => {
    const { ko } = window;
    const a = A(api);
    const loadSchemaUrl = a + 'LoadSetupSchema';
    const model = await getJson(`${loadSchemaUrl}?databaseApiKey=${encodeURIComponent(databaseApiKey)}&onlyApi=${onlyApi}`);
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
      getEmailQueriesUrl: r + 'GetDataDrivenQueries',
      saveEmailQueryUrl: r + 'SaveDataDrivenQuery', 
      deleteEmailQueryUrl: r + 'DeleteDataDrivenQuery',
      previewEmailListUrl: a + 'PreviewEmailList', 
      getCategoriesUrl: r + 'GetCategories',
      getAppSettingUrl: r + 'GetAccountSettings', 
      saveAppSettingUrl: r + 'ChangeAccountSettings',
      reportsApiUrl: a + 'CallReportApi', 
      runReportApiUrl: a + 'RunReportApi', 
      getUsersAndRoles: a + 'GetUsersAndRoles',
      sendPasswordSetupUrl: a + 'SendUserPasswordSetup', 
      searchProcUrl: a + 'SearchProcedure',
      getTimeZonesUrl: a + 'GetAllTimezones', 
      getSchemaFromSql: a + 'GetSchemaFromSql', 
      apiUrl: a + 'CallPostReportApi',
      getPreviewFromSqlUrl: a + 'GetPreviewFromSql', 
      onlyApi, loadSchemaUrl,
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
