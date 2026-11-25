import type { JsonObject } from '../types.ts'

const users: JsonObject[] = [
  {
    _id: 'usr_1001',
    name: 'Amina Diallo',
    email: 'amina.diallo@example.com',
    city: 'Dakar',
    plan: 'pro',
    active: true,
    score: 92,
    createdAt: '2026-01-14T09:21:00.000Z',
    tags: ['vip', 'early-adopter'],
  },
  {
    _id: 'usr_1002',
    name: 'Lucas Moreau',
    email: 'lucas.moreau@example.com',
    city: 'Lyon',
    plan: 'free',
    active: true,
    score: 41,
    createdAt: '2026-02-02T17:45:00.000Z',
    tags: ['newsletter'],
  },
  {
    _id: 'usr_1003',
    name: 'Sofia Benali',
    email: 'sofia.benali@example.com',
    city: 'Casablanca',
    plan: 'pro',
    active: false,
    score: 78,
    createdAt: '2026-02-19T08:05:00.000Z',
    tags: ['vip'],
  },
  {
    _id: 'usr_1004',
    name: 'Kenji Tanaka',
    email: 'kenji.tanaka@example.com',
    city: 'Osaka',
    plan: 'team',
    active: true,
    score: 65,
    createdAt: '2026-03-03T12:30:00.000Z',
    tags: ['beta', 'newsletter'],
  },
  {
    _id: 'usr_1005',
    name: 'Marta Silva',
    email: 'marta.silva@example.com',
    city: 'Lisbonne',
    plan: 'free',
    active: true,
    score: 23,
    createdAt: '2026-03-21T19:10:00.000Z',
    tags: [],
  },
]

const orders: JsonObject[] = [
  {
    _id: 'ord_5001',
    userId: 'usr_1001',
    total: 149.9,
    currency: 'EUR',
    status: 'delivered',
    items: 3,
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    _id: 'ord_5002',
    userId: 'usr_1002',
    total: 39.0,
    currency: 'EUR',
    status: 'pending',
    items: 1,
    createdAt: '2026-04-02T11:12:00.000Z',
  },
  {
    _id: 'ord_5003',
    userId: 'usr_1004',
    total: 289.5,
    currency: 'JPY',
    status: 'shipped',
    items: 7,
    createdAt: '2026-04-03T15:48:00.000Z',
  },
  {
    _id: 'ord_5004',
    userId: 'usr_1003',
    total: 75.2,
    currency: 'EUR',
    status: 'cancelled',
    items: 2,
    createdAt: '2026-04-05T07:33:00.000Z',
  },
]

const products: JsonObject[] = [
  {
    _id: 'prd_9001',
    name: 'Casque Studio',
    category: 'audio',
    price: 129.0,
    stock: 14,
    rating: 4.6,
  },
  {
    _id: 'prd_9002',
    name: 'Clavier mécanique',
    category: 'bureau',
    price: 89.9,
    stock: 3,
    rating: 4.3,
  },
  {
    _id: 'prd_9003',
    name: 'Écran 27 pouces',
    category: 'bureau',
    price: 249.0,
    stock: 0,
    rating: 4.8,
  },
  {
    _id: 'prd_9004',
    name: 'Micro USB-C',
    category: 'audio',
    price: 49.0,
    stock: 27,
    rating: 4.1,
  },
]

const events: JsonObject[] = [
  { _id: 'evt_1', type: 'login', userId: 'usr_1001', durationMs: 240, ok: true },
  { _id: 'evt_2', type: 'search', userId: 'usr_1002', durationMs: 88, ok: true },
  { _id: 'evt_3', type: 'checkout', userId: 'usr_1001', durationMs: 1200, ok: false },
  { _id: 'evt_4', type: 'search', userId: 'usr_1004', durationMs: 132, ok: true },
  { _id: 'evt_5', type: 'login', userId: 'usr_1005', durationMs: 310, ok: true },
]

const sessions: JsonObject[] = [
  {
    _id: 'ses_1',
    userId: 'usr_1001',
    device: 'iOS',
    country: 'SN',
    startedAt: '2026-04-01T08:00:00.000Z',
    active: true,
  },
  {
    _id: 'ses_2',
    userId: 'usr_1003',
    device: 'Android',
    country: 'MA',
    startedAt: '2026-04-01T09:30:00.000Z',
    active: false,
  },
  {
    _id: 'ses_3',
    userId: 'usr_1004',
    device: 'Web',
    country: 'JP',
    startedAt: '2026-04-02T13:15:00.000Z',
    active: false,
  },
]

export const demoCollections: Record<string, Record<string, JsonObject[]>> = {
  shop: { users, orders, products },
  analytics: { events, sessions },
}

export const demoDatabases = Object.keys(demoCollections).sort()

export function getDemoCollections(database: string): string[] {
  return Object.keys(demoCollections[database] ?? {}).sort()
}

export function getDemoDocuments(database: string, collection: string): JsonObject[] {
  return demoCollections[database]?.[collection] ?? []
}
