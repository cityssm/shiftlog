import type { Request, Response } from 'express'

export default function handler(
  request: Request,
  response: Response
): void {
  // Initial load with current month as default
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  response.render('workOrders/accomplishments', {
    headTitle: 'Work Order Accomplishments',
    section: 'workOrders',
    currentYear,
    currentMonth
  })
}
