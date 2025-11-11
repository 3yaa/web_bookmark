const LOAD_TIMEOUT = 2000;

const isValidCover = (coverUrl: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    let resolved = false;

    const cleanup = (result: boolean) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    const timeout = setTimeout(() => cleanup(false), LOAD_TIMEOUT);

    img.onload = () => {
      clearTimeout(timeout);
      cleanup(img.naturalWidth >= 10 && img.naturalHeight >= 10);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      cleanup(false);
    };

    img.src = coverUrl;
  });
};

export const filterCovers = async (
  coverUrls: string[] = []
): Promise<string[]> => {
  if (!coverUrls.length) return [];

  const results = await Promise.allSettled(
    coverUrls.map(async (cover) => {
      const isValid = await isValidCover(cover);
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
