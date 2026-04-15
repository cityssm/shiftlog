import assert from 'node:assert';
import { describe, it } from 'node:test';
import { validateSystemLists } from '../helpers/startup.helpers.js';
await describe('startup.helpers', async () => {
    await it('validateSystemLists() should validate that all required system lists exist', async () => {
        await assert.doesNotReject(async () => {
            await validateSystemLists();
        });
    });
});
