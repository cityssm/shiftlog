interface UpdateLocationForm {
    locationId: number;
    address1: string;
    address2: string;
    cityProvince: string;
    latitude?: number | null;
    longitude?: number | null;
}
export default function updateLocation(updateLocationForm: UpdateLocationForm, user: User): Promise<boolean>;
export {};
