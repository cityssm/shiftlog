import type { NextFunction, Request, Response } from 'express'

import { logApiRequest } from '../helpers/audit.helpers.js'
import { getUserNameFromApiKey } from '../helpers/cache/apiKeys.cache.js'
import { getConfigProperty } from '../helpers/config.helpers.js'
import { apiKeyIsValid, userIsAdmin } from '../helpers/user.helpers.js'

const urlPrefix = getConfigProperty('reverseProxy.urlPrefix')

const forbiddenStatus = 403

const forbiddenJSON = {
  message: 'Forbidden',
  success: false
}

const forbiddenRedirectUrl = `${urlPrefix}/dashboard/?error=accessDenied`

export function adminGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.redirect(forbiddenRedirectUrl)
}

export function adminPostHandler(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  if (userIsAdmin(request)) {
    next()
    return
  }

  response.status(forbiddenStatus).json(forbiddenJSON)
}

export async function apiGetHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const isValid = await apiKeyIsValid(request)
  const apiKey = request.params.apiKey
  let userName: string | undefined

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (isValid && apiKey !== undefined) {
    userName = await getUserNameFromApiKey(apiKey)
  }

  // Log the API request
  await logApiRequest({
    isValidApiKey: isValid,
    request,
    userName
  })

  if (isValid) {
    next()
  } else {
    response.redirect(`${urlPrefix}/login`)
  }
}
