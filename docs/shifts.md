[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)

# Shifts

Shifts are a core feature of ShiftLog, allowing you to track and manage work performed during specific time periods. The system provides a comprehensive framework for documenting shift activities, including employees, crews, equipment, tasks (work orders), notes, and timesheets.

## Table of Contents

- [Overview](#overview)
- [Searching Shifts](#searching-shifts)
- [Creating a New Shift](#creating-a-new-shift)
- [Viewing Shifts](#viewing-shifts)
- [Editing Shifts](#editing-shifts)
- [Shift Features](#shift-features)
  - [Employees and Equipment](#employees-and-equipment)
  - [Tasks (Work Orders)](#tasks-work-orders)
  - [Notes](#notes)
  - [Timesheets](#timesheets)
- [Printing Shifts](#printing-shifts)
- [Best Practices](#best-practices)
- [Record Recovery](#record-recovery)

---

## Overview

Shifts in ShiftLog are used to record work activities performed by employees and equipment during a specific date and time period. Each shift is assigned to a supervisor who is responsible for documenting the work performed, resources used, and any relevant notes.

### Key Features

- **Shift Types and Times**: Organize shifts by type (e.g., Day Shift, Night Shift) and predefined time periods
- **Supervisor Assignment**: Each shift is managed by a designated supervisor
- **Crew Management**: Group employees into crews for easier organization
- **Equipment Tracking**: Record equipment usage and operator assignments
- **Work Order Integration**: Link work orders (tasks) to shifts to track completion
- **Notes**: Document important information about the shift
- **Timesheet Integration**: Track employee hours for payroll purposes

---

## Searching Shifts

The Shift Search page is the main interface for finding and managing shifts.

### Accessing the Search Page

1. Click on **Shifts** in the main navigation menu,
2. Or navigate to **Shifts** > **Shift Search**.

### Search Options

You can search for shifts using:

- **Date**: Filter shifts by specific date
- **Shift Type**: Filter by shift category
- **Shift Time**: Filter by time period
- **Supervisor**: Search by supervisor name

### Search Results

Search results display:

- **Shift ID**: Unique identifier for the shift
- **Type**: Shift category
- **Date**: Date of the shift
- **Time**: Time period
- **Supervisor**: Name of the shift supervisor
- **Properties**: Icons indicating:
  - Work orders count
  - Crews count
  - Employees count
  - Equipment count
  - Timesheets count
- **Actions**: Print button to generate a printable version

Click on any shift in the results to view its full details.

---

## Creating a New Shift

Creating a new shift establishes the basic information for tracking work performed during a specific time period.

### Steps to Create a Shift

Navigate to **Shifts** > **Shift Search**,
and click the **Create New Shift** button.

Fill in the required information:

#### Basic Information

- **Date**: Select the date for the shift (required)
- **Shift Type**: Select the type of shift (required)
- **Shift Time**: Select the time period (required)
- **Supervisor**: Select the employee responsible for the shift (required)
- **Description**: Add optional notes about the shift

Click **Create Shift** to create the shift. You will then be redirected to the shift view page where you can add employees, equipment, work orders, and other details.

---

## Viewing Shifts

The shift view page displays all information about a specific shift.

### Accessing a Shift

1. Search for the shift using the search page,
2. Click on the shift from the search results,
3. Or navigate directly using the shift ID in the URL.

### Shift Details

The view page shows:

- **Shift ID**: Unique identifier
- **Date**: Date of the shift
- **Type and Time**: Shift category and time period
- **Supervisor**: Name and contact information
- **Description**: Any notes about the shift
- **Creation and modification dates**: Audit trail

### Available Actions

From the view page, you can:

- **Edit**: Modify shift details (requires Update permission and appropriate access)
- **Print**: Generate a printable version of the shift
- **Delete**: Remove the shift (requires Update permission)

---

## Editing Shifts

The shift edit page allows authorized users to modify shift information and manage associated resources.

### Permission Requirements

To edit a shift, you must:

- Have "Update" permission for shifts, AND
- Be the shift supervisor, OR
- Have "Manage" permission for shifts

### Editing Shift Information

Click the **Edit** button on the shift view page to modify:

- Date
- Shift Type
- Shift Time
- Supervisor
- Description

Click **Update Shift** to save your changes.

---

## Shift Features

### Employees and Equipment

The Employees and Equipment tab allows you to track who worked on the shift and what resources were used.

#### Managing Crews

**Adding a Crew**:
1. Click the **Add** dropdown button
2. Select **Add Crew**
3. Choose a crew from the list
4. Add optional notes about the crew's work
5. Click **Add Crew**

The system will automatically switch to the Crews tab to show your addition.

**Crew Details**:
- Crew name
- Notes about the crew's activities

**Actions**:
- **Edit Note**: Update crew notes
- **Remove**: Remove the crew from the shift

#### Managing Employees

**Adding an Employee**:
1. Click the **Add** dropdown button
2. Select **Add Employee**
3. Choose an employee from the list
4. Optionally assign them to a crew
5. Add optional notes about the employee's work
6. Click **Add Employee**

The system will automatically switch to the Employees tab to show your addition.

**Employee Details**:
- Employee name and number
- Assigned crew (if applicable)
- Notes about the employee's work

**Actions**:
- **Edit Note**: Update employee notes
- **Remove**: Remove the employee from the shift

#### Managing Equipment

**Adding Equipment**:
1. Click the **Add** dropdown button
2. Select **Add Equipment**
3. Choose equipment from the list
4. Optionally assign an operator
5. Add optional notes about equipment usage
6. Click **Add Equipment**

The system will automatically switch to the Equipment tab to show your addition.

**Equipment Details**:
- Equipment number and name
- Assigned operator (if applicable)
- Notes about equipment usage

**Actions**:
- **Assign Operator**: Assign or change the equipment operator
- **Edit Note**: Update equipment notes
- **Remove**: Remove the equipment from the shift

#### Import from Previous Shift

You can quickly populate the shift with resources from a previous shift:
1. Click the **Add** dropdown button
2. Select **Import from Previous Shift**
3. The system will load crews, employees, and equipment from the most recent shift

### Tasks (Work Orders)

The Tasks tab allows you to link work orders to the shift, documenting what work was completed.

#### Adding Work Orders

**Requirements**:
- Work orders must be enabled in the system
- User must have "View" permission for work orders
- User must have "Update" permission for shifts

**Steps to Add**:
1. Click **Add Work Order**
2. Search for the work order by number, location, or description
3. Select the work order from the search results
4. Add optional notes about the work performed
5. Click **Add**

**Work Order Details**:
- Work order number (linked)
- Type and status
- Details
- Notes about work performed on this shift

**Actions**:
- **Edit Note**: Update notes about the work
- **Remove**: Unlink the work order from the shift

#### Milestones

When work orders with milestones are added to a shift, you can:
- View all milestones from related work orders
- See milestone due dates and completion status
- Mark milestones as complete directly from the shift view

### Notes

The Notes tab provides space to document important information about the shift. This could include:
- Incidents or issues that occurred
- Special instructions or conditions
- General observations
- Safety concerns

### Timesheets

If timesheet functionality is enabled, the Timesheets tab displays timesheets associated with this shift, allowing you to track employee hours for payroll purposes.

---

## Printing Shifts

Shifts can be printed for record-keeping or distribution.

### How to Print

1. Navigate to the shift view page
2. Click the **Print** button in the toolbar, OR
3. From the shift search results, click the print icon in the Actions column

The print view includes:
- Shift details (date, type, time, supervisor)
- All crews assigned to the shift
- All employees assigned to the shift
- All equipment used during the shift
- All work orders completed during the shift
- Milestones from related work orders

---

## Best Practices

### Shift Documentation

- **Document promptly**: Add employees, equipment, and work orders as soon as possible while details are fresh
- **Use notes effectively**: Document important information that might be useful later
- **Link work orders**: Always link work orders to shifts to maintain accurate work history
- **Review before closing**: Check that all employees, equipment, and tasks are documented

### Crew Organization

- **Use crews consistently**: Establish standard crews for common work configurations
- **Update crew members**: Ensure crews reflect current team compositions
- **Document crew work**: Use crew notes to document team-specific activities

### Equipment Management

- **Assign operators**: Always assign equipment to specific operators for accountability
- **Note issues**: Document any equipment problems or maintenance needs
- **Track usage**: Use equipment notes to record hours, fuel, or other metrics

### Work Order Integration

- **Link completed work**: Add all work orders completed during the shift
- **Update status**: Ensure work order status reflects completion
- **Complete milestones**: Use the shift view to mark work order milestones as complete

### Supervisor Responsibilities

As a shift supervisor, you should:
- Create the shift at the beginning of your shift
- Add employees and equipment as they report
- Link work orders as tasks are completed
- Document any issues or important information in notes
- Review the shift record before ending your shift

---

## Record Recovery

Deleted shifts can be recovered within a configurable retention period.

### Accessing Record Recovery

1. Navigate to **Shifts** > **Record Recovery**
2. View the list of deleted shifts

### Recovering a Shift

1. Find the deleted shift in the list
2. Click the **Recover** button
3. The shift will be restored with all associated data

**Note**: Once the retention period expires, deleted shifts are permanently removed and cannot be recovered.
