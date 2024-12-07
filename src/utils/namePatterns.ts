interface NamePatterns {
  searchPatterns: string[];
  filterPatterns: string[];
}

interface NasabInfo {
  parts: string[];
  isFemale: boolean;
}

const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[\u064B-\u065F]/g, '');
};

const getNasabParts = (nasab: string): NasabInfo => {
  if (!nasab) return { parts: [], isFemale: false };
  const isFemale = nasab.includes('بنت');
  const parts = nasab.split(/\s+(?:بن|بنت)\s+/).filter(Boolean);
  return { parts, isFemale };
};

const getKunyaVariants = (kunya: string): string[] => {
  if (!kunya) return [];
  const normalized = normalizeArabic(kunya);

  // Check if the kunya starts with any of the forms
  const abMatches = normalized.match(/^(ابو|ابا|ابي)\s+(.+)/);

  if (!abMatches) {
    // If it doesn't start with abu/aba/abi, just return the normalized form
    return [normalized];
  }

  // If it does match, generate all variants
  const base = abMatches[2];
  return [
    `ابو ${base}`,
    `ابا ${base}`,
    `ابي ${base}`
  ];
};

export const generateNamePatterns = (
  kunyas: string[],
  nasab: string,
  nisbas: string[],
  allowRareKunyaNisba: boolean = false,
  allowTwoNasab: boolean = false,
  allowKunyaNasab: boolean = false,
  allowOneNasab: boolean = false


): NamePatterns => {
  const patterns: Set<string> = new Set();

  // Get variants for all kunyas
  const allKunyaVariants = kunyas
    .filter(Boolean)
    .flatMap(kunya => getKunyaVariants(kunya));

  const normalizedNasab = normalizeArabic(nasab);
  const normalizedNisbas = nisbas.map(normalizeArabic).filter(Boolean);
  const nasabParts = getNasabParts(normalizedNasab);

  // Limit to first 3 nasab parts
  const limitedNasabParts = nasabParts.parts.slice(0, 3);

  // Helper to build full nasab string from parts
  const buildNasabString = (parts: string[], isFemale: boolean): string => {
    if (!parts?.length) return '';

    if (parts[0].startsWith('بن') || parts[0].startsWith('بنت')) {
      return parts.join(' بن ');
    }

    const connector = isFemale ? ' بنت ' : ' بن ';
    return parts.join(connector);
  };


  // Helper to add patterns with and without nisba
  const addPatternVariants = (basePattern: string, includeBase: boolean) => {
    if (includeBase) {
      patterns.add(basePattern);
    }
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  };

  // Handle kunya + nisba when there's no nasab or when rare combinations are allowed
  if ((allKunyaVariants.length > 0 && nasabParts.parts.length === 0 && normalizedNisbas.length > 0) ||
    (allowRareKunyaNisba && allKunyaVariants.length > 0 && normalizedNisbas.length > 0)) {
    allKunyaVariants.forEach(kunyaVariant => {
      normalizedNisbas.forEach(nisba => {
        patterns.add(`${kunyaVariant} ${nisba}`);
      });
    });
  }


  // Kunya patterns + nasab patterns
  if (allKunyaVariants.length > 0 && nasabParts.parts.length > 0) {
    allKunyaVariants.forEach(kunyaVariant => {
      // If allowKunyaNasab is true, add both base pattern (kunya + 1st nasab)
      if (allowKunyaNasab) {
        addPatternVariants(`${kunyaVariant} ${nasabParts.parts[0]}`, true);
      }

      // permuations of kunya + nasab, e.g. (أبو منصور معمر بن أحمد بن زياد)
      for (let i = 2; i <= limitedNasabParts.length; i++) {

        // kunya + 1st nasab + nisba 
        addPatternVariants(`${kunyaVariant} ${nasabParts.parts[0]}`, false);

        // kunya + nasab permutations w/ 2 nasab names
        addPatternVariants(`${kunyaVariant} ${buildNasabString(limitedNasabParts.slice(0, i), nasabParts.isFemale)}`, true);

        const prefix = nasabParts.isFemale ? 'بنت' : 'بن';
        addPatternVariants(`${kunyaVariant} ${prefix} ${buildNasabString(limitedNasabParts.slice(1, i), nasabParts.isFemale)}`, true);

        // kunya + nasab minus first name, e.g. (أبو منصور بن أحمد بن زياد)
        if (i === limitedNasabParts.length && !limitedNasabParts[0].trim().startsWith('بن')) {
          const prefix = nasabParts.isFemale ? 'بنت' : 'بن';
          addPatternVariants(`${kunyaVariant} ${prefix} ${buildNasabString(limitedNasabParts.slice(1, i), nasabParts.isFemale)}`, true);
        }
      }
    });
  }

  const addNasabBasePatterns = (basePattern: string, includeBase: boolean, includeOneNasab: boolean) => {
    if (includeBase) {
      // If allowTwoNasab is true, add 2-part nasab only
      addPatternVariants(basePattern, true);
    }
    if (includeOneNasab) {
      const firstPart = nasabParts.parts[0].replace(/^(?:بن|بنت)\s+/, '');
      normalizedNisbas.forEach(nisba => {
        patterns.add(`${firstPart} ${nisba}`);
      });
    }
  };

  // if only single nasab name, no kunya, and nisba are provided, then generate pattern
  if (nasabParts.parts.length === 1 && allKunyaVariants.length === 0 && normalizedNisbas.length >= 1) {
    addPatternVariants(nasabParts.parts[0], false)
  }

  if (allowOneNasab && normalizedNisbas.length >= 1) {
    addPatternVariants(nasabParts.parts[0], false)

  }

  if (nasabParts.parts.length >= 3) {
    // Always generate 3-part pattern when available
    const threePartString = buildNasabString(limitedNasabParts.slice(0, 3), nasabParts.isFemale);
    addPatternVariants(threePartString, true);
  }

  // 2-part pattern when allowbase is chosen
  if (nasabParts.parts.length >= 2) {
    const twoPartString = buildNasabString(limitedNasabParts.slice(0, 2), nasabParts.isFemale);

    //2-part pattern with nisba
    addPatternVariants(twoPartString, false);

    //2-part pattern with incomplete nisba, e.g. starting with بنت or بن or ابن
    if (nasabParts.parts[0].trim().startsWith('بنت')) {
      addNasabBasePatterns(twoPartString, true, false);
    } else if (nasabParts.parts[0].trim().startsWith('بن')) {
      limitedNasabParts[0] = limitedNasabParts[0].replace('بن', 'ابن');
      const twoPartString = buildNasabString(limitedNasabParts.slice(0, 2), nasabParts.isFemale);
      addNasabBasePatterns(twoPartString, true, false);
    } else if (nasabParts.parts[0].trim().startsWith('ابن')) {
      const twoPartString = buildNasabString(limitedNasabParts.slice(0, 2), nasabParts.isFemale);
      addNasabBasePatterns(twoPartString, true, false);
    } else {
      addNasabBasePatterns(twoPartString, allowTwoNasab, allowOneNasab);
    }
  }

  return {
    searchPatterns: Array.from(patterns),
    filterPatterns: []
  };
};