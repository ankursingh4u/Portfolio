// Local ClassValue type definition (no external dependency needed)
type ClassValue = string | number | boolean | undefined | null | ClassValue[] | { [key: string]: boolean | undefined | null }

// Simple cn utility without external dependencies
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === 'string' && x.trim() !== '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Simple clsx implementation if not using the package
function clsx(...args: ClassValue[]): string {
  const classes: string[] = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string') {
      classes.push(arg)
    } else if (typeof arg === 'number') {
      classes.push(String(arg))
    } else if (Array.isArray(arg)) {
      const inner = clsx(...arg)
      if (inner) classes.push(inner)
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key as keyof typeof arg]) {
          classes.push(key)
        }
      }
    }
  }

  return classes.join(' ')
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })
}

export function getTimestamp(): string {
  const now = new Date()
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function generateMailtoLink(
  email: string,
  subject?: string,
  body?: string
): string {
  const params = new URLSearchParams()
  if (subject) params.append('subject', subject)
  if (body) params.append('body', body)

  const queryString = params.toString()
  return `mailto:${email}${queryString ? `?${queryString}` : ''}`
}

export function generateGmailLink(
  to: string,
  subject?: string,
  body?: string
): string {
  const params = new URLSearchParams()
  params.append('to', to)
  if (subject) params.append('su', subject)
  if (body) params.append('body', body)

  return `https://mail.google.com/mail/?view=cm&${params.toString()}`
}
