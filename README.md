![Moleculer logo](http://moleculer.services/images/banner.png)

[![NPM version](https://img.shields.io/npm/v/moleculer-cronjob.svg)](https://www.npmjs.com/package/moleculer-cronjob)
[![Build Status](https://travis-ci.org/miroshnik/moleculer-cronjob.svg?branch=master)](https://travis-ci.org/miroshnik/moleculer-cronjob)
[![Coverage Status](https://coveralls.io/repos/github/miroshnik/moleculer-cronjob/badge.svg?branch=master)](https://coveralls.io/github/miroshnik/moleculer-cronjob?branch=master)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/07f31537d4694cdc8226bc8427d139c0)](https://www.codacy.com/app/miroshnik/moleculer-cronjob?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=miroshnik/moleculer-cronjob&amp;utm_campaign=Badge_Grade)
[![Code Climate](https://codeclimate.com/github/miroshnik/moleculer-cronjob/badges/gpa.svg)](https://codeclimate.com/github/miroshnik/moleculer-cronjob)
[![David](https://img.shields.io/david/miroshnik/moleculer-cronjob.svg)](https://david-dm.org/miroshnik/moleculer-cronjob)
[![Known Vulnerabilities](https://snyk.io/test/github/miroshnik/moleculer-cronjob/badge.svg)](https://snyk.io/test/github/miroshnik/moleculer-cronjob)

## The `moleculer-cron` is the [cron](https://www.npmjs.com/package/cron) based scheduler service for [Moleculer](https://github.com/moleculerjs/moleculer)

## Install

```
$ npm install moleculer-cronjob --save
```

## Usage

```javascript
const { ServiceBroker } = require('moleculer')
const CronJob = require('../../index')

// Create broker
const broker = new ServiceBroker()

// Create my conjob service
broker.createService({
  name: 'my.cronjob',

  mixins: [CronJob],

  settings: {
    cronTime: '* * * * * *',
  },

  methods: {
    onTick () {
      this.logger.info(`Tick`)
    }
  }
})

// Start broker
broker.start().catch(error => console.log(error))
```

The service uses settings as the `cron.СronJob` constructor parameters, except for `onTick` and `onComplete`, for which the `onTick` and `onComplete` methods are used respectively.  
The object returned by the `cron.СronJob` constructor is stored in `this.$cronjob` property, accessible everywhere within the service's context.  
Cronjob stops automatically when the service is stopped, but can also be stopped manually.  

```javascript
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
``` 

## Test

```
$ npm test
```

In development with watching

```
$ npm run ci
```

## Contribution

Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License

The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (c) 2019 Aleksandr Miroshnik  
[miroshnik@gmail.com](mailto:miroshnik@gmail.com)
