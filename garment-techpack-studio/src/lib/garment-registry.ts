import {
  Shirt, ShoppingBag, Wind, Sparkles
} from "lucide-react"

export interface GarmentTemplate {
  id: string
  name: string
  type: 'top' | 'bottom' | 'dress' | 'outer'
  category: string
  icon: any
}

export interface FabricType {
  id: string
  name: string
  gsm: string
  stretch: boolean
}

export interface PantoneColor {
  code: string
  name: string
  hex: string
}

export const GARMENT_REGISTRY: GarmentTemplate[] = [
  { id: 'tshirt-crew', name: 'Crew Neck T-Shirt', type: 'top', category: 'Basic', icon: Shirt },
  { id: 'tshirt-vneck', name: 'V-Neck T-Shirt', type: 'top', category: 'Basic', icon: Shirt },
  { id: 'tshirt-polo', name: 'Polo T-Shirt', type: 'top', category: 'Basic', icon: Shirt },
  { id: 'shirt-formal', name: 'Formal Shirt', type: 'top', category: 'Formal', icon: Shirt },
  { id: 'shirt-casual', name: 'Casual Shirt', type: 'top', category: 'Casual', icon: Shirt },
  { id: 'hoodie-pullover', name: 'Pullover Hoodie', type: 'top', category: 'Casual', icon: Shirt },
  { id: 'hoodie-zip', name: 'Zip-Up Hoodie', type: 'top', category: 'Casual', icon: Shirt },
  { id: 'jacket-bomber', name: 'Bomber Jacket', type: 'top', category: 'Outerwear', icon: Shirt },
  { id: 'jacket-denim', name: 'Denim Jacket', type: 'top', category: 'Outerwear', icon: Shirt },
  { id: 'kurta-straight', name: 'Straight Kurta', type: 'top', category: 'Ethnic', icon: Shirt },
  { id: 'kurta-anarkali', name: 'Anarkali Kurta', type: 'top', category: 'Ethnic', icon: Shirt },
  { id: 'blouse-casual', name: 'Casual Blouse', type: 'top', category: 'Women', icon: Shirt },
  { id: 'jeans-slim', name: 'Slim Fit Jeans', type: 'bottom', category: 'Denim', icon: ShoppingBag },
  { id: 'jeans-straight', name: 'Straight Jeans', type: 'bottom', category: 'Denim', icon: ShoppingBag },
  { id: 'pants-chino', name: 'Chino Pants', type: 'bottom', category: 'Casual', icon: ShoppingBag },
  { id: 'pants-formal', name: 'Formal Trousers', type: 'bottom', category: 'Formal', icon: ShoppingBag },
  { id: 'shorts-casual', name: 'Casual Shorts', type: 'bottom', category: 'Casual', icon: ShoppingBag },
  { id: 'skirt-aline', name: 'A-Line Skirt', type: 'bottom', category: 'Women', icon: ShoppingBag },
  { id: 'leggings', name: 'Leggings', type: 'bottom', category: 'Active', icon: ShoppingBag },
  { id: 'dress-maxi', name: 'Maxi Dress', type: 'dress', category: 'Women', icon: Sparkles },
  { id: 'dress-midi', name: 'Midi Dress', type: 'dress', category: 'Women', icon: Sparkles },
  { id: 'dress-mini', name: 'Mini Dress', type: 'dress', category: 'Women', icon: Sparkles },
  { id: 'dress-shirt', name: 'Shirt Dress', type: 'dress', category: 'Women', icon: Sparkles },
  { id: 'salwar-suit', name: 'Salwar Suit', type: 'dress', category: 'Ethnic', icon: Sparkles },
  { id: 'coat-trench', name: 'Trench Coat', type: 'outer', category: 'Outerwear', icon: Wind },
  { id: 'coat-wool', name: 'Wool Coat', type: 'outer', category: 'Outerwear', icon: Wind },
  { id: 'vest-puffer', name: 'Puffer Vest', type: 'outer', category: 'Active', icon: Wind },
]

