interface AddLocationForm {
    locationName: string;
    address1: string;
    address2: string;
    cityProvince: string;
    latitude?: number | null;
    longitude?: number | null;
}
export default function addLocation(locationFields: AddLocationForm, user: User): Promise<boolean>;
export {};
