import type { NoteTypeTemplate } from '../types/noteTypeTemplates.types.js'

/**
 * Available note type templates for creating predefined note types
 */
const noteTypeTemplates: NoteTypeTemplate[] = [
  {
    templateId: 'inspection-general',
    templateName: 'General Inspection',
    templateDescription:
      'Basic inspection form with pass/fail result and comments',
    noteType: {
      noteType: 'General Inspection',
      userGroupId: null,
      isAvailableWorkOrders: true,
      isAvailableShifts: true,
      isAvailableTimesheets: false
    },
    fields: [
      {
        fieldLabel: 'Inspection Result',
        fieldInputType: 'select',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Overall inspection result',
        dataListKey: 'inspectionResults',
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: true,
        hasDividerAbove: false,
        orderNumber: 0
      },
      {
        fieldLabel: 'Inspector Comments',
        fieldInputType: 'textbox',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Additional notes or observations',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 1
      }
    ]
  },
  {
    templateId: 'equipment-hours',
    templateName: 'Equipment Hours',
    templateDescription: 'Track equipment hours and meter readings',
    noteType: {
      noteType: 'Equipment Hours',
      userGroupId: null,
      isAvailableWorkOrders: false,
      isAvailableShifts: true,
      isAvailableTimesheets: false
    },
    fields: [
      {
        fieldLabel: 'Start Hours',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: 'hrs',
        fieldHelpText: 'Equipment meter reading at start',
        dataListKey: null,
        fieldValueMin: 0,
        fieldValueMax: null,
        fieldValueRequired: true,
        hasDividerAbove: false,
        orderNumber: 0
      },
      {
        fieldLabel: 'End Hours',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: 'hrs',
        fieldHelpText: 'Equipment meter reading at end',
        dataListKey: null,
        fieldValueMin: 0,
        fieldValueMax: null,
        fieldValueRequired: true,
        hasDividerAbove: false,
        orderNumber: 1
      },
      {
        fieldLabel: 'Total Hours',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: 'hrs',
        fieldHelpText: 'Calculated total hours',
        dataListKey: null,
        fieldValueMin: 0,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 2
      }
    ]
  },
  {
    templateId: 'material-quantity',
    templateName: 'Material Quantity',
    templateDescription: 'Record material quantities used',
    noteType: {
      noteType: 'Material Quantity',
      userGroupId: null,
      isAvailableWorkOrders: true,
      isAvailableShifts: true,
      isAvailableTimesheets: false
    },
    fields: [
      {
        fieldLabel: 'Material Type',
        fieldInputType: 'text',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Type of material used',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: true,
        hasDividerAbove: false,
        orderNumber: 0
      },
      {
        fieldLabel: 'Quantity',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Amount of material used',
        dataListKey: null,
        fieldValueMin: 0,
        fieldValueMax: null,
        fieldValueRequired: true,
        hasDividerAbove: false,
        orderNumber: 1
      },
      {
        fieldLabel: 'Unit',
        fieldInputType: 'text',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Unit of measurement (e.g., tons, yards, bags)',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 2
      },
      {
        fieldLabel: 'Notes',
        fieldInputType: 'textbox',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Additional information',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: true,
        orderNumber: 3
      }
    ]
  },
  {
    templateId: 'weather-conditions',
    templateName: 'Weather Conditions',
    templateDescription: 'Document weather conditions during work',
    noteType: {
      noteType: 'Weather Conditions',
      userGroupId: null,
      isAvailableWorkOrders: false,
      isAvailableShifts: true,
      isAvailableTimesheets: false
    },
    fields: [
      {
        fieldLabel: 'Temperature',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '°C',
        fieldHelpText: 'Temperature in Celsius',
        dataListKey: null,
        fieldValueMin: -50,
        fieldValueMax: 50,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 0
      },
      {
        fieldLabel: 'Conditions',
        fieldInputType: 'select',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'General weather conditions',
        dataListKey: 'weatherConditions',
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 1
      },
      {
        fieldLabel: 'Precipitation',
        fieldInputType: 'select',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Type of precipitation',
        dataListKey: 'precipitationTypes',
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 2
      },
      {
        fieldLabel: 'Wind Speed',
        fieldInputType: 'number',
        fieldUnitPrefix: '',
        fieldUnitSuffix: 'km/h',
        fieldHelpText: 'Wind speed in km/h',
        dataListKey: null,
        fieldValueMin: 0,
        fieldValueMax: 200,
        fieldValueRequired: false,
        hasDividerAbove: true,
        orderNumber: 3
      },
      {
        fieldLabel: 'Comments',
        fieldInputType: 'textbox',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Additional weather-related notes',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 4
      }
    ]
  }
]

/**
 * Get all available note type templates
 */
export function getNoteTypeTemplates(): NoteTypeTemplate[] {
  return noteTypeTemplates
}

/**
 * Get a specific note type template by ID
 */
export function getNoteTypeTemplateById(
  templateId: string
): NoteTypeTemplate | undefined {
  return noteTypeTemplates.find(
    (template) => template.templateId === templateId
  )
}
