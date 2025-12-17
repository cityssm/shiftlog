import type { DateString } from '@cityssm/utils-datetime';
export interface AvailableCrew {
    crewId: number;
    crewName: string;
}
export default function getAvailableCrews(shiftDateString: DateString): Promise<AvailableCrew[]>;
