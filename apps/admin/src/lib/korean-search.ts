/**
 * Korean 초성 (initial consonant) search utility
 * Supports: 초성 matching, partial matching, full text matching
 */

const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
]

const HANGUL_START = 0xAC00
const HANGUL_END = 0xD7A3
const CHOSUNG_OFFSET = 588 // 21 * 28

/**
 * Extract 초성 from a single Korean character
 */
function getChosung(char: string): string {
  const code = char.charCodeAt(0)
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const chosungIndex = Math.floor((code - HANGUL_START) / CHOSUNG_OFFSET)
    return CHOSUNG_LIST[chosungIndex]
  }
  return char
}

/**
 * Extract all 초성 from a string
 */
function getChosungString(text: string): string {
  return text.split('').map(getChosung).join('')
}

/**
 * Check if a character is a Korean 초성 (consonant only)
 */
function isChosung(char: string): boolean {
  return CHOSUNG_LIST.includes(char)
}

/**
 * Check if the query consists entirely of 초성 characters
 */
function isChosungQuery(query: string): boolean {
  return query.split('').every((char) => isChosung(char))
}

/**
 * Check if a Korean syllable starts with the given 초성
 */
function matchesChosung(targetChar: string, queryChar: string): boolean {
  if (!isChosung(queryChar)) return false
  const code = targetChar.charCodeAt(0)
  if (code >= HANGUL_START && code <= HANGUL_END) {
    return getChosung(targetChar) === queryChar
  }
  return false
}

/**
 * Advanced Korean search: supports 초성, partial, and exact matching
 * Returns a relevance score (0 = no match, higher = better match)
 */
export function koreanSearch(target: string, query: string): number {
  if (!query || !target) return 0

  const normalizedTarget = target.toLowerCase().trim()
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) return 0

  // 1. Exact match (highest score)
  if (normalizedTarget === normalizedQuery) return 100

  // 2. Starts with query (very high score)
  if (normalizedTarget.startsWith(normalizedQuery)) return 90

  // 3. Contains query as substring (high score)
  if (normalizedTarget.includes(normalizedQuery)) {
    const position = normalizedTarget.indexOf(normalizedQuery)
    return 80 - position // Earlier position = higher score
  }

  // 4. 초성 search
  if (isChosungQuery(normalizedQuery)) {
    const targetChosung = getChosungString(normalizedTarget)

    // 초성 exact match
    if (targetChosung === normalizedQuery) return 75

    // 초성 starts with
    if (targetChosung.startsWith(normalizedQuery)) return 70

    // 초성 contains
    if (targetChosung.includes(normalizedQuery)) {
      const position = targetChosung.indexOf(normalizedQuery)
      return 60 - position
    }
  }

  // 5. Mixed 초성 + syllable matching (e.g., "ㄱ사" matching "검사")
  let targetIdx = 0
  let queryIdx = 0
  let matched = true
  while (queryIdx < normalizedQuery.length && targetIdx < normalizedTarget.length) {
    const qChar = normalizedQuery[queryIdx]
    const tChar = normalizedTarget[targetIdx]

    if (isChosung(qChar)) {
      if (matchesChosung(tChar, qChar)) {
        queryIdx++
        targetIdx++
      } else {
        matched = false
        break
      }
    } else {
      if (tChar === qChar) {
        queryIdx++
        targetIdx++
      } else {
        matched = false
        break
      }
    }
  }

  if (matched && queryIdx === normalizedQuery.length) {
    return 50
  }

  return 0
}

/**
 * Search across multiple fields of an object
 * Returns the highest relevance score found
 */
export function koreanSearchMultiField(
  item: Record<string, any>,
  query: string,
  fields: string[]
): number {
  let maxScore = 0
  for (const field of fields) {
    const value = item[field]
    if (typeof value === 'string') {
      const score = koreanSearch(value, query)
      if (score > maxScore) maxScore = score
    }
  }
  return maxScore
}

/**
 * Filter and sort an array by Korean search relevance
 */
export function filterByKoreanSearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  fields: string[]
): T[] {
  if (!query.trim()) return items

  const scored = items
    .map((item) => ({
      item,
      score: koreanSearchMultiField(item, query, fields),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.map(({ item }) => item)
}
