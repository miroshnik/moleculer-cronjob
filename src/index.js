/*
 * moleculer-cronjob
 * Copyright (c) 2019 Aleksandr Miroshnik (https://github.com/miroshnik/moleculer-cronjob)
 * MIT Licensed
 */

"use strict";

const cron = require("cron");

module.exports = {

	name: "cronjob",

	/**
	 * Default settings
	 */
	settings: {
		start: true,
		manualStop: false
	},

	/**
	 * Methods
	 */
	methods: {
		onTick () {

		},

		onComplete () {

		}
	},

	/**
	 * Service started lifecycle event handler
	 */
	started () {
		this.$cronjob = new cron.CronJob(Object.assign(this.settings,
			{
				context: this,
				onTick: onComplete => setImmediate(() => this.onTick(onComplete)),
				onComplete: this.onComplete
			}));
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	stopped () {
		if (!this.settings.manualStop) {
			this.$cronjob.stop();
		}
	}
};
