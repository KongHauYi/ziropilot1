/**
 * Processes a chess-results.com link to generate a comprehensive list of URLs
 * covering all rounds and player/pairing lists for the tournament.
 * @param url - The original URL from chess-results.com.
 * @returns An array of processed URLs.
 */
export function processChessLink(url: string): string[] {
  try {
    const urlObject = new URL(url);
    const params = urlObject.searchParams;

    // Find the round number, default to 1 if not present
    const roundParam = Array.from(params.keys()).find(key => key.toLowerCase() === 'rd');
    const startRound = roundParam ? parseInt(params.get(roundParam) || '1', 10) : 1;

    if (isNaN(startRound)) {
      // If 'rd' is not a number, just return the original URL
      return [url];
    }
    
    const generatedUrls: string[] = [];

    // Generate URLs for each round from startRound down to 1
    for (let rd = startRound; rd >= 1; rd--) {
      // For each round, generate for art=1 (standings) and art=2 (pairings)
      for (let art = 1; art <= 2; art++) {
        const newParams = new URLSearchParams(params);
        if (roundParam) {
           newParams.set(roundParam, rd.toString());
        }
        
        const artParam = Array.from(newParams.keys()).find(key => key.toLowerCase() === 'art');
        if (artParam) {
            newParams.set(artParam, art.toString());
        } else {
            newParams.set('art', art.toString());
        }

        urlObject.search = newParams.toString();
        generatedUrls.push(urlObject.toString());
      }
    }
    
    // Using a Set to remove any duplicate URLs that might have been generated
    return Array.from(new Set(generatedUrls));

  } catch (error) {
    console.error("Invalid URL provided to processChessLink:", error);
    // Return the original URL in case of any processing error
    return [url];
  }
}
