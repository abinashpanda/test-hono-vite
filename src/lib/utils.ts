export function safeParseJSON(data: unknown) {
  try {
    return JSON.parse(String(data))
  } catch {
    return {}
  }
}
