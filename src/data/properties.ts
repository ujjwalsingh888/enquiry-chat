import type { Property } from '../types'

export const SAMPLE_PROPERTIES: Property[] = [
  { id: 'alder', number: '14', address: '14 Alder Court, Leeds', rent: '£1,150 pcm' },
  { id: 'marlow', number: '3', address: 'Flat 3, 22 Marlow Road, Manchester', rent: '£950 pcm' },
  { id: 'kiln', number: '7', address: '7 Kiln Lane, Bristol', rent: '£1,400 pcm' },
]

export const SUGGESTED_PROMPTS = [
  'How much is the deposit?',
  'Are pets allowed?',
  'Can I book a viewing?',
  'Who handles repairs?',
]
