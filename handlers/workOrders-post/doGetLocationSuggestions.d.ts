import type { Request, Response } from 'express';
import type { Location } from '../../types/record.types.js';
export type DoGetLocationSuggestionsResponse = {
    success: boolean;
    locations: Location[];
};
export default function handler(request: Request<unknown, unknown, {
    searchString: string;
}>, response: Response<DoGetLocationSuggestionsResponse>): Promise<void>;
