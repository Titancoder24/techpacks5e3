import jsPDF from 'jspdf'
import type { TechPack } from './techpack'
import { calculateGarmentCost } from './techpack'
import { GARMENT_REGISTRY, FABRIC_REGISTRY } from './garment-registry'

export async function exportTechPackPDF(tp: TechPack, canvasElement?: HTMLCanvasElement) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
  const fabric = FABRIC_REGISTRY.find(f => f.id === tp.fabricId)
  const cost = calculateGarmentCost(tp)

  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('TECH PACK', 20, 25)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Style: ${tp.styleName}`, 20, 35)
  doc.text(`Style #: ${tp.styleNumber}`, 20, 42)
  doc.text(`Season: ${tp.season}`, 20, 49)
  doc.text(`Garment: ${garment?.name || tp.garmentType}`, 20, 56)
  doc.text(`Fabric: ${fabric?.name || tp.fabricId} (${fabric?.gsm || ''} GSM)`, 20, 63)
  doc.text(`Pantone: ${tp.pantoneCode}`, 20, 70)
  doc.text(`Status: ${tp.status.replace(/_/g, ' ').toUpperCase()}`, 20, 77)
  doc.text(`Est. Cost: Rs.${cost}`, 20, 84)

  if (canvasElement) {
    const imgData = canvasElement.toDataURL('image/jpeg', 0.8)
    doc.addImage(imgData, 'JPEG', 20, 95, 170, 100)
  }

  doc.addPage()
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('MEASUREMENTS (cm)', 20, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let y = 30
  Object.entries(tp.measurements || {}).forEach(([key, val]) => {
    if (val) {
      doc.text(`${key.replace(/([A-Z])/g, ' $1').trim()}: ${val} cm`, 20, y)
      y += 7
    }
  })

  y += 10
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL OF MATERIALS', 20, y)
  y += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  ;(tp.bom || []).forEach(item => {
    doc.text(`${item.item}: ${item.description} -- ${item.quantity}`, 20, y)
    y += 7
  })

  doc.addPage()
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('CONSTRUCTION NOTES', 20, 20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const lines = doc.splitTextToSize(tp.constructionNotes || 'No notes provided.', 170)
  doc.text(lines, 20, 30)
  doc.text(`Stitch Type: ${tp.stitchType}`, 20, 30 + lines.length * 5 + 10)
  doc.text(`Seam Allowance: ${tp.seamAllowance} cm`, 20, 30 + lines.length * 5 + 17)

  doc.setFontSize(60)
  doc.setTextColor(230, 230, 230)
  doc.text(tp.styleNumber, 105, 200, { align: 'center', angle: 45 })

  doc.save(`${tp.styleNumber}-${tp.styleName.replace(/\s+/g, '-')}.pdf`)
}
