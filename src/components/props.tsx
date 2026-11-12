import { type CommonProps } from '../KoApp';

// Each prop falls back to the page's query string (?id=, ?reportId= ...) like the main app's views

/* --------------------------------- Dashboard --------------------------------- */
export interface ReportDashboardProps extends CommonProps {
  /** Dashboard to open (?id=). Defaults to the first dashboard. */
  dashboardId?: number;
  /** Show admin mode dashboards. Defaults to localStorage 'reportAdminMode'. */
  adminMode?: boolean;
}

/* ----------------------------------- Setup ----------------------------------- */
export interface ReportSetupProps extends CommonProps {
  /** ?databaseApiKey= */
  databaseApiKey?: string;
  /** ?onlyApi=. Defaults to true, like the main app's setup page. */
  onlyApi?: boolean;
}

/* ------------------------------- Report builder ------------------------------- */
export interface ReportBuilderProps extends CommonProps {
  /** Open this report directly (?reportId=). */
  reportId?: number | string;
  /** Open in linked-report mode (?linkedreport=true). */
  linkedReport?: boolean;
  /** Open this folder (?folderid=). */
  folderId?: number | string;
}

/* ------------------------------- Users & Access ------------------------------- */
export interface ReportUsersProps extends CommonProps {}
