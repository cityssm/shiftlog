import type { DatabaseUser } from '../../types/record.types.js';
import type { ReportParameters } from './types.js';
export default function getReportData(reportKey: string, reportParameters: ReportParameters, user: DatabaseUser): Promise<unknown[] | undefined>;
