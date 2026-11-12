// The markup comes from templates.generated.ts, which "npm run sync-templates" builds from the main
// app's Razor views, so it is never copied by hand.
import { REPORT_TEMPLATES, REPORT_PAGE, DASHBOARD_PAGE, SETUP_PAGE, USERS_PAGE } from '../templates.generated';
import dateFormatPopover from './date-format-popover';

const screen = (page: string) => `<div id="dot-net-report" class="body-content">${page}\n${REPORT_TEMPLATES}</div>`;

export const reportHtml = screen(REPORT_PAGE);
export const dashboardHtml = screen(DASHBOARD_PAGE);
export const setupHtml = screen(SETUP_PAGE);
export const usersHtml = USERS_PAGE;
export { dateFormatPopover };
