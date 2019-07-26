const cron = require('cron')

const { ServiceBroker } = require('moleculer')
const CronJobMixin = require('../../src')

jest.setTimeout(30000)

describe('Test CronJob service', () => {
  const broker = new ServiceBroker({ logger: false })

  const onTick = jest.fn()
  const onComplete = jest.fn()

  const serviceSchema = {
    settings: {
      cronTime: '* */5 * * *',
      runOnInit: true
    },
    mixins: [CronJobMixin],
    methods: {
      onTick,
      onComplete
    }
  }

  beforeEach(async () => {
    onTick.mockClear()
    onComplete.mockClear()
  })
  afterAll(async () => jest.clearAllMocks())

  it('should be ok and $cronjob should be the instance of cron.CronJob', async () => {
    const service = broker.createService(serviceSchema)
    await broker.start()
    expect(service.$cronjob).toBeInstanceOf(cron.CronJob)
    await broker.stop()

    await broker.destroyService(service)
  })

  it('should start two simultaneously', async () => {
    const service = broker.createService({
      ...serviceSchema,
      settings: {
        withoutOverlapping: false,
        cronTime: '*/1 * * * * *', // every 1rd secondsd
        runOnInit: false
      },
      methods: {
        onComplete,
        onTick: async () => {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    })

    await broker.start()
    await new Promise(
      (resolve, reject) => setTimeout(
        async () => {
          try {
            expect(service.$parallelJobsCount).toBe(2)
            await broker.destroyService(service)
            await broker.stop()
            resolve()
          }
          catch (err) {
            await broker.destroyService(service)
            await broker.stop()
            reject(err)
          }
        }, 2000
      )
    )
  })

  it('should not start two simultaneously', async () => {
    const service = broker.createService({
      ...serviceSchema,
      settings: {
        withoutOverlapping: true,
        cronTime: '*/1 * * * * *', // every 1rd secondsd
        runOnInit: false
      },
      methods: {
        onComplete,
        onTick: async () => {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    })

    await broker.start()
    await new Promise(
      (resolve, reject) => setTimeout(
        async () => {
          try {
            expect(service.$parallelJobsCount).toBe(1)
            await broker.destroyService(service)
            await broker.stop()
            resolve()
          }
          catch (err) {
            await broker.destroyService(service)
            await broker.stop()
            reject(err)
          }
        }, 2000
      )
    )
  })

  it('should running be false and counter equal to 0', async () => {
    const service = broker.createService(serviceSchema)
    await broker.start()
    await broker.stop()

    expect(service.$cronjob.running).toBe(false)
    expect(service.$parallelJobsCount).toBe(0)

    await broker.destroyService(service)
  })

  it('should onComplete be invoked on stop', async () => {
    const service = broker.createService(serviceSchema)
    await broker.start()
    await broker.stop()

    expect(onComplete).toHaveBeenCalledTimes(1)

    await broker.destroyService(service)
  })

  it('should onTick be invoked on fire', async () => {
    const service = broker.createService(serviceSchema)
    await broker.start()
    await broker.stop()

    expect(onTick).toHaveBeenCalledTimes(1)

    await broker.destroyService(service)
  })
})
