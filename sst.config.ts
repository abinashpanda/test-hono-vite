/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'test-hono-vite',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    }
  },
  async run() {
    const vpc = new sst.aws.Vpc('HonoViteVpc')

    const cluster = new sst.aws.Cluster('HonoViteCluster', { vpc })
    new sst.aws.Service('HonoViteService', {
      cluster,
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '4000/http' }],
        domain: { name: 'hono-vite.prodioslabs.com' },
      },
      dev: {
        command: 'bun dev',
      },
    })
  },
})
