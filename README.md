# interesting
A cheap/lighweight Publish/Subscribe service

## Installation
Install via npm

```shell
npm install interesting
```

## Usage

Create Data bus

```javascript
var eventbus = require("interesting")();

```
Subscribe and Publish

```javascript
eventbus.subscribe("data-updates",
	function (message) {
    	console.log("called data updates ", message);
    });

// called after 5 seconds
setTimeout(function () {
        eventbus.publish("data-updates", ["a lot of data", "whatever"]);
    }, 5000);
```


## API

#### EventBus.prototype.subscribe(*name: String*, *callback: Function*): Function
Subscribes a topic to the event bus.

##### parameters
* **name:String**
The topic name to subscribe.

* **callback:Function**
The callback to execute when topic published. callback arguments will be the same as 2nd **publish** parameters up to the last.

##### returns
* **stop:Function**
returned stop function will unsubscribe to the topic when called.


#### EventBus.prototype.publish(*name: String*, ... *message: {Mixed}*): EventBus
Publishes a topic and notifies all subscriptions that matches the topic.

##### parameters
* **name:String**
The topic name to publish.

* **... message:Mixed**
The data/message to publish. They will be used as arguments to subscription callbacks.

##### returns
* **eventbus:EventBus**
returns the current eventbus instance for chaining method calls.


#### EventBus.prototype.purge(): EventBus
Removes all subscriptions.
* **eventbus:EventBus**
returns the current eventbus instance for chaining method calls.