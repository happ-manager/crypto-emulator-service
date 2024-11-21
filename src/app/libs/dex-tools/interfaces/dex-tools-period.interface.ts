import type { DEX_TOOLS_PERIODS } from "../constant/dex-tools-periods.constant";

export type IDexToolsPeriod = (typeof DEX_TOOLS_PERIODS)[keyof typeof DEX_TOOLS_PERIODS];
