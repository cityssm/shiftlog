[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)

# Work Orders

Work Orders are the core feature of ShiftLog, allowing you to track, manage, and report on various types of work activities. The system provides a flexible framework that can be customized to track anything from graffiti cleanup to accessibility complaints to public works maintenance.

## Table of Contents

- [Searching Work Orders](#searching-work-orders)
- [Creating a New Work Order](#creating-a-new-work-order)
- [Viewing Work Orders](#viewing-work-orders)
- [Editing Work Orders](#editing-work-orders)
- [Work Order Features](#work-order-features)
  - [Notes](#notes)
  - [Milestones](#milestones)
  - [Attachments](#attachments)
- [Work Order Map](#work-order-map)
- [Record Recovery](#record-recovery)

---

## Searching Work Orders

The Work Order Search page is the main interface for finding and managing work orders.

### Accessing the Search Page

1. Click on **Work Orders** in the main navigation menu
2. Or navigate to **Work Orders** > **Work Order Search**

### Search Options

You can search for work orders using various criteria:

- **Work Order Number**: Search by the unique work order identifier
- **Status**: Filter by open, closed, or all work orders
- **Work Order Type**: Filter by specific categories
- **Date Range**: Search within a specific time period
- **Location**: Search by address or location name
- **Requestor**: Search by who requested the work
- **Assigned To**: Filter by assigned employee or group
- **Keywords**: Search in descriptions and notes

### Search Results

Search results display:
- Work order number
- Work order type
- Status
- Location
- Creation date
- Assigned employees
- Brief description

Click on any work order in the results to view its full details.

---

## Creating a New Work Order

Creating a new work order captures all the necessary information about a work request or task.

### Steps to Create a Work Order

1. Navigate to **Work Orders** > **Work Order Search**
2. Click the **Create New Work Order** button (requires Update permission)
3. Fill in the required information:

#### Basic Information

- **Work Order Type**: Select the category of work (required)
- **Priority**: Set the urgency level
- **Location**: Enter the address or select from predefined locations
- **Description**: Provide detailed information about the work needed

#### Requestor Information

- **Requestor Name**: Who is requesting the work
- **Requestor Contact**: Phone number or email
- **Request Date**: When the request was received

#### Assignment

- **Assigned To**: Select employee(s) or group(s) to handle the work
- **Due Date**: Set when the work should be completed (optional)

#### Additional Details

Depending on the work order type, additional fields may be available:
- Custom data fields
- Special instructions
- Reference numbers
- Integration data

4. Click **Save** to create the work order

### Location Suggestions

As you type a location, the system will suggest:
- Previously used locations
- Predefined locations from the Location Management section
- Addresses from integrated mapping services

---

## Viewing Work Orders

The work order view page displays all information about a specific work order.

### Accessing a Work Order

1. Search for the work order using the search page
2. Click on the work order from the search results
3. Or navigate directly using the work order number in the URL

### Work Order Details

The view page shows:
- Work order number and status
- Work order type and priority
- Location and map (if coordinates available)
- Requestor information
- Assigned employees
- Creation and modification dates
- Full description
- All custom fields for the work order type

### Available Actions

From the view page, you can:
- **Edit**: Modify work order details (requires Update permission)
- **Print**: Generate a printable version
- **Add Notes**: Record updates and comments
- **Add Milestones**: Track work progress
- **Upload Attachments**: Add photos, documents, or files
- **Close**: Mark the work order as completed
- **Delete**: Remove the work order (requires Update permission)

---

## Editing Work Orders

Users with Update permission can modify existing work orders.

### Editing a Work Order

1. View the work order you want to edit
2. Click the **Edit** button
3. Update any of the fields:
   - Work order type
   - Priority
   - Location
   - Description
   - Assigned employees
   - Due date
   - Status
4. Click **Save** to apply changes

### Reopening Closed Work Orders

If a work order was closed prematurely:
1. View the closed work order
2. Click the **Reopen Work Order** button
3. The work order status will change back to open
4. You can then edit and update the work order as needed

### Change History

The system tracks when work orders are modified, helping maintain an audit trail of changes.

---

## Work Order Features

### Notes

Notes allow users to add comments, updates, and observations to a work order.

#### Adding a Note

1. View the work order
2. Navigate to the **Notes** tab
3. Click **Add Note**
4. Enter your note text
5. Click **Save**

#### Note Features

- Notes are timestamped with the date and author
- Multiple notes can be added to track ongoing work
- Notes can be edited or deleted by the author or administrators
- Notes appear in chronological order

### Milestones

Milestones track significant events or progress points in completing a work order.

#### Adding a Milestone

1. View the work order
2. Navigate to the **Milestones** tab
3. Click **Add Milestone**
4. Enter milestone details:
   - Milestone name/description
   - Date and time
   - Completion status
5. Click **Save**

#### Managing Milestones

- Milestones can be reordered to reflect the workflow
- Update milestone status as work progresses
- Edit or delete milestones as needed
- Milestones help track multi-step work processes

#### Common Milestone Examples

- Work assigned
- Work started
- Inspection completed
- Parts ordered
- Work completed
- Quality check passed

### Attachments

Attachments allow you to add supporting documents, photos, and files to work orders.

#### Uploading an Attachment

1. View the work order
2. Navigate to the **Attachments** tab
3. Click **Upload Attachment**
4. Select the file from your device
5. Add a description (optional)
6. Click **Upload**

#### Attachment Features

- Supports various file types (images, PDFs, documents)
- File size limits may apply based on system configuration
- Attachments can be downloaded or viewed
- Delete attachments if no longer needed

#### Best Practices for Attachments

- Use photos to document before/after conditions
- Attach relevant permits or approvals
- Include diagrams or sketches
- Add supporting documentation or correspondence

---

## Work Order Map

The Work Order Map provides a visual, geographic view of work orders.

![Work Order Map showing geographic distribution of work orders with colored markers](./images/workOrders-map.png)

### Accessing the Map

1. Navigate to **Work Orders** > **Open Work Order Map**
2. The map displays all work orders with location coordinates

### Map Features

- **Visual Markers**: Work orders appear as colored markers on the map
- **Marker Colors**: Different colors may indicate status, priority, or type
- **Clustering**: Multiple work orders in the same area are grouped together
- **Interactive**: Click on a marker to view work order summary
- **Quick Access**: Navigate directly to a work order from the map

### Map Integration

The map uses OpenStreetMap for free, high-quality mapping without licensing costs.

### Filtering on the Map

- Use the search and filter options to show specific work orders
- Filter by status, type, date range, or other criteria
- The map updates to show only matching work orders

---

## Record Recovery

The Record Recovery feature allows administrators to restore accidentally deleted work orders.

### Accessing Record Recovery

1. Navigate to **Work Orders** > **Record Recovery** (requires Manage permission)
2. View the list of deleted work orders

### Recovering a Work Order

1. Find the deleted work order in the recovery list
2. Review the work order details
3. Click **Recover** to restore the work order
4. The work order will be returned to active status

### Recovery Limitations

- Only deleted work orders appear in the recovery list
- Recovery may have a time limit depending on system configuration
- Requires Manage permission for work orders

---

## Work Order Permissions

Different permission levels control what users can do with work orders:

### Inquiry Only
- View work orders
- Search and filter work orders
- View work order details, notes, milestones, and attachments
- Print work orders

### Update
- All Inquiry permissions, plus:
- Create new work orders
- Edit existing work orders
- Add/edit/delete notes
- Add/edit/delete milestones
- Upload and delete attachments
- Close and reopen work orders
- Delete work orders

### Manage
- All Update permissions, plus:
- Access record recovery
- Recover deleted work orders
- Advanced administrative functions

---

## Tips and Best Practices

### Creating Effective Work Orders

- Provide clear, detailed descriptions
- Include accurate location information
- Add relevant contact information
- Set appropriate priority levels
- Assign to the correct employee or group

### Using Notes Effectively

- Add notes as work progresses
- Document important decisions or changes
- Include time estimates or actual time spent
- Note any obstacles or delays

### Organizing Milestones

- Define clear, measurable milestones
- Use consistent milestone names across similar work orders
- Update milestone status promptly
- Use milestones to track approval workflows

### Managing Attachments

- Use descriptive file names
- Take clear, well-lit photos
- Keep file sizes reasonable
- Remove obsolete attachments

### Leveraging the Map

- Ensure work orders have accurate coordinates
- Use the map to identify geographic patterns
- Plan efficient routing for field workers
- Identify areas with high work order volume
