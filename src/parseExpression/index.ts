// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
import isNaN from '../lib/isNaN.js';
import isLTSFn from './isLTSFn.js';
import isLatestFn from './isLatestFn.js';
import schedulesLatest from './schedulesLatest.js';

export default function parseExpression(expression, now) {
  if (expression[0] === 'v' && !isNaN(+expression.substr(1, 1))) expression = expression.substr(1);
  if (expression.substr(0, 4) === 'lts/') expression = expression.substr(4) === '*' ? 'lts' : expression.substr(4);
  if (expression === 'stable') expression = 'lts';

  if (typeof expression === 'number') return { major: expression };
  if (~expression.indexOf('.')) {
    const parts = expression.split('.');
    if (parts.length === 1) return isNaN(+parts[0]) ? null : { major: +parts[0] };
    if (parts.length === 2) return isNaN(+parts[0]) && isNaN(+parts[1]) ? null : { major: +parts[0], minor: +parts[1] };
    return isNaN(+parts[0]) && isNaN(+parts[1]) && isNaN(+parts[2]) ? null : { major: +parts[0], minor: +parts[1], patch: +parts[2] };
  }
  if (!isNaN(+expression)) return { major: +expression };
  if (expression === 'lts') {
    const lts = schedulesLatest(this.schedules, isLTSFn(now));
    return lts ? { name: lts.name } : null;
  }
  if (expression === 'latest') {
    const latest = schedulesLatest(this.schedules, isLatestFn(now));
    return latest ? { name: latest.name } : null;
  }
  return { codename: expression.toLowerCase() };
}