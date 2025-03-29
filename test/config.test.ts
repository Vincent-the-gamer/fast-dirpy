import { expect } from 'vitest'
import { resolveConfig } from '../src/options'

it('config Load', async () => {
  const config = await resolveConfig({})

  // create fast-dirpy.config.ts first.
  expect(config).toBe({
    timeout: 20000,
    proxy: { protocol: 'http', host: '127.0.0.1', port: 7890 },
  })
})
