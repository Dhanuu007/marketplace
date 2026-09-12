import {
  saveUserMemory,
} from './chatbotMemory.repository.js'


// =========================================================
// DETECT NAME MEMORY
// =========================================================

function detectNameMemory(message) {
  const patterns = [
    /\bmy name is\s+(.+)$/i,
    /\bi am\s+(.+)$/i,
    /\bi'm\s+(.+)$/i,
    /\bcall me\s+(.+)$/i,
  ]


  for (const pattern of patterns) {
    const match =
      String(message ?? '')
        .trim()
        .match(pattern)

    if (!match) {
      continue
    }


    const name =
      match[1]
        .trim()
        .replace(/[.!?]+$/, '')


    if (
      !name ||
      name.length > 100
    ) {
      return null
    }


    return name
  }


  return null
}


// =========================================================
// PROCESS USER MEMORY
// =========================================================

export async function processUserMemory({
  user,
  message,
}) {
  if (!user?.id) {
    return null
  }


  const name =
    detectNameMemory(
      message,
    )


  if (!name) {
    return null
  }


  return saveUserMemory({
    userId: user.id,
    key: 'name',
    value: name,
  })
}