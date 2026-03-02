export interface BOMItem {
  item: string
  description: string
  quantity: string
  supplier?: string
  unitCost?: number
}

export interface TechPackMessage {
  id: string
  userId: string
  userName: string
  userRole: 'designer' | 'buyer' | 'manufacturer' | 'admin'
  userAvatar?: string
  text: string
  timestamp: number
}

export interface ApprovalLogEntry {
  status: string
  changedBy: string
  timestamp: number
  note?: string
}

export interface TechPack {
  id: string
  styleName: string
  styleNumber: string
  season: string
  garmentType: string
  fabricId: string
  fabricColor: string
  pantoneCode: string
  printUrl?: string
  measurements: {
    chest?: number
    waist?: number
    hip?: number
    shoulder?: number
    sleeveLength?: number
    length?: number
    inseam?: number
  }
  stitchType: string
  stitchDensity: string
  seamAllowance: number
  bom: BOMItem[]
  aiDescription: string
  constructionNotes: string
  threeJsCode?: string
  status: 'draft' | 'sent_to_buyer' | 'buyer_reviewing' | 'revision_needed' | 'approved' | 'in_production'
  approvedBy?: string
  approvalLog: ApprovalLogEntry[]
  messages: TechPackMessage[]
  sharedWith: string[]
  shareLink?: string
  referenceImageUrl?: string
  renderImageUrl?: string
  mockupColor: string
  backgroundColor: string
  isMoving: boolean
  zoom: number
  animationType: string
  isClay: boolean
  environmentPreset: string
  showReflections: boolean
  atmosphericEffect: string
  createdBy: string
  updatedAt: number
  createdAt: number
}

export const APPROVAL_STAGES = [
  { id: 'draft', label: 'Draft', color: 'gray', hex: '#6b7280' },
  { id: 'sent_to_buyer', label: 'Sent to Buyer', color: 'blue', hex: '#3b82f6' },
  { id: 'buyer_reviewing', label: 'Buyer Reviewing', color: 'yellow', hex: '#eab308' },
  { id: 'revision_needed', label: 'Revision Needed', color: 'orange', hex: '#f97316' },
  { id: 'approved', label: 'Approved', color: 'green', hex: '#22c55e' },
  { id: 'in_production', label: 'In Production', color: 'purple', hex: '#a855f7' },
] as const

const STORAGE_KEY = 'techpack_studio_projects'

export function createBlankTechPack(): TechPack {
  const id = Math.random().toString(36).substr(2, 9)
  return {
    id,
    styleName: 'Untitled Style',
    styleNumber: `TP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
    season: 'SS25',
    garmentType: 'tshirt-crew',
    fabricId: 'cotton-100',
    fabricColor: '#f5f5f5',
    pantoneCode: 'PMS 11-0601',
    measurements: {},
    stitchType: '301 Lockstitch',
    stitchDensity: '12 SPI',
    seamAllowance: 1.5,
    bom: [{ item: 'Main Fabric', description: '', quantity: '1.5 meters' }],
    aiDescription: '',
    constructionNotes: '',
    status: 'draft',
    approvalLog: [],
    messages: [],
    sharedWith: [],
    mockupColor: '#f5f5f5',
    backgroundColor: '#ffffff',
    isMoving: true,
    zoom: 8,
    animationType: 'float',
    isClay: false,
    environmentPreset: 'city',
    showReflections: false,
    atmosphericEffect: 'none',
    createdBy: 'designer',
    updatedAt: Date.now(),
    createdAt: Date.now(),
  }
}

export const TechPackService = {
  getAll: (): TechPack[] => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
    catch { return [] }
  },
  save: (tp: TechPack): TechPack => {
    const all = TechPackService.getAll()
    const idx = all.findIndex(t => t.id === tp.id)
    const updated = { ...tp, updatedAt: Date.now() }
    if (idx >= 0) all[idx] = updated; else all.unshift(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return updated
  },
  delete: (id: string) => {
    const all = TechPackService.getAll().filter(t => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  },
  getById: (id: string) => TechPackService.getAll().find(t => t.id === id),
  addMessage: (tpId: string, msg: TechPackMessage) => {
    const tp = TechPackService.getById(tpId)
    if (!tp) return
    tp.messages = [...(tp.messages || []), msg]
    TechPackService.save(tp)
  },
  updateStatus: (tpId: string, status: TechPack['status'], changedBy: string, note?: string) => {
    const tp = TechPackService.getById(tpId)
    if (!tp) return
    tp.status = status
    tp.approvalLog = [...(tp.approvalLog || []), { status, changedBy, timestamp: Date.now(), note }]
    if (status === 'approved') tp.approvedBy = changedBy
    TechPackService.save(tp)
  },
}

export function calculateGarmentCost(tp: TechPack): number {
  const FC: Record<string, number> = {
    'cotton-100': 180, 'cotton-poly': 150, 'denim-light': 220,
    'denim-stretch': 280, 'silk': 800, 'linen': 350,
    'polyester': 120, 'spandex-blend': 200, 'wool-blend': 450,
    'viscose': 160, 'nylon': 130,
  }
  const MC: Record<string, number> = {
    'tshirt-crew': 80, 'tshirt-vneck': 80, 'tshirt-polo': 100,
    'shirt-formal': 150, 'shirt-casual': 130, 'hoodie-pullover': 250,
    'hoodie-zip': 300, 'jacket-bomber': 450, 'jacket-denim': 400,
    'kurta-straight': 200, 'kurta-anarkali': 280, 'blouse-casual': 120,
    'jeans-slim': 180, 'pants-chino': 150, 'pants-formal': 170,
    'shorts-casual': 90, 'dress-maxi': 300, 'dress-midi': 260,
    'coat-trench': 550, 'coat-wool': 600,
  }
  const fc = FC[tp.fabricId] || 200
  const qty = parseFloat(tp.bom?.find(b => b.item === 'Main Fabric')?.quantity || '1.5')
  return Math.round(fc * qty + (MC[tp.garmentType] || 100) + 30)
}

export function formatRelativeTime(ts: number): string {
  const d = Date.now() - ts
  const s = Math.floor(d/1000), m = Math.floor(s/60), h = Math.floor(m/60), dy = Math.floor(h/24)
  if (dy > 0) return `${dy}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}
