export interface BookProps {
	id: number; //--REQUIRED
	// user set
	score?: number;
	dateCompleted?: number;
	note?: string;
	status: 'Completed' | 'Want to Read'; //--REQUIRED
	// from ol
	olKey: string; //--REQUIRED
	title: string; //--REQUIRED
	author?: string;
	coverEditions?: string[]; //might not need later?
	curCoverIndex?: number;
	datePublished?: number;
	genre?: string[]; //!NOT USING
	// from wikidata
	seriesTitle?: string;
	placeInSeries?: string;
	prequel?: string;
	sequel?: string;
}

export interface OpenLibData {
	key: string; // OPID to call to wikidata
	// details
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	subject?: string[]; //!NOT USING
	// covers
	edition_key?: string[]; 
}

export interface WikiData {
	wikiTitle?: string; //another title
	seriesTitle?: string;
	placeInSeries?: string;
	prequel?: string;
	sequel?: string;
}