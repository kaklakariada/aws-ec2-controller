
interface DnsEntryJson {
    domain: string;
    ip: string;
    ttl: number;
}

export interface InstanceJson {
    id: string;
    launchTime: number; // Unix timestamp seconds
    name: string;
    publicIpAddress: string | undefined;
    state: string;
    controlAllowed: boolean;
    dnsEntry: DnsEntryJson;
}

export class Instance {
    json: InstanceJson;
    constructor(json: InstanceJson) { this.json = json; }
    get id(): string { return this.json.id; }
    get name(): string { return this.json.name; }
    get publicIpAddress(): string | undefined { return this.json.publicIpAddress; }
    get state(): string { return this.json.state; }
    get running(): boolean { return this.state === "running"; }
    get stopped(): boolean { return this.state === "stopped"; }
    get dnsDomain(): string | undefined { return this.json.dnsEntry ? this.json.dnsEntry.domain : undefined; }
    get dnsIpAddress(): string | undefined { return this.json.dnsEntry ? this.json.dnsEntry.ip : undefined; }
    get dnsTtl(): number | undefined { return this.json.dnsEntry ? this.json.dnsEntry.ttl : undefined; }
    get launchTime(): Date | undefined {
        return this.json.launchTime ? new Date(this.json.launchTime * 1000) : undefined;
    }
    get uptimeSeconds(): number | undefined {
        if (!this.json.launchTime) {
            return undefined;
        }
        const currentTimestamp = Math.round(new Date().getTime() / 1000);
        return currentTimestamp - this.json.launchTime;
    }
    get controlAllowed(): boolean { return this.json.controlAllowed; }
}
