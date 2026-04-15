const noteTypeTemplates = [
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
                fieldHelpText: 'Equipment meter reading at start',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: 'hrs',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: 0,
                fieldValueRequired: true,
                hasDividerAbove: false,
                orderNumber: 0
            },
            {
                fieldLabel: 'End Hours',
                fieldHelpText: 'Equipment meter reading at end',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: 'hrs',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: 0,
                fieldValueRequired: true,
                hasDividerAbove: false,
                orderNumber: 1
            },
            {
                fieldLabel: 'Total Hours',
                fieldHelpText: 'Calculated total hours',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: 'hrs',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: 0,
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
                fieldHelpText: 'Type of material used',
                fieldInputType: 'text',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: null,
                fieldValueRequired: true,
                hasDividerAbove: false,
                orderNumber: 0
            },
            {
                fieldLabel: 'Quantity',
                fieldHelpText: 'Amount of material used',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: 0,
                fieldValueRequired: true,
                hasDividerAbove: false,
                orderNumber: 1
            },
            {
                fieldLabel: 'Unit',
                fieldHelpText: 'Unit of measurement (e.g., tons, yards, bags)',
                fieldInputType: 'text',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: null,
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
                fieldHelpText: 'Temperature in Celsius',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '°C',
                dataListKey: null,
                fieldValueMax: 50,
                fieldValueMin: -50,
                fieldValueRequired: false,
                hasDividerAbove: false,
                orderNumber: 0
            },
            {
                fieldLabel: 'Conditions',
                fieldHelpText: 'General weather conditions',
                fieldInputType: 'text',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: null,
                fieldValueRequired: false,
                hasDividerAbove: false,
                orderNumber: 1
            },
            {
                fieldLabel: 'Precipitation',
                fieldHelpText: 'Type of precipitation',
                fieldInputType: 'text',
                fieldUnitPrefix: '',
                fieldUnitSuffix: '',
                dataListKey: null,
                fieldValueMax: null,
                fieldValueMin: null,
                fieldValueRequired: false,
                hasDividerAbove: false,
                orderNumber: 2
            },
            {
                fieldLabel: 'Wind Speed',
                fieldHelpText: 'Wind speed in km/h',
                fieldInputType: 'number',
                fieldUnitPrefix: '',
                fieldUnitSuffix: 'km/h',
                dataListKey: null,
                fieldValueMax: 200,
                fieldValueMin: 0,
                fieldValueRequired: false,
                hasDividerAbove: true,
                orderNumber: 3
            }
        ]
    }
];
export function getNoteTypeTemplates() {
    return noteTypeTemplates;
}
export function getNoteTypeTemplateById(templateId) {
    return noteTypeTemplates.find((template) => template.templateId === templateId);
}
