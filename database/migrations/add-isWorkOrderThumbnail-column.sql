-- Migration script to add isWorkOrderThumbnail column to existing databases
-- Run this script if upgrading from a version that doesn't have the isWorkOrderThumbnail column

-- Add the isWorkOrderThumbnail column to WorkOrderAttachments table
IF NOT EXISTS (
  SELECT 1 
  FROM sys.columns 
  WHERE object_id = OBJECT_ID('ShiftLog.WorkOrderAttachments') 
    AND name = 'isWorkOrderThumbnail'
)
BEGIN
  ALTER TABLE ShiftLog.WorkOrderAttachments
  ADD isWorkOrderThumbnail bit NOT NULL DEFAULT 0;
  
  PRINT 'Column isWorkOrderThumbnail added successfully to ShiftLog.WorkOrderAttachments';
END
ELSE
BEGIN
  PRINT 'Column isWorkOrderThumbnail already exists in ShiftLog.WorkOrderAttachments';
END
GO
