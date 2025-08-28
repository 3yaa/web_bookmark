export type MediaStatus = 'Completed' | 'Want to Read' | 'Want to Watch' | "Dropped";

export interface BaseMediaInterface {
	id: number;
	// 
	title: string;
	coverUrl: string;
	dateReleased: number;
	// 
	score: number;
	status: MediaStatus;
	dateCompleted: number;
	note?: string;
}
export interface Manga extends BaseMediaInterface {
	status: 'Completed' | 'Want to Read';
}

export interface Movies extends BaseMediaInterface {
	status: 'Completed' | 'Want to Watch';
}

export interface Shows extends Omit<BaseMediaInterface, 'maker'> {
	stars?: string[]; // -- not sure if i want
	status: 'Completed' | 'Want to Watch';
}

export interface Games extends BaseMediaInterface {
	status: 'Completed';
}