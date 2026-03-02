import { openDB } from 'idb'
import type { DBSchema } from 'idb'

interface TechPackDB extends DBSchema {
  assets: {
    key: string
    value: { techPackId: string; file: Blob; type: 'image' | 'sketch' | 'print'; name: string; createdAt: number }
    indexes: { 'by-techpack': string }
  }
}

const DB_NAME = 'techpack-studio-db'
export const dbInit = async () => openDB<TechPackDB>(DB_NAME, 1, {
  upgrade(db) {
    const store = db.createObjectStore('assets', { keyPath: 'techPackId' })
    store.createIndex('by-techpack', 'techPackId')
  },
})

export const saveAsset = async (techPackId: string, file: Blob, type: 'image' | 'sketch' | 'print', name: string) => {
  const db = await dbInit()
  await db.put('assets', { techPackId, file, type, name, createdAt: Date.now() })
}

export const getAsset = async (techPackId: string) => {
  const db = await dbInit()
  return await db.get('assets', techPackId)
}

export const deleteAsset = async (techPackId: string) => {
  const db = await dbInit()
  await db.delete('assets', techPackId)
}
