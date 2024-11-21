import { AccessSignalGuard } from "./access-signal.guard";
import { CreateSignalGuard } from "./create-signal.guard";

export const SIGNALS_GUARDS = [CreateSignalGuard, AccessSignalGuard];
