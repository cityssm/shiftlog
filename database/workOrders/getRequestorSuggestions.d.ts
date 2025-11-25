export default function doGetRequestorSuggestions(searchString: string, user?: User): Promise<Array<{
    requestorContactInfo: string;
    requestorName: string;
}>>;
