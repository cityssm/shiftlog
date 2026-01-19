import type { Request } from 'express'

import { getConfigProperty } from './config.helpers.js'

let applicationUrl = getConfigProperty('application.applicationUrl')

/**
 * Get the application URL, including the reverse proxy URL prefix if set.
 * @param request The request object
 * @returns The application URL
 */
export function getApplicationUrl(request?: Request): string {
  if (
    (applicationUrl === undefined || applicationUrl === '') &&
    request !== undefined
  ) {
    applicationUrl = `http://${request.hostname}${
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      getConfigProperty('application.httpPort') === 80
        ? ''
        : `:${getConfigProperty('application.httpPort')}`
    }${getConfigProperty('reverseProxy.urlPrefix')}`
  }

  return (
    applicationUrl ??
    `http://localhost:${getConfigProperty('application.httpPort')}${getConfigProperty('reverseProxy.urlPrefix')}`
  )
}

export function getWorkOrderUrl(workOrderId: number | string): string {
  return `${getApplicationUrl()}/${getConfigProperty('workOrders.router')}/${workOrderId}`
}
