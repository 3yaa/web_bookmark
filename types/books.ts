export interface BookProps {
	id: number; //--REQUIRED
	// user set
	score?: number;
	dateCompleted?: number;
	note?: string;
	status: 'Completed' | 'Want to Read' | 'Dropped'; //--REQUIRED
	//
	originalTitle: string; //-REQUIRED || USED ONLY FOR CHECK 
	// from ol
	title: string; //--REQUIRED
	author?: string;
	coverUrl?: string;
	coverEditions?: string[]; //might not need later?
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
	key: string; // OPID to call to wikidata
	// details
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	// covers
	edition_key?: string[]; 
}

export interface GoogleBooks {
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	coverUrl?: string;
}

export interface WikiData {
	wikiTitle?: string; //another title
	seriesTitle?: string;
	placeInSeries?: string;
	prequel?: string;
	sequel?: string;
}