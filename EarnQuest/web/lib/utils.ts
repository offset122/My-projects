export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toFixed(2)}`
}

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return `KES ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `KES ${(amount / 1000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-KE', {
    month: 'short',
    day: 'numeric',
  })
}

export const validateEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return pattern.test(email)
}

export const validateKenyanPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s/g, '')
  const patterns = [
    /^\+254[17]\d{8}$/,  // +254 format
    /^254[17]\d{8}$/,    // 254 format
    /^0[17]\d{8}$/       // 0 format
  ]
  return patterns.some(pattern => pattern.test(cleanPhone))
}

export const normalizeKenyanPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\s/g, '')
  
  if (cleanPhone.startsWith('0')) {
    return '+254' + cleanPhone.slice(1)
  } else if (cleanPhone.startsWith('254')) {
    return '+' + cleanPhone
  } else if (cleanPhone.startsWith('+254')) {
    return cleanPhone
  } else {
    return '+254' + cleanPhone
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}
