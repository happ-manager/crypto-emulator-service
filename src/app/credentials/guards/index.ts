import { AccessCredentialGuard } from "./access-credential.guard";
import { CreateCredentialGuard } from "./create-credential.guard";

export const CREDENTIALS_GUARDS = [CreateCredentialGuard, AccessCredentialGuard];
