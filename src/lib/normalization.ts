export function normalizeIngredientName(name: string): string {
    // Convert to lower case, trim whitespace
    let normalized = name.trim().toLowerCase();
    // Remove common French stop words or store-specific suffixes
    const stopWords = ['el manar', 'el', 'manar'];
    stopWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        normalized = normalized.replace(regex, '');
    });
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    // Remove diacritics
    normalized = normalized.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    return normalized;
}
