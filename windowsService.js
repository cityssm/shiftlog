import path from 'node:path';
const _dirname = '.';
export const serviceConfig = {
    name: 'ShiftLog',
    description: 'A work management system with work order recording, shift activity logging, and timesheet tracking.',
    script: path.join(_dirname, 'index.js')
};
