[Home](https://cityssm.github.io/shiftlog/)
•
[Help](https://cityssm.github.io/shiftlog/docs/)

# Work Orders

Work Orders are a core feature of ShiftLog, allowing you to track, manage,
and report on various types of work activities. The system provides a flexible
framework that can be customized to track anything from graffiti cleanup
to accessibility complaints to public works maintenance.

## Table of Contents

- [Searching Work Orders](#searching-work-orders)
- [Creating a New Work Order](#creating-a-new-work-order)
- [Viewing Work Orders](#viewing-work-orders)
- [Editing Work Orders](#editing-work-orders)
- [Work Order Features](#work-order-features)
  - [Notes](#notes)
  - [Milestones](#milestones)
  - [Tags](#tags)
  - [Attachments](#attachments)
  - [Costs](#costs)
- [Work Order Map](#work-order-map)
- [Record Recovery](#record-recovery)

---

## Searching Work Orders

The Work Order Search page is the main interface for finding and managing work orders.

### Accessing the Search Page

1. Click on **Work Orders** in the main navigation menu,
2. Or navigate to **Work Orders** > **Work Order Search**.

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

Creating a new work order captures all the necessary information about
a work request or task.

### Steps to Create a Work Order

Navigate to **Work Orders** > **Work Order Search**,
and click the **Create New Work Order** button.

Fill in the required information:

#### Basic Information

- **Work Order Type**: Select the category of work (required)
- **Status**: Set the urgency level
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

Click **Create Work Order** to create the work order

### Location Suggestions

As you type a location, the system will suggest:

- Previously used locations
- Predefined locations from the Location Management section

---

## Viewing Work Orders

The work order view page displays all information about a specific work order.

### Accessing a Work Order

1. Search for the work order using the search page,
2. Click on the work order from the search results,
3. Or navigate directly using the work order number in the URL.

### Work Order Details

The view page shows:

- Work order number and status
- Work order type
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

---

## Editing Work Orders

Users with Update permission can modify existing work orders.

### Editing a Work Order

1. View the work order you want to edit.
2. Click the **Edit** button.
3. Update any of the fields:
   - Work order type
   - Priority
   - Location
   - Description
   - Assigned employees
   - Due date
   - Status
4. Click **Update Work Order** to apply changes.

### Reopening Closed Work Orders

If a work order was closed prematurely:

1. View the closed work order.
2. Click the **Reopen Work Order** button.
3. The work order status will change back to open.
4. You can then edit and update the work order as needed.

---

## Work Order Features

### Notes

Notes allow users to add comments, updates, and observations to a work order.

#### Adding a Note

1. View the work order. Switch to Edit mode.
2. Navigate to the **Notes** tab.
3. Click **Add Note**.
4. Enter your note text.
5. Click **Add Note** to save.

#### Note Features

- Notes are timestamped with the date and author.
- Multiple notes can be added to track ongoing work.
- Notes can be edited or deleted by the author or administrators.
- Notes appear in chronological order.

### Milestones

Milestones track significant events or progress points in completing a work order.

#### Adding a Milestone

1. View the work order. Switch to Edit mode.
2. Navigate to the **Milestones** tab.
3. Click **Add Milestone**.
4. Enter milestone details:
   - Milestone name/description
   - Due date and time
   - Completed date and time
5. Click **Add Milestone**.

#### Managing Milestones

- Milestones can be reordered to reflect the workflow.
- Update milestone status as work progresses.
- Edit or delete milestones as needed.
- Milestones help track multi-step work processes.

#### Common Milestone Examples

- Work assigned
- Work started
- Inspection completed
- Parts ordered
- Work completed
- Quality check passed

### Tags

Tags provide a flexible way to categorize, label, and organize work orders with
customizable color-coding. Tags can be used to indicate status, priority,
categories, or any other classification that helps organize your work.

#### Adding a Tag

1. View the work order. Switch to Edit mode.
2. Navigate to the **Tags** tab.
3. Click **Add Tag**.
4. Enter the tag name.
5. Click **Add Tag** to save.

#### Tag Features

- **System Tags**: Tags that exist in the Tag Management system display with
  their configured background and text colors.
- **Ad-hoc Tags**: Tags that don't exist in the system can still be added and
  will display with default styling.
- Multiple tags can be added to a single work order.
- Tags can be deleted from the work order at any time.
- Tags display on the work order view and in search results.

#### Managing System Tags

To create and manage system-wide tags with custom colors:

1. Navigate to **Administrator Tools** > **Tags** (requires Admin permission).
2. Create tags with custom background and text colors.
3. These tags will automatically display with their configured colors when used on work orders.

See [Tag Management](./adminTags.md) for more information on creating and
managing system tags.

#### Tag Best Practices

- Use consistent tag names across work orders.
- Create system tags for commonly used labels.
- Use tags to filter and organize work orders in searches.
- Choose meaningful tag names that convey information at a glance.
- Use colors strategically (e.g., red for urgent, green for completed).

### Attachments

Attachments allow you to add supporting documents, photos, and files to work orders.

#### Uploading an Attachment

1. View the work order. Switch to Edit mode.
2. Navigate to the **Attachments** tab.
3. Click **Add Attachment**.
4. Select the file from your device.
5. Add a description (optional).
6. Click **Upload Attachment**.

#### Attachment Features

- Supports various file types (images, PDFs, documents).
- File size limits may apply based on system configuration.
- Attachments can be downloaded or viewed.
- Delete attachments if no longer needed.

#### Best Practices for Attachments

- Use photos to document before/after conditions.
- Attach relevant permits or approvals.
- Include diagrams or sketches.
- Add supporting documentation or correspondence.

### Costs

The Costs feature allows you to track expenses associated with a work order,
including materials, labor, equipment, and other costs. This helps with budget
tracking, reporting, and cost analysis.

#### Adding a Cost

1. View the work order. Switch to Edit mode.
2. Navigate to the **Costs** tab.
3. Click **Add Cost**.
4. Enter cost details:
   - **Cost Amount**: The monetary value of the cost
   - **Description**: Details about what the cost represents
5. Click **Add Cost** to save.

#### Managing Costs

- Multiple costs can be added to track different expenses.
- Costs are timestamped with the date and author.
- Edit costs to update the amount or description.
- Delete costs if they were entered in error.
- The total of all costs is displayed in the Costs tab.

#### Cost Tracking Features

- Track all expenses related to a work order in one place.
- Generate cost reports and summaries.
- Monitor budget vs. actual costs.
- Analyze cost trends across work order types.

#### Common Cost Examples

- Materials and supplies
- Labor costs
- Equipment rental
- Contractor fees
- Permit fees
- Parts and components
- Third-party services

#### Best Practices for Costs

- Enter costs promptly to maintain accurate records.
- Use clear, descriptive cost descriptions.
- Break down costs into specific categories for better tracking.
- Review costs regularly for accuracy.
- Use consistent naming conventions for similar cost types.

---

## Work Order Map

The Work Order Map provides a visual, geographic view of work orders.

![Work Order Map showing geographic distribution of work orders with colored markers](./images/workOrders-map.png)

### Accessing the Map

1. Navigate to **Work Orders** > **Open Work Order Map**.
2. The map displays all work orders with location coordinates.

### Map Features

- **Visual Markers**: Work orders appear as colored markers on the map
- **Marker Colors**: Different colors may indicate status, priority, or type
- **Clustering**: Multiple work orders in the same area are grouped together
- **Interactive**: Click on a marker to view work order summary
- **Quick Access**: Navigate directly to a work order from the map

### Map Integration

The map uses OpenStreetMap for free, high-quality mapping without licensing costs.

### Filtering on the Map

- Use the search and filter options to show specific work orders.
- Filter by work order type and the assigned to field.
- The map updates to show only matching work orders.

---

## Record Recovery

The Record Recovery feature allows administrators to restore accidentally
deleted work orders.

### Accessing Record Recovery

1. Navigate to **Work Orders** > **Record Recovery** (requires Manage permission).
2. View the list of deleted work orders.

### Recovering a Work Order

1. Find the deleted work order in the recovery list.
2. Review the work order details.
3. Click **Recover** to restore the work order.
4. The work order will be returned to active status.

### Recovery Limitations

- Only deleted work orders appear in the recovery list.
- Recovery may have a time limit depending on system configuration.
- Requires Manage permission for work orders.

---

## Work Order Permissions

Different permission levels control what users can do with work orders:

### Inquiry Only

- View work orders
- Search and filter work orders
- View work order details, notes, milestones, tags, attachments, and costs
- Print work orders

### Update

- All Inquiry permissions, plus:
- Create new work orders
- Edit existing work orders
- Add/edit/delete notes
- Add/edit/delete milestones
- Add/delete tags
- Upload and delete attachments
- Add/edit/delete costs
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

- Provide clear, detailed descriptions.
- Include accurate location information.
- Add relevant contact information.
- Set appropriate priority levels.
- Assign to the correct employee or group.

### Using Notes Effectively

- Add notes as work progresses.
- Document important decisions or changes.
- Include time estimates or actual time spent.
- Note any obstacles or delays.

### Organizing Milestones

- Define clear, measurable milestones.
- Use consistent milestone names across similar work orders.
- Update milestone status promptly.
- Use milestones to track approval workflows.

### Using Tags Effectively

- Apply tags consistently across similar work orders.
- Use system tags for commonly used categories.
- Tag work orders as status changes occur.
- Use tags to filter and group work orders in searches.

### Managing Attachments

- Use descriptive file names.
- Take clear, well-lit photos.
- Keep file sizes reasonable.
- Remove obsolete attachments.

### Tracking Costs

- Enter costs as they are incurred.
- Use detailed descriptions for each cost.
- Break down large expenses into specific items.
- Review cost totals regularly for accuracy.
- Use cost data for budgeting and reporting.

### Leveraging the Map

- Ensure work orders have accurate coordinates.
- Use the map to identify geographic patterns.
- Plan efficient routing for field workers.
- Identify areas with high work order volume.
