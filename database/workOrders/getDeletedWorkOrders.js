// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-null */
import { getConfigProperty } from '../../helpers/config.helpers.js';
import { getShiftLogConnectionPool } from '../../helpers/database.helpers.js';
export default async function getDeletedWorkOrders(options, user) {
    const pool = await getShiftLogConnectionPool();
    let whereClause = 'where w.instance = @instance and w.recordDelete_dateTime is not null';
    if (user !== undefined) {
        whereClause += `
      and (
        wType.userGroupId is null or wType.userGroupId in (
          select userGroupId
          from ShiftLog.UserGroupMembers
          where userName = @userName
        )
      )
    `;
    }
    const limit = typeof options.limit === 'string'
        ? Number.parseInt(options.limit, 10)
        : options.limit;
    const offset = typeof options.offset === 'string'
        ? Number.parseInt(options.offset, 10)
        : options.offset;
    // Get total count if limit === -1
    let totalCount = 0;
    if (limit !== -1) {
        const countSql = /* sql */ `
      select count(*) as totalCount
      from ShiftLog.WorkOrders w
      left join ShiftLog.WorkOrderTypes wType
        on w.workOrderTypeId = wType.workOrderTypeId
      ${whereClause}
    `;
        const countResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user?.userName)
            .query(countSql);
        totalCount = countResult.recordset[0].totalCount;
    }
    // Main query with limit and offset
    let workOrders = [];
    if (totalCount > 0 || limit === -1) {
        const workOrdersResult = await pool
            .request()
            .input('instance', getConfigProperty('application.instance'))
            .input('userName', user?.userName)
            .query(/* sql */ `
        select
          w.workOrderId,

          w.workOrderNumberPrefix,
          w.workOrderNumberYear,
          w.workOrderNumberSequence,
          w.workOrderNumberOverride,
          w.workOrderNumber,

          w.workOrderTypeId,
          wType.workOrderType,

          w.workOrderStatusDataListItemId,
          wStatus.dataListItem as workOrderStatusDataListItem,

          w.workOrderDetails,

          w.workOrderOpenDateTime,
          w.workOrderDueDateTime,
          w.workOrderCloseDateTime,

          w.requestorName,
          w.requestorContactInfo,

          w.locationLatitude,
          w.locationLongitude,
          w.locationAddress1,
          w.locationAddress2,
          w.locationCityProvince,

          w.assignedToDataListItemId,
          assignedTo.dataListItem as assignedToDataListItem,

          w.recordDelete_userName,
          w.recordDelete_dateTime
          
        from ShiftLog.WorkOrders w

        left join ShiftLog.WorkOrderTypes wType
          on w.workOrderTypeId = wType.workOrderTypeId

        left join ShiftLog.DataListItems wStatus
          on w.workOrderStatusDataListItemId = wStatus.dataListItemId

        left join ShiftLog.DataListItems assignedTo
          on w.assignedToDataListItemId = assignedTo.dataListItemId

        ${whereClause}    

        order by w.recordDelete_dateTime desc

        ${limit === -1 ? '' : ` offset ${offset} rows`}
        ${limit === -1 ? '' : ` fetch next ${limit} rows only`}
      `);
        workOrders = workOrdersResult.recordset;
        if (limit === -1) {
            totalCount = workOrders.length;
        }
    }
    return {
        workOrders,
        totalCount
    };
}
