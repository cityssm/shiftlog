export interface WorkOrderMoreInfoForm {
  formName: string
  formFields: Record<`moreInfo_${string}`, string>
}

export const availableWorkOrderMoreInfoForms: Record<
  string,
  WorkOrderMoreInfoForm
> = {
  accessibility: {
    formName: 'Accessibility Issue Details',

    formFields: {
      moreInfo_accessibility_barrierType: 'Barrier Type',

      moreInfo_accessibility_assistiveTechnologyUsed:
        'Assistive Technology Used',

      moreInfo_accessibility_assistiveDevicesNeeded:
        'Recommended Assistive Devices Needed',

      moreInfo_accessibility_temporarySolutions: 'Temporary Solutions Provided'
    }
  },

  graffiti: {
    formName: 'Graffiti Incident Details',

    formFields: {
      moreInfo_graffiti_surfaceType: 'Surface Type',
      moreInfo_graffiti_paintUsed: 'Paint Used'
    }
  }
}
