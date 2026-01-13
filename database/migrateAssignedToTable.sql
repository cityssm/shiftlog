-- Migration script to move assignedTo data from DataListItems to dedicated AssignedTo table
-- This script should be run on existing ShiftLog databases to migrate data

-- Step 1: Create the new AssignedTo table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AssignedTo' AND SCHEMA_NAME(schema_id) = 'ShiftLog')
BEGIN
  CREATE TABLE ShiftLog.AssignedTo (
    assignedToId int not null primary key identity(1,1),
    instance varchar(20) not null,
    assignedToName varchar(200) not null,
    orderNumber smallint not null default 0,
    userGroupId int,

    recordCreate_userName varchar(30) not null,
    recordCreate_dateTime datetime not null default getdate(),
    recordUpdate_userName varchar(30) not null,
    recordUpdate_dateTime datetime not null default getdate(),
    recordDelete_userName varchar(30),
    recordDelete_dateTime datetime,

    unique (instance, assignedToName),
    foreign key (userGroupId) references ShiftLog.UserGroups(userGroupId)
  )
  
  PRINT 'Created ShiftLog.AssignedTo table'
END
ELSE
BEGIN
  PRINT 'ShiftLog.AssignedTo table already exists'
END
GO

-- Step 2: Migrate data from DataListItems to AssignedTo table
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'AssignedTo' AND SCHEMA_NAME(schema_id) = 'ShiftLog')
  AND NOT EXISTS (SELECT 1 FROM ShiftLog.AssignedTo)
BEGIN
  INSERT INTO ShiftLog.AssignedTo (
    instance,
    assignedToName,
    orderNumber,
    userGroupId,
    recordCreate_userName,
    recordCreate_dateTime,
    recordUpdate_userName,
    recordUpdate_dateTime,
    recordDelete_userName,
    recordDelete_dateTime
  )
  SELECT
    i.instance,
    i.dataListItem as assignedToName,
    i.orderNumber,
    i.userGroupId,
    i.recordCreate_userName,
    i.recordCreate_dateTime,
    i.recordUpdate_userName,
    i.recordUpdate_dateTime,
    i.recordDelete_userName,
    i.recordDelete_dateTime
  FROM ShiftLog.DataListItems i
  WHERE i.dataListKey = 'assignedTo'
    AND i.recordDelete_dateTime IS NULL
  ORDER BY i.orderNumber, i.dataListItem
  
  PRINT 'Migrated ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' assignedTo items from DataListItems to AssignedTo table'
END
ELSE IF EXISTS (SELECT 1 FROM ShiftLog.AssignedTo)
BEGIN
  PRINT 'ShiftLog.AssignedTo table already contains data, skipping migration'
END
GO

-- Step 3: Add new assignedToId column to WorkOrders table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrders') AND name = 'assignedToId')
BEGIN
  ALTER TABLE ShiftLog.WorkOrders
  ADD assignedToId int NULL
  
  PRINT 'Added assignedToId column to ShiftLog.WorkOrders table'
END
ELSE
BEGIN
  PRINT 'assignedToId column already exists in ShiftLog.WorkOrders table'
END
GO

-- Step 4: Migrate WorkOrders.assignedToDataListItemId to assignedToId
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrders') AND name = 'assignedToId')
  AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrders') AND name = 'assignedToDataListItemId')
BEGIN
  -- Create a temporary mapping table
  SELECT 
    dli.dataListItemId,
    at.assignedToId
  INTO #AssignedToMapping
  FROM ShiftLog.DataListItems dli
  INNER JOIN ShiftLog.AssignedTo at 
    ON dli.instance = at.instance 
    AND dli.dataListItem = at.assignedToName
  WHERE dli.dataListKey = 'assignedTo'
    AND dli.recordDelete_dateTime IS NULL
    AND at.recordDelete_dateTime IS NULL
  
  -- Update WorkOrders with new assignedToId
  UPDATE wo
  SET wo.assignedToId = m.assignedToId
  FROM ShiftLog.WorkOrders wo
  INNER JOIN #AssignedToMapping m ON wo.assignedToDataListItemId = m.dataListItemId
  WHERE wo.assignedToDataListItemId IS NOT NULL
    AND wo.assignedToId IS NULL
  
  PRINT 'Updated ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' WorkOrders records with new assignedToId'
  
  DROP TABLE #AssignedToMapping
END
GO

