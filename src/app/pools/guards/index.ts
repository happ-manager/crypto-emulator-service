import { AccessPoolGuard } from "./access-pool.guard";
import { CreatePoolGuard } from "./create-pool.guard";

export const POOLS_GUARDS = [CreatePoolGuard, AccessPoolGuard];
