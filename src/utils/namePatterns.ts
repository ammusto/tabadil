interface NamePatterns {
  searchPatterns: string[];
  filterPatterns: string[];
}

const normalizeArabic = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[\u064B-\u065F]/g, '');
};

const getNasabParts = (nasab: string): string[] => {
  if (!nasab) return [];
  return nasab.split(/\s+(?:بن|بنت)\s+/).filter(Boolean);
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
  allowNasabBase: boolean = false,
  allowKunyaNasab: boolean = false

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
  const limitedNasabParts = nasabParts.slice(0, 3);

  // Helper to build full nasab string from parts
  const buildNasabString = (parts: string[]): string => {
    return parts.join(' بن ');
  };

  // Helper to add patterns with and without nisba
  const addPatternVariants = (basePattern: string) => {
    patterns.add(basePattern);
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  };

  // Handle kunya + nisba when there's no nasab or when rare combinations are allowed
  if ((allKunyaVariants.length > 0 && nasabParts.length === 0 && normalizedNisbas.length > 0) ||
    (allowRareKunyaNisba && allKunyaVariants.length > 0 && normalizedNisbas.length > 0)) {
    allKunyaVariants.forEach(kunyaVariant => {
      normalizedNisbas.forEach(nisba => {
        patterns.add(`${kunyaVariant} ${nisba}`);
      });
    });
  }

// kunya + first name patterns
const addKunyaNasabPatterns = (basePattern: string, includeBase: boolean) => {
  if (includeBase) {
    // If allowKunyaNasab is true, add both base pattern and nisba versions
    patterns.add(basePattern);
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  } else {
    // If allowKunyaNasab is false, only add nisba versions
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  }
};

// Then in the kunya + nasab section:
if (allKunyaVariants.length > 0 && nasabParts.length > 0) {
  allKunyaVariants.forEach(kunyaVariant => {
    // Full kunya + first name
    const kunyaFirstName = `${kunyaVariant} ${nasabParts[0]}`;
    addKunyaNasabPatterns(kunyaFirstName, allowKunyaNasab);
    
    for (let i = 2; i <= limitedNasabParts.length; i++) {
      const nasabString = buildNasabString(limitedNasabParts.slice(0, i));
      addPatternVariants(`${kunyaVariant} ${nasabString}`);
    }
    
    for (let i = 2; i <= limitedNasabParts.length; i++) {
      const nasabString = buildNasabString(limitedNasabParts.slice(1, i));
      const ibnNasabString = `بن ${nasabString}`
      addPatternVariants(`${kunyaVariant} ${ibnNasabString}`);
    }
  });
}


  const addNasabBasePatterns = (basePattern: string, includeBase: boolean) => {
    if (includeBase) {
      // If allowNasabBase is true, add both base and nisba versions
      addPatternVariants(basePattern);
    } else {
      // If allowNasabBase is false, only add nisba versions
      normalizedNisbas.forEach(nisba => {
        patterns.add(`${basePattern} ${nisba}`);
      });
    }
  };
  
  if (nasabParts.length >= 3) {
    // Always generate 3-part pattern when available
    const threePartString = buildNasabString(limitedNasabParts.slice(0, 3));
    addPatternVariants(threePartString);
  }
  
  // 2-part pattern when allowbase is chosen
  if (nasabParts.length >= 2) {
    const twoPartString = buildNasabString(limitedNasabParts.slice(0, 2));
    addNasabBasePatterns(twoPartString, allowNasabBase);
  }

  return {
    searchPatterns: Array.from(patterns),
    filterPatterns: [] // We'll use searchPatterns directly in this case
  };
};