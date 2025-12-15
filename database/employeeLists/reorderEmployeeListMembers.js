import mssqlPool from '@cityssm/mssql-multi-pool';
import { getConfigProperty } from '../../helpers/config.helpers.js';
export default async function reorderEmployeeListMembers(form) {
    try {
        const pool = await mssqlPool.connect(getConfigProperty('connectors.shiftLog'));
        const transaction = pool.transaction();
        await transaction.begin();
        try {
            for (const [index, employeeNumber] of form.employeeNumbers.entries()) {
                await transaction
                    .request()
                    .input('instance', getConfigProperty('application.instance'))
                    .input('employeeListId', form.employeeListId)
                    .input('employeeNumber', employeeNumber)
                    .input('seniorityDate', form.seniorityDate ?? null)
                    .input('seniorityOrderNumber', index).query(/* sql */ `
            update ShiftLog.EmployeeListMembers
            set seniorityOrderNumber = @seniorityOrderNumber
            where instance = @instance
              and employeeListId = @employeeListId
              and employeeNumber = @employeeNumber
              ${form.seniorityDate === undefined ? '' : 'and seniorityDate = @seniorityDate'}
          `);
            }
            await transaction.commit();
            return true;
        }
        catch {
            await transaction.rollback();
            return false;
        }
    }
    catch {
        return false;
    }
}
