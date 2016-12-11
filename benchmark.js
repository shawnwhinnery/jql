/*
	Benchmark various data operations on the browser
	Abstract the most performant techniques
*/

var Benchmark = require('benchmark'),
	ARRAY_FILTER = new Benchmark.Suite,
	ARRAY_PUSH = new Benchmark.Suite,
	longArrayLength = 64 * 64,
	shortArrayLength = 64,
	shortArray = [],
	longArray = []

for(var i = 0; i < 1000; i++) {
	if(i < shortArrayLength) shortArray.push(i)
	longArray.push(i)
}

// add tests
ARRAY_FILTER.add('Filter (native)', function() {
  var filtered = longArray.filter(function(i){
	  return (i < shortArrayLength)
  })
  return filtered
})
.add('Filter (loop+array)', function() {
	var filtered = []
	for(var i = 0; i < longArrayLength; i++) if(i < shortArrayLength) filtered.push(i)
    return filtered
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });


ARRAY_PUSH.add('Push (for loop)', function() {
  var arr = []
  for(var i = 0; i < longArrayLength; i++) arr.push(longArray[i])
  return filtered
})
.add('Push (applied)', function() {
	var filtered = []
	filtered.push.apply(filtered, longArray)
	return filtered
})
.add('Concat (native)', function() {
	var filtered = [].concat(longArray)
	return filtered
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });
