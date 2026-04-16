import { Page } from '@playwright/test'

export function generateOrderCode() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  
    let prefix = ''
    let code = ''
  
    // 3 letras iniciais
    for (let i = 0; i < 3; i++) {
      prefix += letters.charAt(Math.floor(Math.random() * letters.length))
    }
  
    // 6 caracteres alfanuméricos
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  
    return `${prefix}-${code}`
  }