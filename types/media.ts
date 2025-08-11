type MediaStatus = 'Completed' | 'Want to Read' | 'Want to Watch';

interface BaseMediaInterface {
	id: number;
	name: string;
	maker: string;
	picture: string; // url
	yearCompleted: number | '';
	myStatus: MediaStatus;
	reviewSummery?: string;
	rating: number | '';
}

export interface Manga extends BaseMediaInterface {
	myStatus: 'Completed' | 'Want to Read';
}

export interface Books extends BaseMediaInterface {
	myStatus: 'Completed' | 'Want to Read';
}

export interface Movies extends BaseMediaInterface {
	myStatus: 'Completed' | 'Want to Watch';
}

export interface Shows extends Omit<BaseMediaInterface, 'maker'> {
	stars?: string[]; // -- not sure if i want
	myStatus: 'Completed' | 'Want to Watch';
}

export interface Games extends BaseMediaInterface {
	myStatus: 'Completed';
}