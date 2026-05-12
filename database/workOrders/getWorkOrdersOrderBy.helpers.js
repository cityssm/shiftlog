const defaultOrderByClause = `
  w.workOrderOpenDateTime DESC,
  w.workOrderNumberYear DESC,
  w.workOrderNumberSequence DESC
`;
const orderByOptions = {
    assignedToName: {
        asc: `
      assignedTo.assignedToName ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
        desc: `
      assignedTo.assignedToName DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
    },
    locationAddress1: {
        asc: `
      w.locationAddress1 ASC,
      w.locationAddress2 ASC,
      w.workOrderOpenDateTime DESC
    `,
        desc: `
      w.locationAddress1 DESC,
      w.locationAddress2 DESC,
      w.workOrderOpenDateTime DESC
    `
    },
    requestorName: {
        asc: `
      w.requestorName ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
        desc: `
      w.requestorName DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
    },
    workOrderNumber: {
        asc: `
      w.workOrderNumber ASC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `,
        desc: `
      w.workOrderNumber DESC,
      w.workOrderOpenDateTime DESC,
      w.workOrderId DESC
    `
    },
    workOrderOpenDateTime: {
        asc: `
      w.workOrderOpenDateTime ASC,
      w.workOrderNumberYear ASC,
      w.workOrderNumberSequence ASC
    `,
        desc: defaultOrderByClause
    }
};
function isOrderByColumn(value) {
    return Object.hasOwn(orderByOptions, value);
}
export function buildGetWorkOrdersOrderByClause(options) {
    const rawOrderBy = options.orderBy?.trim();
    if (rawOrderBy === undefined || rawOrderBy === '') {
        return defaultOrderByClause;
    }
    const [column, direction = 'asc', ...rest] = rawOrderBy.split(/\s+/);
    if (rest.length > 0 ||
        !isOrderByColumn(column) ||
        (direction !== 'asc' && direction !== 'desc')) {
        return defaultOrderByClause;
    }
    return orderByOptions[column][direction];
}
