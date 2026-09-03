export interface LoadOptions {
  cachePath?: string;
  now?: Date;
}

export interface LoadError extends Error {
  code?: number;
}

export interface ResolveOptions {
  now?: Date;
  range?: string;
  path?: string;
}

// The wire shapes, as nodejs.org/dist/index.json and nodejs/Release/schedule.json send them.
// Distinct from the normalized Version/Schedule this package exposes.
export interface VersionRaw {
  version: string;
  date: string;
  lts: string | false;
}

export interface ScheduleRaw {
  start: string;
  end: string;
  lts?: string;
  maintenance?: string;
  codename?: string;
}

export type ScheduleRawMap = { [name: string]: ScheduleRaw };

export interface Schedule {
  name: string;
  semver: string;
  raw: ScheduleRaw;
  start: Date;
  end: Date;
  codename?: string;
  lts?: Date;
  maintenance?: Date;
}

export interface Version {
  version: string;
  name: string;
  semver: string;
  major: number;
  minor: number;
  patch: number;
  lts: string | false;
  date: Date;
  raw: VersionRaw;
  codename: string;
}

export interface ParsedVersion {
  major: number;
  minor?: number;
  patch?: number;
}

export interface ParsedCodename {
  codename: string;
}

export interface ParsedName {
  name: string;
}

export type ParsedExpression = ParsedVersion | ParsedCodename | ParsedName;
