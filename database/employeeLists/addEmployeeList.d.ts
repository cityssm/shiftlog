export default function addEmployeeList(employeeListFields: {
    employeeListName: string;
    userGroupId: number | undefined;
}, user: User): Promise<number | undefined>;
