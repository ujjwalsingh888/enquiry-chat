export type Role = 'user' | 'assistant'
export type MessageStatus = 'streaming' | 'done' | 'error'

export interface Message {
  id: string
  role: Role
  content: string
  status: MessageStatus
  createdAt: number
}

export interface Property {
  id: string
  number: string
  address: string
  rent: string
}

export interface Conversation {
  id: string
  property: Property
  messages: Message[]
  updatedAt: number
}

export interface ChatState {
  conversations: Conversation[]
  activeId: string
}
