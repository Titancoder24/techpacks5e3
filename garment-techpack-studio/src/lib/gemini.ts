const GEMINI_KEY = 'AIzaSyD4rMaxXXOt6lHjDuNEWd-IZL0LTK_N-g0'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`

export async function callGemini(prompt: string, imageBase64?: string): Promise<string> {
  const parts: any[] = []
  if (imageBase64) {
    parts.push({
      inline_data: {
        mime_type: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
        data: imageBase64.split(',')[1]
      }
    })
  }
  parts.push({ text: prompt })
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 32768 }
    })
  })
  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`)
  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

export function buildGarmentPrompt(garmentType: string, fabricId: string, description: string): string {
  return `You are a world-class fashion technical designer. Generate a complete garment tech pack.

Garment: ${garmentType}
Fabric: ${fabricId}
Brief: ${description || 'Standard contemporary construction'}

Return ONLY valid JSON (no markdown fences, no backticks, no explanation):
{
  "styleName": "creative commercial style name",
  "constructionNotes": "detailed construction notes including seam types, finishing, special instructions",
  "measurements": { "chest": number_in_cm, "waist": number_in_cm, "shoulder": number_in_cm, "sleeveLength": number_in_cm, "length": number_in_cm, "hip": number_in_cm },
  "bom": [
    { "item": "Main Fabric", "description": "fabric details", "quantity": "X meters" },
    { "item": "Sewing Thread", "description": "thread type", "quantity": "X cones" },
    { "item": "Labels", "description": "label type", "quantity": "X pcs" },
    { "item": "Trims", "description": "buttons/zippers/etc", "quantity": "X pcs" }
  ],
  "stitchType": "recommended stitch type from: 301 Lockstitch, 401 Chain Stitch, 504 Overlock, 516 Safety Stitch, 602 Coverstitch, 605 Flatlock",
  "stitchDensity": "X SPI",
  "pantoneCode": "PMS XX-XXXX",
  "colorHex": "#XXXXXX",
  "seamAllowance": 1.5
}`
}

export function buildImageAnalysisPrompt(garmentType: string): string {
  return `Analyze this garment image. Identify:
1. Garment type, silhouette, and construction details
2. Collar/neckline, sleeve type, hem style
3. Special features (pockets, embroidery, prints, hardware)
4. Estimated fabric type and weight
5. Color analysis with closest Pantone match

Then generate a tech pack as JSON (no markdown):
{
  "styleName": "...",
  "garmentType": "${garmentType}",
  "constructionNotes": "...",
  "measurements": { "chest": 0, "waist": 0, "shoulder": 0, "sleeveLength": 0, "length": 0 },
  "bom": [{ "item": "...", "description": "...", "quantity": "..." }],
  "stitchType": "...",
  "pantoneCode": "PMS ...",
  "colorHex": "#..."
}`
}
