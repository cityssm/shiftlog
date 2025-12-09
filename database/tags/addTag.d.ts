interface AddTagForm {
    tagName: string;
    tagBackgroundColor: string;
    tagTextColor: string;
}
export default function addTag(tagFields: AddTagForm, user: User): Promise<boolean>;
export {};
