import type { Request, Response } from 'express'

import updateSetting, {
  type UpdateSettingForm
} from '../../database/app/updateSetting.js'

export default async function handler(
  request: Request<unknown, unknown, UpdateSettingForm>,
  response: Response
): Promise<void> {
  const success = await updateSetting(request.body)

  response.json({
    success
  })
}
