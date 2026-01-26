import type { Request, Response } from 'express'

import updateSetting, {
  type UpdateSettingForm
} from '../../database/app/updateSetting.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- Works on client side.
export type DoUpdateSettingResponse = {
  success: boolean
}

export default async function handler(
  request: Request<unknown, unknown, UpdateSettingForm>,
  response: Response<DoUpdateSettingResponse>
): Promise<void> {
  const success = await updateSetting(request.body)

  response.json({
    success
  } satisfies DoUpdateSettingResponse)
}
