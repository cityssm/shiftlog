import type { NoteTypeTemplate } from '../types/application.types.js'

/**
 * Available note type templates for creating predefined note types
 */
const noteTypeTemplates: NoteTypeTemplate[] = [
  {
    templateId: 'equipment-hours',
    templateName: 'Equipment Hours',

    templateDescription: 'Track equipment hours and meter readings',

    noteType: {
      noteType: 'Equipment Hours',
      userGroupId: null,

      isAvailableShifts: true,
      isAvailableTimesheets: false,
      isAvailableWorkOrders: false
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

      isAvailableShifts: true,
      isAvailableTimesheets: false,
      isAvailableWorkOrders: true
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

      isAvailableShifts: true,
      isAvailableTimesheets: false,
      isAvailableWorkOrders: false
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
        fieldInputType: 'text',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'General weather conditions',
        dataListKey: null,
        fieldValueMin: null,
        fieldValueMax: null,
        fieldValueRequired: false,
        hasDividerAbove: false,
        orderNumber: 1
      },
      {
        fieldLabel: 'Precipitation',
        fieldInputType: 'text',
        fieldUnitPrefix: '',
        fieldUnitSuffix: '',
        fieldHelpText: 'Type of precipitation',
        dataListKey: null,
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