-- Step 5: Add new assignedToId column to WorkOrderMilestones table if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrderMilestones') AND name = 'assignedToId')
BEGIN
  ALTER TABLE ShiftLog.WorkOrderMilestones
  ADD assignedToId int NULL
  
  PRINT 'Added assignedToId column to ShiftLog.WorkOrderMilestones table'
END
ELSE
BEGIN
  PRINT 'assignedToId column already exists in ShiftLog.WorkOrderMilestones table'
END
GO

-- Step 6: Migrate WorkOrderMilestones.assignedToDataListItemId to assignedToId
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrderMilestones') AND name = 'assignedToId')
  AND EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrderMilestones') AND name = 'assignedToDataListItemId')
BEGIN
  -- Create a temporary mapping table
  SELECT 
    dli.dataListItemId,
    at.assignedToId
  INTO #MilestoneAssignedToMapping
  FROM ShiftLog.DataListItems dli
  INNER JOIN ShiftLog.AssignedTo at 
    ON dli.instance = at.instance 
    AND dli.dataListItem = at.assignedToName
  WHERE dli.dataListKey = 'assignedTo'
    AND dli.recordDelete_dateTime IS NULL
    AND at.recordDelete_dateTime IS NULL
  
  -- Update WorkOrderMilestones with new assignedToId
  UPDATE wom
  SET wom.assignedToId = m.assignedToId
  FROM ShiftLog.WorkOrderMilestones wom
  INNER JOIN #MilestoneAssignedToMapping m ON wom.assignedToDataListItemId = m.dataListItemId
  WHERE wom.assignedToDataListItemId IS NOT NULL
    AND wom.assignedToId IS NULL
  
  PRINT 'Updated ' + CAST(@@ROWCOUNT AS VARCHAR(10)) + ' WorkOrderMilestones records with new assignedToId'
  
  DROP TABLE #MilestoneAssignedToMapping
END
GO

-- Step 7: Add foreign key constraints
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrders') AND name = 'assignedToId')
  AND NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE parent_object_id = OBJECT_ID('ShiftLog.WorkOrders') 
    AND name = 'FK_WorkOrders_AssignedTo'
  )
BEGIN
  ALTER TABLE ShiftLog.WorkOrders
  ADD CONSTRAINT FK_WorkOrders_AssignedTo
  FOREIGN KEY (assignedToId) REFERENCES ShiftLog.AssignedTo(assignedToId)
  
  PRINT 'Added foreign key constraint FK_WorkOrders_AssignedTo'
END
ELSE
BEGIN
  PRINT 'Foreign key constraint FK_WorkOrders_AssignedTo already exists or assignedToId column does not exist'
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ShiftLog.WorkOrderMilestones') AND name = 'assignedToId')
  AND NOT EXISTS (
    SELECT * FROM sys.foreign_keys 
    WHERE parent_object_id = OBJECT_ID('ShiftLog.WorkOrderMilestones') 
    AND name = 'FK_WorkOrderMilestones_AssignedTo'
  )
BEGIN
  ALTER TABLE ShiftLog.WorkOrderMilestones
  ADD CONSTRAINT FK_WorkOrderMilestones_AssignedTo
  FOREIGN KEY (assignedToId) REFERENCES ShiftLog.AssignedTo(assignedToId)
  
  PRINT 'Added foreign key constraint FK_WorkOrderMilestones_AssignedTo'
END
ELSE
BEGIN
  PRINT 'Foreign key constraint FK_WorkOrderMilestones_AssignedTo already exists or assignedToId column does not exist'
END
GO

PRINT 'Migration completed successfully'
PRINT ''
PRINT 'IMPORTANT: After verifying the migration, you should:'
PRINT '1. Drop the old assignedToDataListItemId columns from WorkOrders and WorkOrderMilestones tables'
PRINT '2. Remove the assignedTo entries from the DataListItems table'
PRINT '3. Remove the assignedTo entry from the DataLists table'
PRINT ''
PRINT 'Example cleanup commands (run only after verification):'
PRINT '-- ALTER TABLE ShiftLog.WorkOrders DROP COLUMN assignedToDataListItemId'
PRINT '-- ALTER TABLE ShiftLog.WorkOrderMilestones DROP COLUMN assignedToDataListItemId'
PRINT '-- DELETE FROM ShiftLog.DataListItems WHERE dataListKey = ''assignedTo'''
PRINT '-- DELETE FROM ShiftLog.DataLists WHERE dataListKey = ''assignedTo'''
GO
