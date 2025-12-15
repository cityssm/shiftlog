import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableCrew {
    crewId: number;
    crewName: string;
}
export declare function getAvailableCrews(shiftDateString: DateString): Promise<AvailableCrew[]>;
export default getAvailableCrews;
