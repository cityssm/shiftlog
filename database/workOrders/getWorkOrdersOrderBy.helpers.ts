interface BuildOrderByOptions {
  orderBy?: string
}

const defaultOrderByClause = /* sql */ `
  w.workOrderOpenDateTime DESC,
  w.workOrderNumberYear DESC,
  w.workOrderNumberSequence DESC
`

const orderByOptions = {
  assignedToName: {
    asc: /* sql */ `
      assignedTo.assignedToName ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
    desc: /* sql */ `
      assignedTo.assignedToName DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
  },
  lastUpdate_dateTime: {
    asc: /* sql */ `
      lastUpdate_dateTime ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
    desc: /* sql */ `
      lastUpdate_dateTime DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
  },
  locationAddress1: {
    asc: /* sql */ `
      w.locationAddress1 ASC,
      w.locationAddress2 ASC,
      w.workOrderOpenDateTime DESC
    `,
    desc: /* sql */ `
      w.locationAddress1 DESC,
      w.locationAddress2 DESC,
      w.workOrderOpenDateTime DESC
    `
  },
  requestorName: {
    asc: /* sql */ `
      w.requestorName ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
    desc: /* sql */ `
      w.requestorName DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
  },
  workOrderNumber: {
    asc: /* sql */ `
      w.workOrderNumber ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
    desc: /* sql */ `
      w.workOrderNumber DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
  },
  workOrderOpenDateTime: {
    asc: /* sql */ `
      w.workOrderOpenDateTime ASC,
      w.workOrderNumberYear ASC,
      w.workOrderNumberSequence ASC
    `,
    desc: defaultOrderByClause
  }
} as const

type OrderByColumn = keyof typeof orderByOptions

function isOrderByColumn(value: string): value is OrderByColumn {
  return Object.hasOwn(orderByOptions, value)
}

export function buildGetWorkOrdersOrderByClause(
  options: BuildOrderByOptions
): string {
  const rawOrderBy = options.orderBy?.trim()

  if (rawOrderBy === undefined || rawOrderBy === '') {
    return defaultOrderByClause
  }

  const [column, direction = 'asc', ...rest] = rawOrderBy.split(/\s+/)

  if (
    rest.length > 0 ||
    !isOrderByColumn(column) ||
    (direction !== 'asc' && direction !== 'desc')
  ) {
    return defaultOrderByClause
  }

  return orderByOptions[column][direction]
}
