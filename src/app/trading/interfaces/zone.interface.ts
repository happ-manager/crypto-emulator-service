export interface IZone {
	min: number;
	max: number;
	trashMin?: number;
}

export type IZoneMap = Record<string, IZone>;
