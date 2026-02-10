import type { Request, Response } from 'express'

import { getNoteTypeTemplates } from '../../helpers/noteTypeTemplates.helpers.js'
import type { NoteTypeTemplate } from '../../types/noteTypeTemplates.types.js'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type DoGetNoteTypeTemplatesResponse = {
  templates: NoteTypeTemplate[]
}

export default function handler(
  _request: Request,
  response: Response<DoGetNoteTypeTemplatesResponse>
): void {
  const templates = getNoteTypeTemplates()

  response.json({
    templates
  })
}
