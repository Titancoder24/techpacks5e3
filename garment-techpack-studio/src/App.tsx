import { Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "@/layouts/DashboardLayout"
import UserLayout from "@/layouts/UserLayout"
import Overview from "@/pages/Overview"
import AIGenerator from "@/pages/admin/AIGenerator"
import StyleVault from "@/pages/user/StyleVault"
import TechPackEditor from "@/pages/user/TechPackEditor"
import Approvals from "@/pages/user/Approvals"
import BuyerReviewPage from "@/pages/BuyerReviewPage"
import GarmentLibrary from "@/pages/GarmentLibrary"
import TeamPage from "@/pages/TeamPage"
import { TechPackService, type TechPack } from "@/lib/techpack"
import { CollabService } from "@/lib/collaboration"

const SEED_KEY = 'techpack_studio_seeded'

export function seedDataIfEmpty() {
  if (localStorage.getItem(SEED_KEY)) return
  const existing = TechPackService.getAll()
  if (existing.length > 0) {
    localStorage.setItem(SEED_KEY, 'true')
    return
  }

  const now = Date.now()

  const packs: TechPack[] = [
    {
      id: 'seed-1',
      styleName: 'Summer Breeze Tee',
      styleNumber: 'TP-2025-0001',
      season: 'SS25',
      garmentType: 'tshirt-crew',
      fabricId: 'cotton-100',
      fabricColor: '#0f4c81',
      pantoneCode: 'PMS 19-4150',
      measurements: { chest: 104, waist: 96, shoulder: 46, sleeveLength: 22, length: 72 },
      stitchType: '301 Lockstitch',
      stitchDensity: '12 SPI',
      seamAllowance: 1.5,
      bom: [
        { item: 'Main Fabric', description: '100% Cotton Jersey', quantity: '1.5 meters' },
        { item: 'Sewing Thread', description: 'Polyester core-spun', quantity: '2 cones' },
        { item: 'Labels', description: 'Woven main label + care label', quantity: '2 pcs' },
      ],
      aiDescription: 'Classic crew neck tee in Classic Blue',
      constructionNotes: 'Double-needle hem at bottom and sleeves. Neck rib 1x1 construction. Shoulder tape reinforcement.',
      status: 'approved',
      approvedBy: 'Sarah K.',
      approvalLog: [
        { status: 'draft', changedBy: 'Designer', timestamp: now - 86400000 * 5 },
        { status: 'sent_to_buyer', changedBy: 'Designer', timestamp: now - 86400000 * 4 },
        { status: 'approved', changedBy: 'Sarah K.', timestamp: now - 86400000 * 2 },
      ],
      messages: [
        { id: 'm1', userId: 'u1', userName: 'You (Designer)', userRole: 'designer', text: 'Tech pack ready for review. Classic blue colorway.', timestamp: now - 86400000 * 4 },
        { id: 'm2', userId: 'u2', userName: 'Sarah K.', userRole: 'buyer', text: 'Looks great. Approved for production.', timestamp: now - 86400000 * 2 },
      ],
      sharedWith: ['u2'],
      mockupColor: '#0f4c81',
      backgroundColor: '#ffffff',
      isMoving: true,
      zoom: 8,
      animationType: 'float',
      isClay: false,
      environmentPreset: 'city',
      showReflections: false,
      atmosphericEffect: 'none',
      createdBy: 'designer',
      updatedAt: now - 86400000 * 2,
      createdAt: now - 86400000 * 5,
    },
    {
      id: 'seed-2',
      styleName: 'Urban Edge Hoodie',
      styleNumber: 'TP-2025-0002',
      season: 'AW25',
      garmentType: 'hoodie-pullover',
      fabricId: 'cotton-poly',
      fabricColor: '#1a1a1a',
      pantoneCode: 'PMS 19-3911',
      measurements: { chest: 116, waist: 108, shoulder: 52, sleeveLength: 64, length: 70 },
      stitchType: '504 Overlock',
      stitchDensity: '10 SPI',
      seamAllowance: 1.5,
      bom: [
        { item: 'Main Fabric', description: 'Cotton/Poly Fleece 320gsm', quantity: '2.2 meters' },
        { item: 'Rib Knit', description: '2x2 Rib for cuffs and hem', quantity: '0.5 meters' },
        { item: 'Drawcord', description: 'Cotton flat drawcord', quantity: '1.2 meters' },
        { item: 'Labels', description: 'Woven main + care', quantity: '2 pcs' },
      ],
      aiDescription: 'Oversized streetwear hoodie in Jet Black',
      constructionNotes: 'Oversized fit. Kangaroo pocket with bartack reinforcement. Hood with drawcord channel. Triple-needle coverstitch at hem.',
      status: 'buyer_reviewing',
      approvalLog: [
        { status: 'draft', changedBy: 'Designer', timestamp: now - 86400000 * 3 },
        { status: 'sent_to_buyer', changedBy: 'Designer', timestamp: now - 86400000 * 2 },
        { status: 'buyer_reviewing', changedBy: 'System', timestamp: now - 86400000 },
      ],
      messages: [
        { id: 'm3', userId: 'u1', userName: 'You (Designer)', userRole: 'designer', text: 'New hoodie design. Oversized silhouette with dropped shoulders.', timestamp: now - 86400000 * 2 },
        { id: 'm4', userId: 'u4', userName: 'Mark T.', userRole: 'buyer', text: 'Can we see a mock in charcoal as well?', timestamp: now - 86400000 },
        { id: 'm5', userId: 'u1', userName: 'You (Designer)', userRole: 'designer', text: 'Sure, will prepare an alternate colorway.', timestamp: now - 43200000 },
      ],
      sharedWith: ['u4'],
      mockupColor: '#1a1a1a',
      backgroundColor: '#ffffff',
      isMoving: true,
      zoom: 8,
      animationType: 'hero-float-pro',
      isClay: false,
      environmentPreset: 'city',
      showReflections: false,
      atmosphericEffect: 'none',
      createdBy: 'designer',
      updatedAt: now - 43200000,
      createdAt: now - 86400000 * 3,
    },
    {
      id: 'seed-3',
      styleName: 'Heritage Denim Jacket',
      styleNumber: 'TP-2025-0003',
      season: 'AW25',
      garmentType: 'jacket-denim',
      fabricId: 'denim-stretch',
      fabricColor: '#1B2A4A',
      pantoneCode: 'PMS 19-4241',
      measurements: { chest: 110, waist: 104, shoulder: 48, sleeveLength: 62, length: 65 },
      stitchType: '401 Chain Stitch',
      stitchDensity: '8 SPI',
      seamAllowance: 1.5,
      bom: [
        { item: 'Main Fabric', description: 'Stretch Denim 12oz', quantity: '2.8 meters' },
        { item: 'Buttons', description: 'Metal shank buttons, antique brass', quantity: '8 pcs' },
        { item: 'Rivets', description: 'Copper rivets', quantity: '6 pcs' },
        { item: 'Labels', description: 'Leather back patch + woven', quantity: '2 pcs' },
      ],
      aiDescription: 'Classic heritage denim jacket',
      constructionNotes: 'Fell seam construction on body. Bar-tack at all stress points. Antique brass hardware. Stone wash finish.',
      status: 'revision_needed',
      approvalLog: [
        { status: 'draft', changedBy: 'Designer', timestamp: now - 86400000 * 7 },
        { status: 'sent_to_buyer', changedBy: 'Designer', timestamp: now - 86400000 * 5 },
        { status: 'revision_needed', changedBy: 'Sarah K.', timestamp: now - 86400000 * 3, note: 'Need to adjust sleeve length and add inside pocket' },
      ],
      messages: [
        { id: 'm6', userId: 'u2', userName: 'Sarah K.', userRole: 'buyer', text: 'Please add an inside pocket and extend sleeve length by 2cm.', timestamp: now - 86400000 * 3 },
      ],
      sharedWith: ['u2'],
      mockupColor: '#1B2A4A',
      backgroundColor: '#ffffff',
      isMoving: true,
      zoom: 8,
      animationType: 'orbit-slow',
      isClay: false,
      environmentPreset: 'city',
      showReflections: false,
      atmosphericEffect: 'none',
      createdBy: 'designer',
      updatedAt: now - 86400000 * 3,
      createdAt: now - 86400000 * 7,
    },
    {
      id: 'seed-4',
      styleName: 'Festive Anarkali',
      styleNumber: 'TP-2025-0004',
      season: 'SS25',
      garmentType: 'kurta-anarkali',
      fabricId: 'viscose',
      fabricColor: '#CE2939',
      pantoneCode: 'PMS 19-1664',
      measurements: { chest: 92, waist: 80, hip: 96, shoulder: 38, length: 120 },
      stitchType: '301 Lockstitch',
      stitchDensity: '14 SPI',
      seamAllowance: 1.0,
      bom: [
        { item: 'Main Fabric', description: 'Viscose Rayon', quantity: '3.5 meters' },
        { item: 'Lining', description: 'Cotton voile lining', quantity: '2.0 meters' },
        { item: 'Embroidery Thread', description: 'Gold zari thread', quantity: '3 cones' },
        { item: 'Labels', description: 'Satin printed label', quantity: '1 pc' },
      ],
      aiDescription: 'Festive anarkali kurta in tomato red',
      constructionNotes: 'Flared silhouette with godets. Zari embroidery on yoke and sleeves. French seam finish throughout. Concealed back zipper.',
      status: 'draft',
      approvalLog: [
        { status: 'draft', changedBy: 'Designer', timestamp: now - 86400000 },
      ],
      messages: [],
      sharedWith: [],
      mockupColor: '#CE2939',
      backgroundColor: '#ffffff',
      isMoving: true,
      zoom: 8,
      animationType: 'swing',
      isClay: false,
      environmentPreset: 'city',
      showReflections: false,
      atmosphericEffect: 'none',
      createdBy: 'designer',
      updatedAt: now - 86400000,
      createdAt: now - 86400000,
    },
  ]

  packs.forEach(p => TechPackService.save(p))

  CollabService.sendGlobalMessage({ userId: 'u2', userName: 'Sarah K.', avatar: 'S', text: 'Just approved the Summer Breeze Tee. Great work on the colorway!' })
  CollabService.sendGlobalMessage({ userId: 'u6', userName: 'Raj V.', avatar: 'R', text: 'Factory line 3 is ready for the next batch. Send approved packs when ready.' })
  CollabService.sendGlobalMessage({ userId: 'u1', userName: 'You (Designer)', avatar: 'D', text: 'Working on the AW25 collection. Two new styles coming this week.' })

  localStorage.setItem(SEED_KEY, 'true')
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserLayout />}>
        <Route index element={<StyleVault />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="garments" element={<GarmentLibrary />} />
      </Route>
      <Route path="/editor" element={<TechPackEditor />} />
      <Route path="/editor/:id" element={<TechPackEditor />} />
      <Route path="/review/:id" element={<BuyerReviewPage />} />
      <Route path="/admin" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="generator" element={<AIGenerator />} />
        <Route path="garments" element={<GarmentLibrary />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
