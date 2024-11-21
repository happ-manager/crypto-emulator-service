import { AccessChannelGuard } from "./access-channel.guard";
import { CreateChannelGuard } from "./create-channel.guard";

export const CHANNELS_GUARDS = [CreateChannelGuard, AccessChannelGuard];
