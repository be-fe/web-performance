## README

### Why?

The popular SPA web pages are quite different from our traditional web page, most web performance tools can't fit in the scenarios. In most of the cases, we are not interested in the network slowness, but also the slowness of js runtime.

This tool is for monitering some hipcups during your page js runtime. It will start a regularly sampling process, and mark down the slowness point (based on the definition of slowness you gave in the config) while the user is interacting with your page. 

### How to get

##### use npm:
```sh
npm install jsperformance
```

##### use script:
```html
<script src="jsperformance.js"></script>
```

### How to use

``` js
var webPerformance = new WebPerformance({
	name: 'Tester',        // Your app name
	slowStandard: 400,     // The definition of slowness for the js runtime (in miliseconds)
						   // When a slowness is met (longer than XXX ms), a callback onSlowFunc will be triggered
	eventTimeout: 2500,	   
	onEventHook: function(data) {
		console.log(data);
	},
	onSlowFunc: function(data) {
		console.log(data);
	},
	
});
webPerformance.addEvents(['click', 'hashchange', 'resize']);  //the events you want to check
```