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

  const service = broker.createService(serviceSchema)

  it('should be created', async () => {
    await broker.start()
    expect(service).toBeDefined()
    await broker.stop()
  })

  it('should have settings.start to be true', async () => {
    await broker.start()
    expect(service.settings.start).toBe(true)
    await broker.stop()
  })

  it('should have $cronjob initialised', async () => {
    await broker.start()
    expect(service.$cronjob).toBeInstanceOf(cron.CronJob)
    await broker.stop()
  })

  it('should have $cronjob to be running', async () => {
    await broker.start()
    expect(service.$cronjob.running).toBe(true)
    await broker.stop()
  })

  it('should have onTick to be invoked on start', async () => {
    await broker.start()
    await broker.stop()
    expect(onTick).toHaveBeenCalledTimes(1)
  })

  it('should have onComplete to be invoked', async () => {
    await broker.start()
    await broker.stop()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should have $cronjob.stop to be invoked if cronjob is running', async () => {
    await broker.start()
    service.$cronjob.stop()
    service.$cronjob.running = true
    service.$cronjob.stop = jest.fn()
    await broker.stop()
    expect(service.$cronjob.stop).toHaveBeenCalledTimes(1)
  })

  it('should have $cronjob.stop to be not invoked if cronjob is not running', async () => {
    await broker.start()
    service.$cronjob.stop()
    service.$cronjob.stop = jest.fn()
    await broker.stop()
    expect(service.$cronjob.stop).toHaveBeenCalledTimes(0)
  })
})
