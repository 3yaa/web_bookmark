import { getCoverUrl } from "@/app/books/utils/bookMapping";

/**
 * Filters out edition keys that don't have valid cover art
 * @param editionKeys - Array of edition keys to check
 * @returns Promise<string[]> - Array of edition keys with valid covers
 */
export async function filterValidCoverEditions(editionKeys: string[]): Promise<string[]> {
  const validEditions: string[] = [];
  
  // Check each edition key for valid cover art
  for (const editionKey of editionKeys) {
    try {
      const coverUrl = getCoverUrl(editionKey);
      
      // Skip if getCoverUrl returns null/undefined/empty string
      if (!coverUrl || coverUrl.trim() === '') {
        continue;
      }
      
      // Check if the cover URL actually returns a valid image
      const isValidCover = await checkCoverExists(coverUrl);
      
      if (isValidCover) {
        validEditions.push(editionKey);
      }
    } catch (error) {
      console.warn(`Error checking edition key ${editionKey}:`, error);
      // Skip this edition key if there's an error
      continue;
    }
  }
  
  return validEditions;
}

/**
 * Checks if a cover URL returns a valid image
 * @param coverUrl - The cover URL to check
 * @returns Promise<boolean> - True if the cover exists and is valid
 */
async function checkCoverExists(coverUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      // Check if the image has valid dimensions (not a placeholder)
      if (img.width > 1 && img.height > 1) {
        resolve(true);
      } else {
        resolve(false);
      }
    };
    
    img.onerror = () => {
      resolve(false);
    };
    
    // Set a timeout to avoid hanging on slow/broken URLs
    setTimeout(() => {
      resolve(false);
    }, 5000); // 5 second timeout
    
    img.src = coverUrl;
  });
}

/**
 * Batch version that processes editions in chunks to avoid overwhelming the server
 * @param editionKeys - Array of edition keys to check
 * @param chunkSize - Number of editions to process simultaneously (default: 5)
 * @returns Promise<string[]> - Array of edition keys with valid covers
 */
export async function filterValidCoverEditionsBatch(
  editionKeys: string[], 
  chunkSize: number = 5
): Promise<string[]> {
  const validEditions: string[] = [];
  
  // Process editions in chunks to avoid overwhelming the server
  for (let i = 0; i < editionKeys.length; i += chunkSize) {
    const chunk = editionKeys.slice(i, i + chunkSize);
    
    const chunkPromises = chunk.map(async (editionKey) => {
      try {
        const coverUrl = getCoverUrl(editionKey);
        
        if (!coverUrl || coverUrl.trim() === '') {
          return null;
        }
        
        const isValid = await checkCoverExists(coverUrl);
        return isValid ? editionKey : null;
      } catch (error) {
        console.warn(`Error checking edition key ${editionKey}:`, error);
        return null;
      }
    });
    
    const chunkResults = await Promise.all(chunkPromises);
    
    // Add valid editions to the result array
    chunkResults.forEach(result => {
      if (result !== null) {
        validEditions.push(result);
      }
    });
    
    // Small delay between chunks to be nice to the server
    if (i + chunkSize < editionKeys.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return validEditions;
}

/**
 * Quick filter that only checks if getCoverUrl returns a valid URL
 * (doesn't actually verify the image exists - faster but less thorough)
 * @param editionKeys - Array of edition keys to check
 * @returns string[] - Array of edition keys that have cover URLs
 */
export function filterEditionsWithCoverUrls(editionKeys: string[]): string[] {
  return editionKeys.filter(editionKey => {
    try {
      const coverUrl = getCoverUrl(editionKey);
      return coverUrl && coverUrl.trim() !== '';
    } catch (error) {
      console.warn(`Error getting cover URL for edition key ${editionKey}:`, error);
      return false;
    }
  });
}

/**
 * Synchronous version - just an alias for the quick filter
 * Use this as your main filter function for now
 */
export function filterValidCoverEditionsSync(editionKeys: string[]): string[] {
  return filterEditionsWithCoverUrls(editionKeys);
}

/**
 * Enhanced sync filter that does basic URL validation
 * @param editionKeys - Array of edition keys to check
 * @returns string[] - Array of edition keys with valid-looking cover URLs
 */
export function filterValidCoverEditionsEnhanced(editionKeys: string[]): string[] {
  return editionKeys.filter(editionKey => {
    try {
      const coverUrl = getCoverUrl(editionKey);
      
      // Basic validation
      if (!coverUrl || coverUrl.trim() === '') {
        return false;
      }
      
      // Check if it looks like a valid URL
      if (!coverUrl.startsWith('http')) {
        return false;
      }
      
      // Check if it's not a common placeholder/error URL
      const commonPlaceholders = [
        'no-cover',
        'placeholder',
        'default',
        'missing',
        'error'
      ];
      
      const lowerUrl = coverUrl.toLowerCase();
      const hasPlaceholder = commonPlaceholders.some(placeholder => 
        lowerUrl.includes(placeholder)
      );
      
      return !hasPlaceholder;
      
    } catch (error) {
      console.warn(`Error getting cover URL for edition key ${editionKey}:`, error);
      return false;
    }
  });
}