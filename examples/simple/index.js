const { ServiceBroker } = require('moleculer')
const CronJob = require('../../index')

// Create broker
const broker = new ServiceBroker()

// Create my conjob service
broker.createService({
  name: 'my.cronjob',

  mixins: [CronJob],

  settings: {
    cronTime: '*/3 * * * * *', // every 3rd second
    runOnInit: true,
    withoutOverlapping: false
  },

  metadata: {
    ticksCount: 0
  },

  methods: {
    async onTick () {
      this.metadata.ticksCount++

      this.logger.info(`Tick #${this.metadata.ticksCount}, parallelJobsCount ${this.$parallelJobsCount}`)

      if (this.metadata.ticksCount === 5) {
        this.$cronjob.running && this.$cronjob.stop()
      }

      // sleep for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000))
    },

    onComplete () {
      this.logger.info('Complete')
    }
  }
})

// Start broker
broker.start().catch(error => console.log(error))
