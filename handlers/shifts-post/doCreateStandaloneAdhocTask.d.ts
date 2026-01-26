import type { Request, Response } from 'express';
import type { AdhocTask } from '../../types/record.types.js';
type LatitudeLongitude = number | string | null | undefined;
export type DoCreateStandaloneAdhocTaskResponse = {
    success: false;
    errorMessage: string;
} | {
    success: true;
    adhocTaskId: number;
    adhocTasks: AdhocTask[];
};
export default function handler(request: Request<unknown, unknown, {
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
}>, response: Response<DoCreateStandaloneAdhocTaskResponse>): Promise<void>;
export {};
