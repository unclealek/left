// False until this device's preference has been loaded. Also guards SDK queues
// when a previous installation persisted its own opt-in value.
let allowed = false;
export function analyticsAllowed() { return allowed; }
export function setAnalyticsAllowed(value: boolean) { allowed = value; }
