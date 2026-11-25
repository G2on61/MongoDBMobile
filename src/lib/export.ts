import type { JsonObject, JsonValue } from '../types.ts'

function formatCell(value: JsonValue | undefined): string {
  if (value === undefined) {
    return ''
  }
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

function escapeCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

export function toCsv(documents: JsonObject[]): string {
  const keys = [...new Set(documents.flatMap((document) => Object.keys(document)))].sort()
  const lines = [keys.map(escapeCell).join(',')]

  for (const document of documents) {
    lines.push(keys.map((key) => escapeCell(formatCell(document[key]))).join(','))
  }

  return lines.join('\r\n')
}

export function downloadCsv(documents: JsonObject[], prefix = 'mongodbmobile'): void {
  const blob = new Blob([`\uFEFF${toCsv(documents)}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${prefix}-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