export const FABRIC_REGISTRY: FabricType[] = [
  { id: 'cotton-100', name: '100% Cotton', gsm: '150-180', stretch: false },
  { id: 'cotton-poly', name: 'Cotton Poly Mix', gsm: '160-200', stretch: false },
  { id: 'denim-light', name: 'Light Denim', gsm: '280-320', stretch: false },
  { id: 'denim-stretch', name: 'Stretch Denim', gsm: '300-340', stretch: true },
  { id: 'polyester', name: 'Polyester', gsm: '120-160', stretch: false },
  { id: 'spandex-blend', name: 'Spandex Blend', gsm: '160-200', stretch: true },
  { id: 'linen', name: 'Linen', gsm: '140-180', stretch: false },
  { id: 'silk', name: 'Silk', gsm: '80-120', stretch: false },
  { id: 'wool-blend', name: 'Wool Blend', gsm: '280-380', stretch: false },
  { id: 'viscose', name: 'Viscose', gsm: '120-160', stretch: false },
  { id: 'nylon', name: 'Nylon', gsm: '70-120', stretch: true },
]

export const PANTONE_COLORS: PantoneColor[] = [
  { code: 'PMS 19-3911', name: 'Jet Black', hex: '#1a1a1a' },
  { code: 'PMS 11-0601', name: 'Bright White', hex: '#f5f5f5' },
  { code: 'PMS 19-4150', name: 'Classic Blue', hex: '#0f4c81' },
  { code: 'PMS 18-1660', name: 'Living Coral', hex: '#FF6B6B' },
  { code: 'PMS 15-0343', name: 'Greenery', hex: '#88B04B' },
  { code: 'PMS 18-3838', name: 'Ultra Violet', hex: '#5F4B8B' },
  { code: 'PMS 16-1546', name: 'Peach Pink', hex: '#F7A07A' },
  { code: 'PMS 19-1664', name: 'Tomato Red', hex: '#CE2939' },
  { code: 'PMS 15-1062', name: 'Saffron', hex: '#FFA500' },
  { code: 'PMS 19-4241', name: 'Navy Blue', hex: '#1B2A4A' },
  { code: 'PMS 17-1230', name: 'Caramel', hex: '#C68642' },
  { code: 'PMS 14-4122', name: 'Baby Blue', hex: '#B0C4DE' },
]

export const STITCH_TYPES = [
  '301 Lockstitch', '401 Chain Stitch', '504 Overlock',
  '516 Safety Stitch', '602 Coverstitch', '605 Flatlock'
]

export const GARMENT_CATEGORIES = ['All', 'Basic', 'Casual', 'Formal', 'Outerwear', 'Ethnic', 'Women', 'Denim', 'Active']

export const ANIMATION_REGISTRY = [
  { id: 'none', name: 'Static' }, { id: 'float', name: 'Float' },
  { id: 'spin', name: 'Spin' }, { id: 'tilt', name: 'Tilt' },
  { id: 'hero-reveal', name: 'Hero Reveal' }, { id: 'orbit-slow', name: 'Slow Orbit' },
  { id: 'hover-card', name: 'Hover Card' }, { id: 'bounce-entry', name: 'Bounce' },
  { id: 'wobble', name: 'Wobble' }, { id: 'jelly', name: 'Jelly' },
  { id: 'swing', name: 'Swing' }, { id: 'heartbeat', name: 'Heartbeat' },
  { id: 'iso-float', name: 'Isometric Float' }, { id: 'figure-8', name: 'Figure 8' },
  { id: 'pendulum', name: 'Pendulum' }, { id: 'wave', name: 'Wave' },
  { id: 'expand', name: 'Expand' }, { id: 'saas-orbiter', name: 'SaaS Orbiter' },
  { id: 'hero-float-pro', name: 'Hero Float Pro' }, { id: 'liquid-metal', name: 'Liquid Metal' },
]
