import type { Request, Response } from 'express'

import getSuggestedTags from '../../database/workOrders/getSuggestedTags.js'

interface SuggestedTag {
  tagName: string
  tagBackgroundColor?: string
  tagTextColor?: string
  usageCount: number
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoGetSuggestedTagsResponse = {
  success: true
  suggestedTags: SuggestedTag[]
}

export default async function handler(
  request: Request<{ workOrderId: string }>,
  response: Response<DoGetSuggestedTagsResponse>
): Promise<void> {
  const suggestedTags = await getSuggestedTags(
    Number(request.params.workOrderId),
    10
  )

  response.json({
    success: true,
    suggestedTags
  })
}
