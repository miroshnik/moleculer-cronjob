/*
 * moleculer-cronjob
 * Copyright (c) 2019 Aleksandr Miroshnik (https://github.com/miroshnik/moleculer-cronjob)
 * MIT Licensed
 */

const cron = require('cron')

module.exports = {

  name: 'cronjob',

  /**
   * Default settings
   */
  settings: {
    start: true,
    withoutOverlapping: false
  },

  /**
   * Methods
   */
  methods: {
    onTick () {
      //
    },

    onComplete () {
      //
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created () {
    this.$parallelJobsCount = 0
  },

  /**
   * Service started lifecycle event handler
   */
  started () {
    this.$cronjob = new cron.CronJob({
      ...this.settings,
      context: this,
      onTick: onComplete => setImmediate(async () => {
        this.$parallelJobsCount++
        if (
          !this.settings.withoutOverlapping ||
          (this.settings.withoutOverlapping && this.$parallelJobsCount === 1)
        ) {
          await this.onTick(onComplete)
        }
        this.$parallelJobsCount--
      }),
      onComplete: this.onComplete
    })
  },

  /**
   * Service stopped lifecycle event handler
   */
  async stopped () {
    if (this.$cronjob && this.$cronjob.running) {
      this.$cronjob.stop()

      for (; this.$parallelJobsCount > 0;) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}
