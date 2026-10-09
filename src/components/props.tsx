import {type CommonProps } from '../KoApp';

/* --------------------------------- Dashboard --------------------------------- */
export interface ReportDashboardProps extends CommonProps {
  /** Dashboard to open (Angular: ?id=). Defaults to the first dashboard. */
  dashboardId?: number;
  /** Show admin mode dashboards. Defaults to localStorage 'reportAdminMode' like the Angular version. */
  adminMode?: boolean;
}

/* ----------------------------------- Setup ----------------------------------- */
export interface ReportSetupProps extends CommonProps {
  databaseApiKey?: string;
  onlyApi?: boolean;
}

/* ------------------------------- Report builder ------------------------------- */
export interface ReportBuilderProps extends CommonProps {
  /** Open this report directly (Angular: ?reportId=). */
  reportId?: number | string;
  /** Open in linked-report mode (Angular: ?linkedreport=true). */
  linkedReport?: boolean;
}