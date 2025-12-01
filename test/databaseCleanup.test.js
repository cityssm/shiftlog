import assert from 'node:assert';
import { writeFile, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, it, before, after } from 'node:test';
import { getShiftLogConnectionPool } from '../helpers/database.helpers.js';
import { getConfigProperty } from '../helpers/config.helpers.js';
import permanentlyDeleteRecords from '../database/cleanup/permanentlyDeleteRecords.js';
const testInstance = getConfigProperty('application.instance');
const testUser = 'test-cleanup-user';
await describe('database cleanup', async () => {
    let pool;
    let testAttachmentPath;
    let testWorkOrderId;
    let testWorkOrderTypeId;
    let testAttachmentId;
    before(async () => {
        pool = await getShiftLogConnectionPool();
        // Create a test work order type
        const workOrderTypeResult = await pool.request()
            .input('instance', testInstance)
            .input('workOrderTypeName', 'Test Cleanup Type')
            .input('userName', testUser)
            .query(`
        INSERT INTO ShiftLog.WorkOrderTypes 
          (instance, workOrderTypeName, workOrderTypeIcon, workOrderTypeIconClass, 
           recordCreate_userName, recordCreate_dateTime, 
           recordUpdate_userName, recordUpdate_dateTime)
        VALUES 
          (@instance, @workOrderTypeName, '', '', 
           @userName, GETDATE(), 
           @userName, GETDATE())
        SELECT SCOPE_IDENTITY() as workOrderTypeId
      `);
        testWorkOrderTypeId = workOrderTypeResult.recordset[0].workOrderTypeId;
        // Create a test work order
        const workOrderResult = await pool.request()
            .input('instance', testInstance)
            .input('workOrderTypeId', testWorkOrderTypeId)
            .input('userName', testUser)
            .query(`
        INSERT INTO ShiftLog.WorkOrders 
          (workOrderTypeId, instance, workOrderNumberPrefix, workOrderNumberYear, 
           workOrderNumberSequence, workOrderOpenDateTime,
           recordCreate_userName, recordCreate_dateTime,
           recordUpdate_userName, recordUpdate_dateTime)
        VALUES 
          (@workOrderTypeId, @instance, 'TEST', 2024, 
           1, GETDATE(),
           @userName, GETDATE(),
           @userName, GETDATE())
        SELECT SCOPE_IDENTITY() as workOrderId
      `);
        testWorkOrderId = workOrderResult.recordset[0].workOrderId;
        // Create a test attachment directory and file
        const attachmentDir = join(process.cwd(), 'data', 'test-attachments');
        await mkdir(attachmentDir, { recursive: true });
        testAttachmentPath = join(attachmentDir, 'test-file.txt');
        await writeFile(testAttachmentPath, 'Test attachment content');
        // Create a test attachment record
        const attachmentResult = await pool.request()
            .input('workOrderId', testWorkOrderId)
            .input('fileSystemPath', testAttachmentPath)
            .input('userName', testUser)
            .query(`
        INSERT INTO ShiftLog.WorkOrderAttachments
          (workOrderId, attachmentFileName, attachmentFileType, 
           attachmentFileSizeInBytes, fileSystemPath,
           recordCreate_userName, recordCreate_dateTime,
           recordUpdate_userName, recordUpdate_dateTime)
        VALUES
          (@workOrderId, 'test-file.txt', 'text/plain',
           25, @fileSystemPath,
           @userName, GETDATE(),
           @userName, GETDATE())
        SELECT SCOPE_IDENTITY() as workOrderAttachmentId
      `);
        testAttachmentId = attachmentResult.recordset[0].workOrderAttachmentId;
    });
    after(async () => {
        // Clean up test data - permanently delete all test records
        try {
            await pool.request()
                .input('workOrderId', testWorkOrderId)
                .query('DELETE FROM ShiftLog.WorkOrderAttachments WHERE workOrderId = @workOrderId');
            await pool.request()
                .input('workOrderId', testWorkOrderId)
                .query('DELETE FROM ShiftLog.WorkOrders WHERE workOrderId = @workOrderId');
            await pool.request()
                .input('workOrderTypeId', testWorkOrderTypeId)
                .query('DELETE FROM ShiftLog.WorkOrderTypes WHERE workOrderTypeId = @workOrderTypeId');
            // Try to delete the test file if it still exists
            try {
                await unlink(testAttachmentPath);
            }
            catch {
                // Ignore if file doesn't exist
            }
        }
        catch (error) {
            // Ignore cleanup errors
        }
    });
    await it('should not delete records that are not marked as deleted', async () => {
        const result = await permanentlyDeleteRecords();
        assert.strictEqual(result.success, true);
        // Verify the test work order still exists
        const workOrderCheck = await pool.request()
            .input('workOrderId', testWorkOrderId)
            .query('SELECT * FROM ShiftLog.WorkOrders WHERE workOrderId = @workOrderId');
        assert.strictEqual(workOrderCheck.recordset.length, 1);
    });
    await it('should not delete records marked as deleted for less than configured days', async () => {
        // Mark the attachment as deleted (just now)
        await pool.request()
            .input('workOrderAttachmentId', testAttachmentId)
            .input('userName', testUser)
            .query(`
        UPDATE ShiftLog.WorkOrderAttachments
        SET recordDelete_userName = @userName,
            recordDelete_dateTime = GETDATE()
        WHERE workOrderAttachmentId = @workOrderAttachmentId
      `);
        const result = await permanentlyDeleteRecords();
        assert.strictEqual(result.success, true);
        // Verify the attachment still exists in the database
        const attachmentCheck = await pool.request()
            .input('workOrderAttachmentId', testAttachmentId)
            .query('SELECT * FROM ShiftLog.WorkOrderAttachments WHERE workOrderAttachmentId = @workOrderAttachmentId');
        assert.strictEqual(attachmentCheck.recordset.length, 1);
    });
    await it('should delete attachments and files when marked as deleted for more than configured days', async () => {
        // Mark the attachment as deleted 61 days ago (more than the default 60 days)
        const oldDeleteDate = new Date();
        oldDeleteDate.setDate(oldDeleteDate.getDate() - 61);
        await pool.request()
            .input('workOrderAttachmentId', testAttachmentId)
            .input('userName', testUser)
            .input('deleteDate', oldDeleteDate)
            .query(`
        UPDATE ShiftLog.WorkOrderAttachments
        SET recordDelete_userName = @userName,
            recordDelete_dateTime = @deleteDate
        WHERE workOrderAttachmentId = @workOrderAttachmentId
      `);
        const result = await permanentlyDeleteRecords();
        assert.strictEqual(result.success, true);
        assert.ok(result.deletedCount > 0, 'Should have deleted at least one record');
        // Verify the attachment was deleted from the database
        const attachmentCheck = await pool.request()
            .input('workOrderAttachmentId', testAttachmentId)
            .query('SELECT * FROM ShiftLog.WorkOrderAttachments WHERE workOrderAttachmentId = @workOrderAttachmentId');
        assert.strictEqual(attachmentCheck.recordset.length, 0, 'Attachment should be deleted from database');
    });
    await it('should delete work orders when marked as deleted and have no active child records', async () => {
        // Mark the work order as deleted 61 days ago
        const oldDeleteDate = new Date();
        oldDeleteDate.setDate(oldDeleteDate.getDate() - 61);
        await pool.request()
            .input('workOrderId', testWorkOrderId)
            .input('userName', testUser)
            .input('deleteDate', oldDeleteDate)
            .query(`
        UPDATE ShiftLog.WorkOrders
        SET recordDelete_userName = @userName,
            recordDelete_dateTime = @deleteDate
        WHERE workOrderId = @workOrderId
      `);
        const result = await permanentlyDeleteRecords();
        assert.strictEqual(result.success, true);
        // Verify the work order was deleted
        const workOrderCheck = await pool.request()
            .input('workOrderId', testWorkOrderId)
            .query('SELECT * FROM ShiftLog.WorkOrders WHERE workOrderId = @workOrderId');
        assert.strictEqual(workOrderCheck.recordset.length, 0, 'Work order should be deleted from database');
    });
    await it('should delete work order types when marked as deleted and have no active work orders', async () => {
        // Mark the work order type as deleted 61 days ago
        const oldDeleteDate = new Date();
        oldDeleteDate.setDate(oldDeleteDate.getDate() - 61);
        await pool.request()
            .input('workOrderTypeId', testWorkOrderTypeId)
            .input('userName', testUser)
            .input('deleteDate', oldDeleteDate)
            .query(`
        UPDATE ShiftLog.WorkOrderTypes
        SET recordDelete_userName = @userName,
            recordDelete_dateTime = @deleteDate
        WHERE workOrderTypeId = @workOrderTypeId
      `);
        const result = await permanentlyDeleteRecords();
        assert.strictEqual(result.success, true);
        // Verify the work order type was deleted
        const workOrderTypeCheck = await pool.request()
            .input('workOrderTypeId', testWorkOrderTypeId)
            .query('SELECT * FROM ShiftLog.WorkOrderTypes WHERE workOrderTypeId = @workOrderTypeId');
        assert.strictEqual(workOrderTypeCheck.recordset.length, 0, 'Work order type should be deleted from database');
    });
});
