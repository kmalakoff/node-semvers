export = NodeVersions;
declare function NodeVersions(versions: any, schedule: any): void;
declare class NodeVersions {
    constructor(versions: any, schedule: any);
    schedules: {
        name: any;
        semver: any;
        raw: any;
    }[];
    versions: {
        version: any;
        name: string;
        semver: string;
        major: number;
        minor: number;
        patch: number;
        lts: any;
        date: Date;
        raw: any;
    }[];
    resolve(expression: any, options: any): any;
}
declare namespace NodeVersions {
    function load(options: any, callback: any): Promise<any>;
    function loadSync(options: any): NodeVersions;
}
