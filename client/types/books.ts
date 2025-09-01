export interface BookProps {
	id: number; //--REQUIRED -> will do on server side
	// user set
	score?: number;
	dateCompleted?: number;
	note?: string;
	status: 'Completed' | 'Want to Read' | 'Dropped'; //!--REQUIRED
	// from ol&&google -- used for checking duplicate
	key: string; //!--REQUIRED 
	// from ol||google
	title: string; //!--REQUIRED
	author?: string;
	coverUrl?: string;
	coverEditions?: string[]; 
	curCoverIndex?: number;
	datePublished?: number;
	// from wikidata
	seriesTitle?: string;
	placeInSeries?: string;
	prequel?: string;
	sequel?: string;
}

export interface AllBooks {
  OpenLibBooks: OpenLibData[];
  GoogleBooks: GoogleBooks[];
}

export interface OpenLibData {
	key: string; // call to wikidata || check dup
	// details
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	// covers
	edition_key?: string[]; 
}

export interface GoogleBooks {
	key: string; // check dup
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	coverUrl?: string;
}

export interface WikiData {
	wikiTitle?: string; // another title
	seriesTitle?: string;
	placeInSeries?: string;
	prequel?: string;
	sequel?: string;
}