import type { Crew, CrewMember, CrewEquipment } from '../../types/record.types.js';
interface CrewWithDetails extends Crew {
    members: CrewMember[];
    equipment: CrewEquipment[];
}
export default function getCrew(crewId: number): Promise<CrewWithDetails | undefined>;
export {};
