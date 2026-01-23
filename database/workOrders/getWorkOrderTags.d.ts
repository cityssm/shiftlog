interface WorkOrderTagWithColor {
    workOrderId: number;
    tagName: string;
    tagBackgroundColor?: string;
    tagTextColor?: string;
}
export default function getWorkOrderTags(workOrderId: number | string): Promise<WorkOrderTagWithColor[]>;
export {};
