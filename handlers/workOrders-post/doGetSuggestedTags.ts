import type { Request, Response } from 'express'

import getSuggestedTags from '../../database/workOrders/getSuggestedTags.js'

interface SuggestedTag {
  tagBackgroundColor?: string
  tagName: string
  tagTextColor?: string
  usageCount: number
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetSuggestedTagsResponse = {
  success: true
  suggestedTags: SuggestedTag[]
}

const suggestedTagsLimit = 10

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetSuggestedTagsResponse>
): Promise<void> {
  const suggestedTags = await getSuggestedTags(
    Number(request.params.workOrderId),
    suggestedTagsLimit
  )

  response.json({
    success: true,
    suggestedTags
  })
}
