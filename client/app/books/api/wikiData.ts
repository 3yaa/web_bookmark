import { WikiData } from "@/types/books";

interface SPARQLResponse {
  results: {
    bindings: Array<{
      [key: string]: {
        type: string;
        value: string;
      }
    }>;
  };
}

export async function getSeriesInfo(olid: string): Promise<WikiData[] | null> {	
const query = `
    SELECT ?workLabel ?seriesLabel ?ordinal ?followsLabel ?followedByLabel WHERE {
      ?work wdt:P648 "${olid}"
      
      OPTIONAL {
        ?work p:P179 ?seriesStatement.
        ?seriesStatement ps:P179 ?series.
        OPTIONAL { ?seriesStatement pq:P1545 ?ordinal. }
        OPTIONAL { ?seriesStatement pq:P155 ?follows. }
        OPTIONAL { ?seriesStatement pq:P156 ?followedBy. }
      }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en, mul". }
    }`;
  const endpoint = 'https://query.wikidata.org/sparql';
  const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
  
  try {
    const response = await fetch(url);
    //
    if (!response.ok) {
      throw new Error(`"HTTP Error! status: ${response.status}`);
    }
    const data: SPARQLResponse = await response.json();
    if (data.results.bindings.length === 0) {
      return null;
    }

    return (
      data.results.bindings.map((binding)=>{
        return {
          wikiTitle: binding.workLabel?.value,
          seriesTitle: binding.seriesLabel?.value,
          placeInSeries: binding.ordinal?.value,
          prequel: binding.followsLabel?.value,
          sequel: binding.followedByLabel?.value
        }
      })
    );
  } catch (e) {
    console.error('Error executing SPARQL query:', e);
    throw e;
  }
}

//https://www.wikidata.org/wiki/Special:EntityData/Q2062781.json
/* with qid
SELECT ?work ?workLabel ?series ?seriesLabel ?ordinal ?follows ?followsLabel ?followedBy ?followedByLabel WHERE {
  ?work wdt:P648 "OL19880443W".   # Open Library ID
  
  OPTIONAL {
    ?work p:P179 ?seriesStatement.     # "part of the series"
    ?seriesStatement ps:P179 ?series.
    OPTIONAL { ?seriesStatement pq:P1545 ?ordinal. }   # series ordinal (qualifier)
    OPTIONAL { ?seriesStatement pq:P155 ?follows. }    # follows (qualifier)
    OPTIONAL { ?seriesStatement pq:P156 ?followedBy. } # followed by (qualifier)
  }
  
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
*/