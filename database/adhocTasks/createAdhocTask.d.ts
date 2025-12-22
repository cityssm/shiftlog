type LatitudeLongitude = number | string | null | undefined;
export default function createAdhocTask(task: {
    adhocTaskTypeDataListItemId: number | string;
    taskDescription: string;
    locationAddress1: string;
    locationAddress2: string;
    locationCityProvince: string;
    locationLatitude: LatitudeLongitude;
    locationLongitude: LatitudeLongitude;
    fromLocationAddress1: string;
    fromLocationAddress2: string;
    fromLocationCityProvince: string;
    fromLocationLatitude: LatitudeLongitude;
    fromLocationLongitude: LatitudeLongitude;
    toLocationAddress1: string;
    toLocationAddress2: string;
    toLocationCityProvince: string;
    toLocationLatitude: LatitudeLongitude;
    toLocationLongitude: LatitudeLongitude;
    taskDueDateTimeString: string | null | undefined;
}, sessionUser: {
    userName: string;
}): Promise<number | undefined>;
export {};
