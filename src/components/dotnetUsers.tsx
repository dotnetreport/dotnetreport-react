import { useResolved } from '../context';
import { KoApp, type Run } from '../KoApp';
import { usersHtml } from '../templates';
import type { ReportUsersProps } from './props';

const A = (api: string) => api + '/DotNetReportApi/';

/** The Users & Access page: users, roles and tenants, and the permissions given to them. */
export function ReportUsers(rawProps: ReportUsersProps) {
  const props = useResolved(rawProps);
  const run: Run = async ({ root, api, signal, getJson }) => {
    const { ko } = window;
    const a = A(api);
    let data = await getJson(a + 'GetUsersAndRoles');
    if (signal.aborted) return;
    if (data && data.d) data = data.d;
    const vm = new window.usersAccessViewModel({
      userSettings: data,
      apiUrl: a + 'CallPostReportApi',
      getPreviewFromSqlUrl: a + 'GetPreviewFromSql',
    });
    ko.applyBindings(vm, root.querySelector('#users-access'));
    vm.init();
    return { vm, cleanup: () => {} };
  };
  return <KoApp html={usersHtml} run={run} deps={[props.baseUrl]} props={props} />;
}
