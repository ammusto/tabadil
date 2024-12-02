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
    if (parts.length === 0) return '';
    
    const firstPart = parts[0];
    const remainingParts = parts.slice(1);
    
    const firstJoin = firstPart.startsWith('بنت') ? firstPart : (isFemale ? `بنت ${firstPart}` : firstPart);
    const restJoined = remainingParts.map(part => `بن ${part}`).join(' ');
    
    return [firstJoin, restJoined].filter(Boolean).join(' ');
  };

  // Helper to add patterns with and without nisba
  const addPatternVariants = (basePattern: string) => {
    patterns.add(basePattern);
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

// kunya + first name patterns
const addKunyaNasabPatterns = (basePattern: string, includeBase: boolean) => {
  if (includeBase) {
    // If allowKunyaNasab is true, add both base pattern (kunya + 1st nasab) and nisba versions
    patterns.add(basePattern);
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  } else {
    // If allowKunyaNasab is false, only add nisba versions to kunya + first nasab
    normalizedNisbas.forEach(nisba => {
      patterns.add(`${basePattern} ${nisba}`);
    });
  }
};

if (allKunyaVariants.length > 0 && nasabParts.parts.length > 0) {
  allKunyaVariants.forEach(kunyaVariant => {
    // Full kunya + first name
    const kunyaFirstName = `${kunyaVariant} ${nasabParts.parts[0]}`;
    addKunyaNasabPatterns(kunyaFirstName, allowKunyaNasab);
    
    for (let i = 2; i <= limitedNasabParts.length; i++) {
      const nasabString = buildNasabString(limitedNasabParts.slice(0, i), nasabParts.isFemale);
      addPatternVariants(`${kunyaVariant} ${nasabString}`);
    }
    
    for (let i = 2; i <= limitedNasabParts.length; i++) {
      const nasabString = buildNasabString(limitedNasabParts.slice(1, i), nasabParts.isFemale);
      const prefixedNasabString = nasabString.startsWith('بن') || nasabString.startsWith('بنت') ? 
        nasabString : 
        `بن ${nasabString}`;
      addPatternVariants(`${kunyaVariant} ${prefixedNasabString}`);
     }
  });
}


  const addNasabBasePatterns = (basePattern: string, includeBase: boolean, includeOneNasab: boolean) => {
    if (includeBase) {
      // If allowTwoNasab is true, add both base and nisba versions
      addPatternVariants(basePattern);
    } else {
      // If allowTwoNasab is false, only add nisba versions
      normalizedNisbas.forEach(nisba => {
        patterns.add(`${basePattern} ${nisba}`);
      });
    }
  };
  
  if (nasabParts.parts.length >= 3) {
    // Always generate 3-part pattern when available
    const threePartString = buildNasabString(limitedNasabParts.slice(0, 3), nasabParts.isFemale);
    addPatternVariants(threePartString);
  }
  
  // 2-part pattern when allowbase is chosen
  if (nasabParts.parts.length >= 2) {
    const twoPartString = buildNasabString(limitedNasabParts.slice(0, 2), nasabParts.isFemale);
    addNasabBasePatterns(twoPartString, allowTwoNasab, allowOneNasab);
  }
  console.log(Array.from(patterns))

  return {
    searchPatterns: Array.from(patterns),
    filterPatterns: []
  };
};