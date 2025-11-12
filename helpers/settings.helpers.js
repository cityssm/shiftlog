import { randomBytes } from 'node:crypto';
import updateSetting from '../database/app/updateSetting.js';
import { getCachedSettingValue } from './cache/settings.cache.js';
export async function getCsrfSecret() {
    let csrfSecret = await getCachedSettingValue('application.csrfSecret');
    if (csrfSecret === '') {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        csrfSecret = randomBytes(64).toString('hex');
        await updateSetting({
            settingKey: 'application.csrfSecret',
            settingValue: csrfSecret
        });
    }
    return csrfSecret;
}
