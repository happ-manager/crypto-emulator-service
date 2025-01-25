export interface IGenerateSettingsProps {
	startHour?: number;
	endHour?: number;
	buyPercentStep?: number;
	sellHighStep?: number;
	sellLowStep?: number;
	minTimeStep?: number;
	maxTimeStep?: number;
	buyPercentStart?: number;
	buyPercentEnd?: number;
	sellHighStart?: number;
	sellHighEnd?: number;
	sellLowStart?: number;
	sellLowEnd?: number;
	minTimeStart?: number;
	minTimeEnd?: number;
	maxTimeStart?: number;
	maxTimeEnd?: number;
	signalsSkip?: number;
	signalsTake?: number;
}
