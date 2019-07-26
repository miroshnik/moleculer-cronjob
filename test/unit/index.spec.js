jest.mock('cron')
const cron = require('cron')
const CronJobMixin = require('../../src')

beforeEach(() => jest.useFakeTimers())

afterEach(() => {
  jest.clearAllTimers()
  cron.CronJob.mockClear()
})

describe('Test CronJob Mixin', () => {
  describe(
    'Test \'stopped\' method',
    () => {
      it('should be ok', async () => {
        const result = await CronJobMixin.stopped()
        return expect(result).toEqual(undefined)
      })

      it('should be ok with empty $cronjob', async () => {
        const context = {
          $cronjob: null
        }

        const result = await CronJobMixin.stopped.call({ ...CronJobMixin, ...context })
        return expect(result).toEqual(undefined)
      })

      it('should be ok with not running', async () => {
        const context = {
          $cronjob: { running: false, $parallelJobsCount: 0 }
        }

        const result = await CronJobMixin.stopped.call({ ...CronJobMixin, ...context })
        return expect(result).toEqual(undefined)
      })

      it('should invoke stop', async () => {
        const context = {
          $cronjob: {
            running: true,
            stop: jest.fn(),
            $parallelJobsCount: 0
          }
        }

        const result = await CronJobMixin.stopped.call({ ...CronJobMixin, ...context })

        expect(context.$cronjob.stop.mock.calls.length).toBe(1)
        expect(context.$cronjob.stop.mock.calls[0][0]).toBe(undefined)

        return expect(result).toEqual(undefined)
      })
    }
  )

  describe(
    'Test \'started\' method',
    () => {
      it ('should be ok with single job', async () => {
        const context = {
          ...CronJobMixin,
          onComplete: jest.fn(),
          onTick: jest.fn(),
          $parallelJobsCount: 0
        }
        const result = CronJobMixin.started.call(context)

        expect(cron.CronJob.mock.calls.length).toBe(1)
        expect(cron.CronJob.mock.calls[0][0].start).toBe(true)
        expect(cron.CronJob.mock.calls[0][0].withoutOverlapping).toBe(false)
        expect(cron.CronJob.mock.calls[0][0].context).toBe(context)
        expect(cron.CronJob.mock.calls[0][0].onComplete).toBe(context.onComplete)
        expect(result).toEqual(undefined)

        const onTickWrapper = cron.CronJob.mock.calls[0][0].onTick

        const onCompleteMock = Math.random()
        onTickWrapper(onCompleteMock)
        expect(setImmediate).toHaveBeenCalledTimes(1);

        const onTickFunc = setImmediate.mock.calls[0][0]
        await onTickFunc()
        expect(context.$parallelJobsCount).toBe(0)
        expect(context.onTick.mock.calls.length).toBe(1)
        expect(context.onTick.mock.calls[0][0]).toBe(onCompleteMock)
      })

      it ('should be ok without overlapping', async () => {
        const context = {
          ...CronJobMixin,
          onComplete: jest.fn(),
          onTick: jest.fn(),
          $parallelJobsCount: 0,
          settings: {
            start: true,
            withoutOverlapping: true
          }
        }
        const result = CronJobMixin.started.call(context)

        expect(cron.CronJob.mock.calls.length).toBe(1)
        expect(cron.CronJob.mock.calls[0][0].start).toBe(true)
        expect(cron.CronJob.mock.calls[0][0].withoutOverlapping).toBe(true)
        expect(cron.CronJob.mock.calls[0][0].context).toBe(context)
        expect(cron.CronJob.mock.calls[0][0].onComplete).toBe(context.onComplete)
        expect(result).toEqual(undefined)

        const onTickWrapper = cron.CronJob.mock.calls[0][0].onTick

        const onCompleteMock = Math.random()
        onTickWrapper(onCompleteMock)
        expect(setImmediate).toHaveBeenCalledTimes(1);

        const onTickFunc = setImmediate.mock.calls[0][0]
        await onTickFunc()
        expect(context.$parallelJobsCount).toBe(0)
        expect(context.onTick.mock.calls.length).toBe(1)
        expect(context.onTick.mock.calls[0][0]).toBe(onCompleteMock)
      })

      it ('should be ok without overlapping and with several jobs', async () => {
        const parallelJobsCount = 2 + Math.ceil(Math.random() * 10000)
        const context = {
          ...CronJobMixin,
          onComplete: jest.fn(),
          onTick: jest.fn(),
          $parallelJobsCount: parallelJobsCount,
          settings: {
            start: true,
            withoutOverlapping: true
          }
        }
        const result = CronJobMixin.started.call(context)

        expect(cron.CronJob.mock.calls.length).toBe(1)
        expect(cron.CronJob.mock.calls[0][0].start).toBe(true)
        expect(cron.CronJob.mock.calls[0][0].withoutOverlapping).toBe(true)
        expect(cron.CronJob.mock.calls[0][0].context).toBe(context)
        expect(cron.CronJob.mock.calls[0][0].onComplete).toBe(context.onComplete)
        expect(result).toEqual(undefined)

        const onTickWrapper = cron.CronJob.mock.calls[0][0].onTick

        const onCompleteMock = Math.random()
        onTickWrapper(onCompleteMock)
        expect(setImmediate).toHaveBeenCalledTimes(1)

        const onTickFunc = setImmediate.mock.calls[0][0]
        await onTickFunc()
        expect(context.$parallelJobsCount).toBe(parallelJobsCount)
        expect(context.onTick.mock.calls.length).toBe(0)
      })
    }
  )

  describe(
    'Test \'created\' method',
    () => {
      it('should be ok', () => {
        const context = { $parallelJobsCount: Math.random() }
        const result = CronJobMixin.created.call(context)
        expect(context.$parallelJobsCount).toBe(0)
        return expect(result).toEqual(undefined)
      })
    }
  )
})
