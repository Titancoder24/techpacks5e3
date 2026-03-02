import { GoogleGenAI } from "@google/genai"

const GEMINI_KEY = 'AIzaSyAg1ub48W1cVzqsoDVcAVz4Fq9W7X_bdcM'
const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })
const MODEL = 'gemini-3-flash-preview'

// ── Training Profile (stored in localStorage) ──────────────────────────

export interface TrainingProfile {
  brandName: string
  brandTone: string
  preferredFabrics: string[]
  preferredColors: string[]
  preferredStitchTypes: string[]
  targetMarket: string
  pricePoint: 'budget' | 'mid-range' | 'premium' | 'luxury'
  specialInstructions: string
  exampleStyles: { name: string; notes: string }[]
  feedbackHistory: { prompt: string; rating: 'good' | 'bad'; note: string; timestamp: number }[]
  updatedAt: number
}

const TRAINING_KEY = 'techpack_ai_training_profile'

export function getTrainingProfile(): TrainingProfile | null {
  try {
    const raw = localStorage.getItem(TRAINING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveTrainingProfile(profile: TrainingProfile) {
  profile.updatedAt = Date.now()
  localStorage.setItem(TRAINING_KEY, JSON.stringify(profile))
}

export function createDefaultTrainingProfile(): TrainingProfile {
  return {
    brandName: '',
    brandTone: 'contemporary',
    preferredFabrics: [],
    preferredColors: [],
    preferredStitchTypes: [],
    targetMarket: 'Men & Women 18-35',
    pricePoint: 'mid-range',
    specialInstructions: '',
    exampleStyles: [],
    feedbackHistory: [],
    updatedAt: Date.now(),
  }
}

export function addFeedback(prompt: string, rating: 'good' | 'bad', note: string) {
  const profile = getTrainingProfile() || createDefaultTrainingProfile()
  profile.feedbackHistory.push({ prompt, rating, note, timestamp: Date.now() })
  if (profile.feedbackHistory.length > 50) {
    profile.feedbackHistory = profile.feedbackHistory.slice(-50)
  }
  saveTrainingProfile(profile)
}

// ── Build training context from profile ─────────────────────────────────

function buildTrainingContext(): string {
  const profile = getTrainingProfile()
  if (!profile) return ''

  const parts: string[] = []
  if (profile.brandName) parts.push(`Brand: ${profile.brandName}`)
  if (profile.brandTone) parts.push(`Design tone: ${profile.brandTone}`)
  if (profile.targetMarket) parts.push(`Target market: ${profile.targetMarket}`)
  if (profile.pricePoint) parts.push(`Price point: ${profile.pricePoint}`)
  if (profile.preferredFabrics.length > 0) parts.push(`Preferred fabrics: ${profile.preferredFabrics.join(', ')}`)
  if (profile.preferredColors.length > 0) parts.push(`Preferred colors: ${profile.preferredColors.join(', ')}`)
  if (profile.preferredStitchTypes.length > 0) parts.push(`Preferred stitch types: ${profile.preferredStitchTypes.join(', ')}`)
  if (profile.specialInstructions) parts.push(`Special instructions: ${profile.specialInstructions}`)
  if (profile.exampleStyles.length > 0) {
    parts.push('Reference styles the brand likes:')
    profile.exampleStyles.forEach(s => {
      parts.push(`  - ${s.name}: ${s.notes}`)
    })
  }

  const goodFeedback = profile.feedbackHistory.filter(f => f.rating === 'good').slice(-5)
  const badFeedback = profile.feedbackHistory.filter(f => f.rating === 'bad').slice(-5)
  if (goodFeedback.length > 0) {
    parts.push('User liked these outputs:')
    goodFeedback.forEach(f => parts.push(`  + ${f.note}`))
  }
  if (badFeedback.length > 0) {
    parts.push('User disliked these outputs (avoid similar):')
    badFeedback.forEach(f => parts.push(`  - ${f.note}`))
  }

  if (parts.length === 0) return ''
  return `\n\n=== BRAND TRAINING CONTEXT ===\n${parts.join('\n')}\n=== END TRAINING CONTEXT ===\n\nUse this context to tailor your output to this brand's aesthetic, price point, and preferences.`
}

// ── Core Gemini API call ────────────────────────────────────────────────

export async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
  const contents: any[] = []

  if (imageBase64) {
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'
    const base64Data = imageBase64.split(',')[1]
    contents.push({
      inlineData: { mimeType, data: base64Data }
    })
  }
  contents.push(prompt)

  const response = await ai.models.generateContent({
    model: MODEL,
    contents,
    config: {
      temperature: 0.15,
      maxOutputTokens: 32768,
    },
  })

  return response.text || ''
}

// ── AI Chat for natural language tech pack editing ──────────────────────

export async function chatWithAI(message: string, techPackContext: string): Promise<string> {
  const trainingCtx = buildTrainingContext()
  const prompt = `You are an expert garment tech pack assistant inside a professional tech pack studio app. The user is editing a tech pack and needs help.

Current tech pack state:
${techPackContext}
${trainingCtx}

User message: ${message}

Respond helpfully and concisely. If the user asks to change something, respond with the change as JSON that can be merged into the tech pack, wrapped in <json>...</json> tags. For questions, just answer in plain text. Keep responses under 200 words.`

  return callGemini(prompt)
}

// ── Prompt builders ─────────────────────────────────────────────────────

export function buildGarmentPrompt(garmentType: string, fabricId: string, description: string): string {
  const trainingCtx = buildTrainingContext()
  return `You are a world-class fashion technical designer producing tech packs used by top 0.1% garment manufacturers. Generate a COMPLETE, production-ready garment tech pack with exceptional detail.
${trainingCtx}

Garment: ${garmentType}
Fabric: ${fabricId}
Brief: ${description || 'Standard contemporary construction'}

Return ONLY valid JSON (no markdown fences, no backticks, no explanation):
{
  "styleName": "creative commercial style name",
  "constructionNotes": "extremely detailed construction notes: seam types for each join, finishing methods, special techniques, order of operations, pressing instructions, quality checkpoints",
  "measurements": { "chest": number_in_cm, "waist": number_in_cm, "shoulder": number_in_cm, "sleeveLength": number_in_cm, "length": number_in_cm, "hip": number_in_cm },
  "bom": [
    { "item": "Main Fabric", "description": "exact fabric specification with composition and weight", "quantity": "X meters" },
    { "item": "Sewing Thread", "description": "thread type, tex count, color match", "quantity": "X cones" },
    { "item": "Labels", "description": "main label, care label, size label specifications", "quantity": "X pcs" },
    { "item": "Trims", "description": "buttons/zippers/rivets with material and finish", "quantity": "X pcs" },
    { "item": "Packaging", "description": "polybag, hangtag, tissue, sticker", "quantity": "1 set" }
  ],
  "stitchType": "recommended stitch type from: 301 Lockstitch, 401 Chain Stitch, 504 Overlock, 516 Safety Stitch, 602 Coverstitch, 605 Flatlock",
  "stitchDensity": "X SPI",
  "pantoneCode": "PMS XX-XXXX",
  "colorHex": "#XXXXXX",
  "seamAllowance": 1.5,
  "qualityNotes": "specific quality checkpoints and tolerances",
  "packagingInstructions": "folding method, polybag size, carton details"
}`
}

export function buildImageAnalysisPrompt(garmentType: string): string {
  const trainingCtx = buildTrainingContext()
  return `You are an elite garment analysis AI. Analyze this garment image with extreme precision.
${trainingCtx}

Identify:
1. Garment type, silhouette, fit type (slim/regular/oversized), and construction details
2. Collar/neckline style, sleeve type and length, hem style and finish
3. Special features (pockets with placement, embroidery, prints, hardware, closures)
4. Fabric type estimation (composition, weight in GSM, stretch properties)
5. Color analysis with exact Pantone match
6. Stitch types visible at seams
7. Label placement estimation

Then generate a production-ready tech pack as JSON (no markdown):
{
  "styleName": "...",
  "garmentType": "${garmentType}",
  "constructionNotes": "...",
  "measurements": { "chest": 0, "waist": 0, "shoulder": 0, "sleeveLength": 0, "length": 0, "hip": 0 },
  "bom": [{ "item": "...", "description": "...", "quantity": "..." }],
  "stitchType": "...",
  "stitchDensity": "...",
  "pantoneCode": "PMS ...",
  "colorHex": "#...",
  "seamAllowance": 1.5
}`
}
