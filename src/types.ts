export interface ScheduleRaw {
  version: string;
  name: string;
  semver: string;
  date: string;
  start: string;
  end: string;
  codename?: string;
  lts: string;
  maintenance?: string;
}

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

export interface VersionRaw {
  version: string;
  name: string;
  semver: string;
  major: number;
  minor: number;
  patch: number;
  lts: string;
  date: Date;
  raw: ScheduleRaw;
  codename: string;
}

export interface Version {
  version: string;
  name: string;
  semver: string;
  major: number;
  minor: number;
  patch: number;
  lts: string;
  date: Date;
  raw: VersionRaw;
  codename: string;
}
