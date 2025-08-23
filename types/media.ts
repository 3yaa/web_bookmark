export type MediaStatus = 'Completed' | 'Want to Read' | 'Want to Watch';

interface BaseMediaInterface {
	id: number;
	name: string;
	score: number;
	coverUrl: string;
	status: MediaStatus;
	dateCompleted: number;
	dateReleased: number;
	note?: string;
}
export interface Manga extends BaseMediaInterface {
	status: 'Completed' | 'Want to Read';
}

export interface Books extends BaseMediaInterface {
	author: string;
	status: 'Completed' | 'Want to Read';
	genre?: string[];
	prequel?: string;
	sequel?: string;
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