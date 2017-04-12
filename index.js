
(function(global) {

	function WebPerformance(opts) {
		this.options = opts;
		this.events = [];
		this.setOptions();
		this.init();
	}

	function _A(a) {
        return Array.prototype.slice.apply(a, Array.prototype.slice.call(arguments, 1));
    }

	WebPerformance.prototype.on = function (eventName, func, force) {
        if (typeof eventName === 'string' && typeof func === 'function') {
            !(eventName in this.events) && (this.events[eventName] = []);
            if (!force) {
                this.events[eventName].push(func);
            } else {
                this.events[eventName].unshift(func);
            }
        }
        return this;
    };

    /**
     * Find callback function position
     * @param {String} eventName
     * @param {Function} func
     * @returns {Boolean}
     * @public
     */
    WebPerformance.prototype.has = function (eventName, func) {
        if (eventName in this.events) {
            return -1 < this.events[eventName].indexOf(func);
        }
        return false;
    };

    /**
     * Remove event callback
     * @param {String} eventName
     * @param {Function} func
     * @public
     */
    WebPerformance.prototype.off = function (eventName, func) {
        if (eventName in this.events) {
            var index = this.events[eventName].indexOf(func);
            if (index > -1) {
                delete this.events[eventName][index];
            }
        }
    };

    /**
     * Trigger event callbacks
     * @param {String} eventName
     * @param {*} args
     * @public
     */
    WebPerformance.prototype.trigger = function (eventNames) {
        var args = _A(arguments, 1);
        eventNames.split(/\x20+/).forEach(function (eventName) {
            if (eventName in this.events) {
                var funcs = this.events[eventName];
                for (var i = 0; i < funcs.length; i++) {
                    typeof funcs[i] === 'function'
                    && funcs[i].apply
                    && funcs[i].apply(this, args);
                }
            }
        }.bind(this));
    };


	WebPerformance.prototype.addEachEvents = function(evts) {
		var self = this;
		if (typeof evts === 'string') {
			var events = [evts] || ['hashchange'];
		}
		else if (Object.prototype.toString.call(evts) === '[object Array]') {
			var events = evts;
		}
		for (var i = 0; i < events.length; i++) {
			(function(eventName) {
				var eventCallback = function(e) {
					var e = e || window.event;
					var eventHookTime = 0;
					var timeAfterEvent = function(time) {
						eventHookTime = eventHookTime + time;
					};
					self.on('executing', timeAfterEvent);
					window.removeEventListener(eventName, eventCallback);
					setTimeout(function() {
                        self.trigger('eachEventHook', {
                            type: 'eachEvent',
                            event: eventName,
                            time: eventHookTime,
                            location: location.href,
                            name: self.name,
                            domClass: e.target.className,
                            domName: e.target.tagName,
                            domId: e.target.id,
                            // domEvent: e
                        });
						window.addEventListener(eventName, eventCallback, false);
					}, self.eventTimeout);
				}
				window.addEventListener(eventName, eventCallback, false);
			})(events[i])
		}
	};

    WebPerformance.prototype.addSlowEvents = function(evts) {
        var self = this;
        if (typeof evts === 'string') {
            var events = [evts] || ['hashchange'];
        }
        else if (Object.prototype.toString.call(evts) === '[object Array]') {
            var events = evts;
        }
        for (var i = 0; i < events.length; i++) {
            (function(eventName) {
                var eventCallback = function(e) {
                    var e = e || window.event;
                    var eventHookTime = 0;
                    var timeAfterEvent = function(time) {
                        eventHookTime = eventHookTime + time;
                    };
                    self.on('executing', timeAfterEvent);
                    window.removeEventListener(eventName, eventCallback);
                    setTimeout(function() {
                        if (eventHookTime > self.slowStandard) {
                            self.trigger('slowEventHook', {
                                type: 'slowEvent',
                                event: eventName,
                                time: eventHookTime,
                                location: location.href,
                                name: self.name,
                                domClass: e.target.className,
                                domName: e.target.tagName,
                                domId: e.target.id,
                                // domEvent: e
                            });
                        }
                        window.addEventListener(eventName, eventCallback, false);
                    }, self.eventTimeout);
                }
                window.addEventListener(eventName, eventCallback, false);
            })(events[i])
        }
    };



	WebPerformance.prototype.setOptions = function () {
		this.onSlowFunc = this.options.onSlowFunc;
		this.onEachEventHook = this.options.onEachEventHook;
        this.onSlowEventHook = this.options.onSlowEventHook;
		this.name = this.options.name;
		this.slowStandard = this.options.slowStandard || 300;
		this.eventTimeout = this.options.eventTimeout || 2000;
	}


	/*
	 *	初始化，开始RAF动画
	 */

	WebPerformance.prototype.init = function() {
		var self = this;

		function timeout() {
			if (requestAnimationFrame) {
				return requestAnimationFrame
			}
			else {
				return setTimeout
			}
		}
		function animate() {
		    self.begin();
		    self.end();
		    timeout()( animate );
		}
		timeout()( animate )
		//setInterval( animate, 100 );
		self.state = 'inited';
		self.on('slowFunc', function(data) {
			self.onSlowFunc && self.onSlowFunc(data);
		});

		self.on('slowEventHook', function(data) {
			self.onSlowEventHook && self.onSlowEventHook(data);
		});

        self.on('eachEventHook', function(data) {
            self.onEachEventHook && self.onEachEventHook(data);
        });
	};

	WebPerformance.prototype.begin = function() {
		this.beginTime = this.beginTime ? this.beginTime : ( performance || Date ).now() ;
	}

	WebPerformance.prototype.end = function() {
		var time = ( performance || Date ).now();
		var ms = time - this.beginTime;
		var extraTime;
		if (performance && performance.memory) {
			this.memory = performance.memory.usedJSHeapSize / 1048576 + 'MB';
		}
		else {
			this.memory = 'unknown';
		}
		this.beginTime = time;
		if (ms > 19) {
			extraTime = ms - 9;
			this.trigger('executing', extraTime);
			if (ms > this.slowStandard && ms < 15000) {
				this.trigger('slowFunc', { type: 'slowFunc', time: extraTime, location: location.href, name: this.name });
			}
		}
	}

    if (typeof require === 'function' && typeof module === 'object' && module && typeof exports === 'object' && exports) {
        module.exports = WebPerformance;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function() { return (global.WebPerformance = WebPerformance) });
    }
    else {
        global.WebPerformance = WebPerformance;
    }

})(window);