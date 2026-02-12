import type { Request, Response } from 'express'

import getWorkOrderAccomplishmentStats from '../../database/workOrders/getWorkOrderAccomplishmentStats.js'

interface RequestBody {
  filterType: 'month' | 'year'
  month?: string
  year: string
}

export default async function handler(
  request: Request<unknown, unknown, RequestBody>,
  response: Response
): Promise<void> {
  const { filterType, month, year } = request.body

  try {
    const yearNumber = Number.parseInt(year, 10)
    
    let startDate: Date
    let endDate: Date

    if (filterType === 'month' && month !== undefined) {
      const monthNumber = Number.parseInt(month, 10)
      startDate = new Date(yearNumber, monthNumber - 1, 1)
      endDate = new Date(yearNumber, monthNumber, 0) // Last day of month
    } else {
      // Year filter
      startDate = new Date(yearNumber, 0, 1)
      endDate = new Date(yearNumber, 11, 31)
    }

    const data = await getWorkOrderAccomplishmentStats(
      startDate,
      endDate,
      filterType,
      request.session.user
    )

    response.json({
      data,
      success: true
    })
  } catch {
    response.json({
      errorMessage: 'Error fetching accomplishment data',
      success: false
    })
  }
}
