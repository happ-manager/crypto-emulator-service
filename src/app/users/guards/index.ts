import { AccessUserGuard } from "./access-user.guard";
import { CreateUserGuard } from "./create-user.guard";

export const USERS_GUARDS = [CreateUserGuard, AccessUserGuard];
