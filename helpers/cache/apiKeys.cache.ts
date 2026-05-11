/* eslint-disable security/detect-object-injection */

import getApiKeys from '../../database/users/getApiKeys.js'

let apiKeys: Record<string, string> = {}

export async function getCachedApiKeys(): Promise<Record<string, string>> {
  if (Object.keys(apiKeys).length === 0) {
    // eslint-disable-next-line require-atomic-updates
    apiKeys = await getApiKeys()
  }

  return apiKeys
}

export async function getApiKeyByUserName(
  userName: string
): Promise<string | undefined> {
  const cachedKeys = await getCachedApiKeys()

  return cachedKeys[userName]
}

export async function getUserNameFromApiKey(
  apiKey: string
): Promise<string | undefined> {
  const cachedKeys = await getCachedApiKeys()

  return Object.keys(cachedKeys).find(
    (userName) => cachedKeys[userName] === apiKey
  )
}

export function clearApiKeysCache(): void {
  apiKeys = {}
}
