import Module from 'module';

const _require = typeof require === 'undefined' ? Module.createRequire(import.meta.url) : require;
const constants = _require('../../assets/constants.cjs');

export const CACHE_PATH = constants.CACHE_PATH as string;
export const DISTS_URL = constants.DISTS_URL as string;
export const SCHEDULES_URL = constants.SCHEDULES_URL as string;
