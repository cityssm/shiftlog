import fs from 'node:fs';
import path from 'node:path';
import fileToText from '@cityssm/file-to-text';
import { millisecondsInOneMinute } from '@cityssm/to-millis';
import Debug from 'debug';
import exitHook from 'exit-hook';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed';
import getWorkOrderAttachmentsForTranscription from '../../database/workOrders/getWorkOrderAttachmentsForTranscription.js';
import { getConfigProperty } from '../../helpers/config.helpers.js';
import updateWorkOrderAttachmentDescription from '../../database/workOrders/updateWorkOrderAttachmentDescription.js';
import { DEBUG_NAMESPACE } from '../../debug.config.js';
const attachmentStoragePath = getConfigProperty('application.attachmentStoragePath');
const debug = Debug(`${DEBUG_NAMESPACE}:tasks:transcriptions`);
const taskUserName = 'system.transcriptionTask';
async function transcribeFiles() {
    const attachmentsToTranscribe = await getWorkOrderAttachmentsForTranscription();
    for (const attachment of attachmentsToTranscribe) {
        const filePath = path.join(attachmentStoragePath, attachment.fileSystemPath);
        if (!fs.existsSync(filePath)) {
            await updateWorkOrderAttachmentDescription({
                workOrderAttachmentId: attachment.workOrderAttachmentId,
                attachmentDescription: 'File unavailable for transcription'
            }, taskUserName);
            continue;
        }
        try {
            const attachmentText = await fileToText(filePath);
            await updateWorkOrderAttachmentDescription({
                workOrderAttachmentId: attachment.workOrderAttachmentId,
                attachmentDescription: attachmentText.substring(0, 4000)
            }, taskUserName);
        }
        catch (error) {
            debug(error);
            await updateWorkOrderAttachmentDescription({
                workOrderAttachmentId: attachment.workOrderAttachmentId,
                attachmentDescription: `Error during transcription: ${error instanceof Error ? error.message : String(error)}`
            }, taskUserName);
        }
    }
}
await transcribeFiles();
const pollingIntervalMillis = millisecondsInOneMinute;
const intervalTimer = setIntervalAsync(transcribeFiles, pollingIntervalMillis);
exitHook(() => {
    void clearIntervalAsync(intervalTimer);
});
