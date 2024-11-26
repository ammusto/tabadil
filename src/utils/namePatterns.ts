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
  
  const getKunyaVariants = (kunya: string): string[] => {
    if (!kunya) return [];
    const normalized = normalizeArabic(kunya);
    return [
      normalized.replace(/^ابو/, 'ابا'),
      normalized.replace(/^ابا/, 'ابو'),
      normalized.replace(/^ابو/, 'ابي')
    ].filter((v, i, a) => a.indexOf(v) === i);
  };
  
  export const generateNamePatterns = (
    kunya: string,
    nasab: string,
    nisbas: string[]
  ): NamePatterns => {
    const patterns: Set<string> = new Set();
    const filterPatterns: Set<string> = new Set();
  
    const normalizedKunya = normalizeArabic(kunya);
    const normalizedNasab = normalizeArabic(nasab);
    const normalizedNisbas = nisbas.map(normalizeArabic).filter(Boolean);
    const kunyaVariants = getKunyaVariants(normalizedKunya);
    const nasabParts = normalizedNasab.split(' ').filter(Boolean);
  
    // Full name patterns
    if (normalizedKunya && normalizedNasab) {
      kunyaVariants.forEach(variant => {
        patterns.add(`${variant} ${normalizedNasab}`);
      });
    }
  
    // Nasab only if long enough
    if (nasabParts.length > 3) {
      patterns.add(normalizedNasab);
    }
  
    // Kunya with first part of nasab
    if (normalizedKunya && nasabParts.length > 0) {
      kunyaVariants.forEach(variant => {
        patterns.add(`${variant} ${nasabParts[0]}`);
      });
    }
  
    // Kunya with nisbas
    if (normalizedKunya) {
      kunyaVariants.forEach(variant => {
        normalizedNisbas.forEach(nisba => {
          patterns.add(`${variant} ${nisba}`);
        });
      });
    }
  
    // Generate filter patterns
    patterns.forEach(pattern => {
      filterPatterns.add(pattern.replace(/^(ابا|ابو|ابي)/, 'اب*'));
      normalizedNisbas.forEach(nisba => {
        filterPatterns.add(`${pattern} ${nisba}`.replace(/^(ابا|ابو|ابي)/, 'اب*'));
      });
    });
  
    return {
      searchPatterns: Array.from(patterns),
      filterPatterns: Array.from(filterPatterns)
    };
  };