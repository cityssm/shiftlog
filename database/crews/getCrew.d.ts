import type { Crew, CrewEquipment, CrewMember } from '../../types/record.types.js';
export interface CrewWithDetails extends Crew {
    members: CrewMember[];
    equipment: CrewEquipment[];
}
export default function getCrew(crewId: number): Promise<CrewWithDetails | undefined>;
