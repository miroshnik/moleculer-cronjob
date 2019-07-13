"use strict";

let { ServiceBroker } = require("moleculer");
let CronJob = require("../../index");

// Create broker
let broker = new ServiceBroker({
	logger: console
});

// Create my conjob service
broker.createService({
	name: "my.cronjob",

	mixins: [CronJob],

	settings: {
		cronTime: "*/3 * * * * *",
		runOnInit: true,
		manualStop: true
	},

	metadata: {
		ticksCount: 0,
		startDate: new Date()
	},

	methods: {
		onTick () {
			this.logger.info(`Tick #${++this.metadata.ticksCount}`);

			if (this.metadata.ticksCount === 5) {
				this.$cronjob.stop();
			}
		},

		onComplete () {
			this.logger.info(`Complete.`);
		}
	}
});

// Start broker
broker.start().catch(error => console.log(error));
