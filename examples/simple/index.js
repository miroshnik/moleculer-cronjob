const { ServiceBroker } = require('moleculer')
const CronJob = require('../../index')

// Create broker
const broker = new ServiceBroker()

// Create my conjob service
broker.createService({
  name: 'my.cronjob',

  mixins: [CronJob],

  settings: {
    cronTime: '*/3 * * * * *',
    runOnInit: true
  },

  metadata: {
    ticksCount: 0
  },

  methods: {
    onTick () {
      this.logger.info(`Tick #${++this.metadata.ticksCount}`)

      if (this.metadata.ticksCount === 5) {
        this.$cronjob.stop()
      }
    },

    onComplete () {
      this.logger.info('Complete')
    }
  }
})

// Start broker
broker.start().catch(error => console.log(error))
