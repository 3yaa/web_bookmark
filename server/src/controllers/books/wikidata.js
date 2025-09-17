export async function useWikidataAPI(req, res) {
  try {
    const openLibraryID = req.query.openLibraryID;
    const query = `
    SELECT ?workLabel ?seriesLabel ?ordinal ?followsLabel ?followedByLabel WHERE {
      ?work wdt:P648 "${openLibraryID}"
      
      OPTIONAL {
        ?work p:P179 ?seriesStatement.
        ?seriesStatement ps:P179 ?series.
        OPTIONAL { ?seriesStatement pq:P1545 ?ordinal. }
        OPTIONAL { ?seriesStatement pq:P155 ?follows. }
        OPTIONAL { ?seriesStatement pq:P156 ?followedBy. }
      }
      
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en, mul". }
    }`;
    const endpoint = "https://query.wikidata.org/sparql";
    const url = `${endpoint}?query=${encodeURIComponent(query)}&format=json`;
    // make call
    const response = await fetch(url, {
      headers: {
        "User-Agent": `mouthful-server/1.0 ${process.env.PAGE_CONTACT}`,
        Accept: "application/sparql-results+json",
      },
    });
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `Wikidata API error: ${response.statusText}`,
        error: `Wikidata API failure`,
      });
    }
    // data clean up
    const data = await response.json();
    const seriesInfo = data.results?.bindings || [];
    const processedBooks = seriesInfo.map((binding) => ({
      wiki_title: binding.workLabel?.value || null,
      series_title: binding.seriesLabel?.value || null,
      place_in_series: binding.ordinal?.value || null,
      prequel: binding.followsLabel?.value || null,
      sequel: binding.followedByLabel?.value || null,
    }));
    //
    res.status(200).json({
      success: true,
      count: processedBooks.length,
      data: processedBooks,
    });
  } catch (error) {
    console.error("Wikidata fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch book's series from Wikidata",
      error: error.message,
    });
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
