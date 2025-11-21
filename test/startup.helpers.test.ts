import * as assert from 'node:assert'
import { describe, it } from 'node:test'

import { validateSystemLists } from '../helpers/startup.helpers.js'

await describe('startup.helpers', async () => {
  await describe('validateSystemLists()', async () => {
    await it('should validate that all required system lists exist', async () => {
      // This test assumes the database has been properly initialized
      // It will throw an error if any system lists are missing
      await assert.doesNotReject(async () => {
        await validateSystemLists()
      })
    })

    await it('should validate without errors when all system lists are present', async () => {
      const result = await validateSystemLists()
      assert.strictEqual(result, undefined)
    })
  })
})
