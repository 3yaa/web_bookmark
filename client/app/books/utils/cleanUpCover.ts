import { getCoverUrl } from "./bookMapping";

const LOAD_TIMEOUT = 2000;
const MAX_COVERS = 15;

const cleanUpCover = (coverOLID: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;

    const cleanup = (result: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    // Faster timeout for better performance
    const timeout = setTimeout(() => cleanup(false), LOAD_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeout);
      // More efficient empty check
      cleanup(img.naturalWidth >= 10 && img.naturalHeight >= 10);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      cleanup(false);
    };

    img.src = getCoverUrl(coverOLID);
  });
};

const validateBatch = async (covers: string[]): Promise<string[]> => {
  const results = await Promise.allSettled(
    covers.map(async (cover) => {
      const isValid = await cleanUpCover(cover);
      return { cover, isValid };
    })
  );

  return results
    .filter((result) => result.status === "fulfilled" && result.value.isValid)
    .map(
      (result) =>
        (result as PromiseFulfilledResult<{ cover: string; isValid: boolean }>)
          .value.cover
    );
};

export const validateAndFilterCovers = async (
  coverEditions: string[] = []
): Promise<string[] | null> => {
  if (!coverEditions.length) return null;
  if (coverEditions.length <= MAX_COVERS) {
    return (await validateBatch(coverEditions)).slice(0, MAX_COVERS);
  }

  // Smart sampling: take every nth item for better distribution
  const step = Math.ceil(coverEditions.length / MAX_COVERS);
  const primaryCovers = [];
  const skippedCovers = [];

  // Single pass to separate primary and skipped covers
  for (let i = 0; i < coverEditions.length; i++) {
    if (i % step === 0 && primaryCovers.length < MAX_COVERS) {
      primaryCovers.push(coverEditions[i]);
    } else {
      skippedCovers.push(coverEditions[i]);
    }
  }

  // Validate primary batch
  const validPrimary = await validateBatch(primaryCovers);

  // Early return if we have enough valid covers
  if (validPrimary.length >= MAX_COVERS) {
    return validPrimary.slice(0, MAX_COVERS);
  }

  // Fill remaining slots with skipped covers
  const needed = MAX_COVERS - validPrimary.length;
  if (needed > 0 && skippedCovers.length > 0) {
    const additionalCovers = skippedCovers.slice(0, needed);
    const validAdditional = await validateBatch(additionalCovers);

    return [...validPrimary, ...validAdditional].slice(0, MAX_COVERS);
  }

  return validPrimary;
};
