import { AccessTokenGuard } from "./access-token.guard";
import { CreateTokenGuard } from "./create-token.guard";

export const TOKENS_GUARDS = [CreateTokenGuard, AccessTokenGuard];
