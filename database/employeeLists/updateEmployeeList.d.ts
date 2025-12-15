export default function updateEmployeeList(employeeListFields: {
    employeeListId: number;
    employeeListName: string;
    userGroupId: number | undefined;
}, user: User): Promise<boolean>;
