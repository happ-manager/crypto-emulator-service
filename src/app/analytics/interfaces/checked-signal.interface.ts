import type { IChecked, IMilestone, ISignal } from "@happ-manager/crypto-api";

export interface ICheckedSignal extends ISignal {
	checkedMilestones: IChecked<IMilestone>[];
}
