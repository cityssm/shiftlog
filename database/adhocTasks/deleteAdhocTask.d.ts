export default function deleteAdhocTask(adhocTaskId: number | string, sessionUser: {
    userName: string;
}): Promise<boolean>;
