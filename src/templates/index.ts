import common from './common.html';
import reportShell from './report.html';
import dashboardShell from './dashboard.html';
import setupShell from './setup.html';
import dateFormatPopover from './date-format-popover.html';

const PLACEHOLDER = '<!--COMMON_TEMPLATES-->';

/** Puts the shared Knockout templates (common.html) where the screen's html has the placeholder. */
const withCommon = (shell: string) => {
  if (!shell.includes(PLACEHOLDER)) throw new Error(`dotnetreport-react: ${PLACEHOLDER} missing in a template file`);
  return shell.replace(PLACEHOLDER, () => common);
};

export const reportHtml = withCommon(reportShell);
export const dashboardHtml = withCommon(dashboardShell);
export const setupHtml = withCommon(setupShell);
export { dateFormatPopover };
