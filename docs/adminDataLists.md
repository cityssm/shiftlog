[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)
•
[Administrator Tools](https://cityssm.github.io/shiftlog/docs/admin.html)

# Data Lists

Data Lists are customizable dropdown lists used throughout the application
to maintain consistency in data entry.

![Data Lists](./images/adminDataLists.png)

## Types of Data Lists

### System Lists

System lists are pre-configured lists that are essential for the application's core functionality.
These lists cannot be renamed or deleted and are identified by the application itself.

Examples include:
- Equipment Types
- Work Order Priorities
- Work Order Statuses
- Shift Types
- Timesheet Types

### Non-System Lists (Custom Lists)

Non-system lists are custom lists that administrators can create to meet specific organizational needs.
These lists are identified by a `dataListKey` that starts with the "user-" prefix.

Non-system lists can be:
- Created with custom names
- Renamed at any time
- Deleted when no longer needed

## Managing Data Lists

1. Navigate to **Administrator Tools** > **Data Lists**.
2. Select the data list you want to manage from the available lists.

## Creating a Non-System Data List

1. Click the **Create Data List** button at the top of the page.
2. Enter a unique **Data List Key** that starts with "user-" (e.g., "user-myCustomList").
3. Enter a **Display Name** for the list (e.g., "My Custom List").
4. Click **Create Data List**.

⚠️ The Data List Key cannot be changed after creation.

## Renaming a Non-System Data List

1. Find the non-system list you want to rename (marked with a "Custom" tag).
2. Click the **Rename List** button.
3. Enter the new display name.
4. Click **Update Name**.

Note: Only non-system lists can be renamed. System lists maintain their original names.

## Deleting a Non-System Data List

1. Find the non-system list you want to delete (marked with a "Custom" tag).
2. Click the **Delete List** button.
3. Confirm the deletion.

⚠️ Deleting a data list will also delete all items in that list. This action cannot be undone.

## Adding a Data List Item

1. Select a data list.
2. Click the **Add Item** button.
3. Enter the item details.
4. Click **Add Item** to add the item.

## Editing Data List Items

⚠️ When editing data list items, never change the meaning of the item.

1. Select a data list.
2. Click on the item you want to edit.
3. Update the information.
4. Click **Update Item** to apply changes.

## Reordering Data List Items

1. Select a data list.
2. Use the drag-and-drop interface to reorder items.
3. The order determines how items appear in dropdown lists.

---

## Related Links

- [Administrator Tools](./admin.md) - Main admin documentation
- [API Audit Logs](./adminApiAuditLogs.md)
- [Application Settings](./adminSettings.md)
- [Assigned To Management](./adminAssignedTo.md)
- [Data Lists](./adminDataLists.md)
- [Employee List Management](./adminEmployeeLists.md)
- [Employee Management](./adminEmployees.md)
- [Equipment Management](./adminEquipment.md)
- [Location Management](./adminLocations.md)
- [Notification Configuration](./adminNotificationConfigurations.md)
- [Tag Management](./adminTags.md)
- [User Group Management](./adminUserGroups.md)
- [User Management](./adminUsers.md)
- [Work Order Types](./adminWorkOrderTypes.md)
