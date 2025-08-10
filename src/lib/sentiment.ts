// Simple sentiment analysis without external library
// In a production app, you'd use the 'sentiment' library, but for simplicity:


const positiveWords = [
  'love', 'beautiful', 'amazing', 'wonderful', 'great', 'awesome', 'fantastic',
  'gorgeous', 'pretty', 'cute', 'sweet', 'perfect', 'excellent', 'brilliant',
  'happy', 'joy', 'excited', 'thrilled', 'delighted', 'pleased', 'glad',
  'nakupenda', 'mpenzi', 'roho', 'upendo', 'mapenzi', 'baby', 'darling',
  'kiss', 'hug', 'miss', 'adore', 'cherish', 'treasure', 'angel', 'honey'
]

const negativeWords = [
  'hate', 'terrible', 'awful', 'bad', 'horrible', 'disgusting', 'ugly',
  'sad', 'depressed', 'angry', 'mad', 'furious', 'upset', 'disappointed',
  'hurt', 'pain', 'cry', 'lonely', 'boring', 'stupid', 'dumb', 'worst'
]

const intensifiers = [
  'very', 'really', 'extremely', 'super', 'incredibly', 'absolutely',
  'totally', 'completely', 'so', 'too', 'quite', 'rather', 'pretty'
]

export const analyzeSentiment = (text: string): number => {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 0)
  let score = 0
  let wordCount = words.length

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const prevWord = i > 0 ? words[i - 1] : ''
    
    let wordScore = 0
    
    if (positiveWords.includes(word)) {
      wordScore = 1
    } else if (negativeWords.includes(word)) {
      wordScore = -1
    }
    
    // Apply intensifier multiplier
    if (wordScore !== 0 && intensifiers.includes(prevWord)) {
      wordScore *= 1.5
    }
    
    score += wordScore
  }

  // Return comparative score (normalized by word count)
  return wordCount > 0 ? score / wordCount : 0
}

export const getSentimentLabel = (score: number): string => {
  if (score >= 0.5) return 'very positive'
  if (score >= 0.1) return 'positive'
  if (score >= -0.1) return 'neutral'
  if (score >= -0.5) return 'negative'
  return 'very negative'
}

export const getEmotionFromSentiment = (score: number, text: string): string => {
  const lowerText = text.toLowerCase()
  
  // Check for specific emotion triggers
  if (lowerText.includes('goodnight') || lowerText.includes('nakupenda') || lowerText.includes('love')) {
    return 'blush'
  }
  
  if (lowerText.includes('beautiful') || lowerText.includes('gorgeous') || lowerText.includes('sexy')) {
    return 'wink'
  }
  
  if (lowerText.includes('funny') || lowerText.includes('haha') || lowerText.includes('lol') || lowerText.includes('😄') || lowerText.includes('😂')) {
    return 'laugh'
  }
  
  // Fall back to sentiment-based emotions
  if (score >= 0.3) return 'smile'
  if (score >= 0.1) return 'normal'
  if (score <= -0.3) return 'sad'
  
  return 'normal'
}