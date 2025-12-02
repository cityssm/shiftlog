[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)

# Administrator Tools

The Administrator Tools provide comprehensive management capabilities for configuring and maintaining your ShiftLog installation. Access to these tools requires administrator permissions.

## Table of Contents

- [User Management](#user-management)
- [User Group Management](#user-group-management)
- [Application Settings](#application-settings)
- [Work Order Types](#work-order-types)
- [Data Lists](#data-lists)
- [Employee Management](#employee-management)
- [Equipment Management](#equipment-management)
- [Location Management](#location-management)

---

## User Management

The User Management section allows administrators to create, edit, and manage user accounts for the ShiftLog application.

### Adding a User

1. Navigate to **Administrator Tools** > **Users**
2. Click the **Add User** button
3. Enter the required user information:
   - Username
   - User display name
   - Password (if using local authentication)
4. Configure user permissions for different sections:
   - **Work Orders**: Set inquiry, update, or manage permissions
   - **Shifts**: Set inquiry, update, or manage permissions
   - **Timesheets**: Set inquiry, update, or manage permissions
5. Click **Save** to create the user

### Editing a User

1. Navigate to **Administrator Tools** > **Users**
2. Click on the user you want to edit
3. Update the user information as needed
4. Modify permissions if necessary
5. Click **Save** to apply changes

### User Permissions

Users can have different levels of access for each section:

- **Inquiry Only**: View-only access to records
- **Update**: Can create and edit records
- **Manage**: Full access including administrative functions (e.g., record recovery)

### Deleting a User

1. Navigate to **Administrator Tools** > **Users**
2. Click on the user you want to delete
3. Click the **Delete User** button
4. Confirm the deletion

---

## User Group Management

User Groups allow you to organize users into logical groups for easier management and reporting.

### Creating a User Group

1. Navigate to **Administrator Tools** > **User Groups**
2. Click the **Add User Group** button
3. Enter the group name and description
4. Click **Save** to create the group

### Adding Members to a User Group

1. Navigate to **Administrator Tools** > **User Groups**
2. Click on the user group
3. Click **Add Member**
4. Select the user from the list
5. Click **Add** to include them in the group

### Managing User Groups

User groups can be used to:
- Organize users by department or role
- Filter and report on activities by group
- Manage permissions collectively

---

## Application Settings

The Application Settings section allows administrators to configure various system-wide options.

### Accessing Settings

1. Navigate to **Administrator Tools** > **Application Settings**
2. Browse or search for the setting you want to modify
3. Click on the setting to edit its value
4. Save the changes

### Common Settings

Settings typically include:
- **Application Name**: Customize the application title
- **Section Names**: Rename sections (e.g., "Work Orders" to "Service Requests")
- **Integration Settings**: Configure external system integrations
- **Feature Toggles**: Enable or disable specific features
- **Display Options**: Customize the user interface

---

## Work Order Types

Work Order Types define the categories of work orders that can be created in the system.

### Creating a Work Order Type

1. Navigate to **Administrator Tools** > **Work Order Types**
2. Click the **Add Work Order Type** button
3. Enter the type information:
   - Type name
   - Description
   - Icon class (optional)
   - Additional fields specific to this type
4. Click **Save** to create the type

### Reordering Work Order Types

1. Navigate to **Administrator Tools** > **Work Order Types**
2. Use the drag-and-drop interface to reorder types
3. The order determines how types appear in dropdown lists

### Editing Work Order Types

1. Navigate to **Administrator Tools** > **Work Order Types**
2. Click on the type you want to edit
3. Update the information as needed
4. Click **Save** to apply changes

### Deleting Work Order Types

1. Navigate to **Administrator Tools** > **Work Order Types**
2. Click on the type you want to delete
3. Click the **Delete** button
4. Confirm the deletion

**Note**: You cannot delete a work order type that is currently in use by existing work orders.

---

## Data Lists

Data Lists are customizable dropdown lists used throughout the application to maintain consistency in data entry.

### Managing Data Lists

1. Navigate to **Administrator Tools** > **Data Lists**
2. Select the data list you want to manage from the available lists

### Adding a Data List Item

1. Select a data list
2. Click the **Add Item** button
3. Enter the item details
4. Click **Save** to add the item

### Editing Data List Items

1. Select a data list
2. Click on the item you want to edit
3. Update the information
4. Click **Save** to apply changes

### Reordering Data List Items

1. Select a data list
2. Use the drag-and-drop interface to reorder items
3. The order determines how items appear in dropdown lists

### Common Data Lists

Typical data lists include:
- Priority levels
- Status codes
- Categories
- Custom fields specific to your organization

---

## Employee Management

The Employee Management section maintains a list of employees that can be associated with work orders, shifts, and timesheets.

### Adding an Employee

1. Navigate to **Administrator Tools** > **Employees**
2. Click the **Add Employee** button
3. Enter employee information:
   - Employee name
   - Employee number or ID
   - Department
   - Other relevant details
4. Click **Save** to add the employee

### Editing Employee Information

1. Navigate to **Administrator Tools** > **Employees**
2. Click on the employee you want to edit
3. Update the information as needed
4. Click **Save** to apply changes

### Deleting an Employee

1. Navigate to **Administrator Tools** > **Employees**
2. Click on the employee you want to delete
3. Click the **Delete** button
4. Confirm the deletion

**Note**: Employees that are referenced in existing records cannot be deleted.

---

## Equipment Management

The Equipment Management section maintains a list of equipment (vehicles, tools, etc.) that can be associated with work orders and shifts.

### Adding Equipment

1. Navigate to **Administrator Tools** > **Equipment**
2. Click the **Add Equipment** button
3. Enter equipment information:
   - Equipment name/number
   - Type/category
   - Description
   - Other relevant details
4. Click **Save** to add the equipment

### Editing Equipment

1. Navigate to **Administrator Tools** > **Equipment**
2. Click on the equipment you want to edit
3. Update the information as needed
4. Click **Save** to apply changes

### Deleting Equipment

1. Navigate to **Administrator Tools** > **Equipment**
2. Click on the equipment you want to delete
3. Click the **Delete** button
4. Confirm the deletion

---

## Location Management

The Location Management section maintains predefined locations that can be quickly selected when creating work orders and other records.

### Adding a Location

1. Navigate to **Administrator Tools** > **Locations**
2. Click the **Add Location** button
3. Enter location information:
   - Location name
   - Address
   - Coordinates (optional)
   - Description
4. Click **Save** to add the location

### Editing Locations

1. Navigate to **Administrator Tools** > **Locations**
2. Click on the location you want to edit
3. Update the information as needed
4. Click **Save** to apply changes

### Deleting Locations

1. Navigate to **Administrator Tools** > **Locations**
2. Click on the location you want to delete
3. Click the **Delete** button
4. Confirm the deletion

### Location Integration

Locations can be:
- Displayed on maps
- Auto-suggested during work order creation
- Used for reporting and analysis
- Integrated with mapping services

---

## Best Practices

### Regular Maintenance

- Review and update user permissions regularly
- Remove inactive users and equipment
- Keep data lists current and relevant
- Archive or delete obsolete work order types

### Data Consistency

- Use descriptive names for all entities
- Maintain consistent naming conventions
- Document custom settings and configurations
- Train users on proper data entry procedures

### Security

- Use strong passwords for user accounts
- Assign minimum necessary permissions
- Regularly audit user access and activities
- Keep the application and integrations up to date
