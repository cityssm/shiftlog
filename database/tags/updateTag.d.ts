interface UpdateTagForm {
    tagName: string;
    tagBackgroundColor: string;
    tagTextColor: string;
}
export default function updateTag(updateTagForm: UpdateTagForm, user: User): Promise<boolean>;
export {};
