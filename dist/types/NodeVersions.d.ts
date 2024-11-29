export default class NodeVersions {
    static load(options: any, callback: any): Promise<any>;
    static loadSync(options: any): NodeVersions;
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
