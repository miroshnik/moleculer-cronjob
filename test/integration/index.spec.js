const cron = require('cron')

const { ServiceBroker } = require('moleculer')
const CronJobMixin = require('../../src')

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

  afterEach(async () => {
    onTick.mockClear()
    onComplete.mockClear()
  })
  afterAll(async () => jest.clearAllMocks())

  const service = broker.createService(serviceSchema)

  it('should be ok', async () => {
    await broker.start()

    expect(service).toBeDefined()
    expect(service.settings.start).toBe(true)
    expect(service.$cronjob).toBeInstanceOf(cron.CronJob)
    expect(service.$cronjob.running).toBe(true)

    await broker.stop()

    expect(service.$cronjob.running).toBe(false)
    expect(onTick).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should have $cronjob.stop to be invoked if cronjob is running', async () => {
    await broker.start()
    const spy = jest.spyOn(service.$cronjob, 'stop')
    service.$cronjob.stop()
    service.$cronjob.running = true
    await broker.stop()
    expect(spy).toHaveBeenCalledTimes(2)
    spy.mockRestore()
  })

  it('should have $cronjob.stop to be not invoked if cronjob is not running', async () => {
    await broker.start()
    const spy = jest.spyOn(service.$cronjob, 'stop')
    service.$cronjob.stop()
    /*
    service.$cronjob.stop = jest.fn()
    */
    await broker.stop()
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})
