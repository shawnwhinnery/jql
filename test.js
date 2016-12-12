
var Model = require('./index.js'),
	loremIpsum = require('lorem-ipsum'),
	colors = require('colors'),
	loremIpsumSettings = {
		count: 1                      // Number of words, sentences, or paragraphs to generate.
		, units: 'sentences'            // Generate words, sentences, or paragraphs.
		, sentenceLowerBound: 5         // Minimum words per sentence.
		, sentenceUpperBound: 15        // Maximum words per sentence.
		, paragraphLowerBound: 3        // Minimum sentences per paragraph.
		, paragraphUpperBound: 7        // Maximum sentences per paragraph.
		, format: 'plain'               // Plain text or html
		// , words: ['ad', 'dolor', ... ]  // Custom word dictionary. Uses dictionary.words (in lib/dictionary.js) by default.
		, random: Math.random           // A PRNG function. Uses Math.random by default
		// , suffix: EOL                   // The character to insert between paragraphs. Defaults to default EOL for your OS.
}

// setup
var M = new Model({
	tags: {
		columns: [
			'id',
			'name'
		]
	},
	users: {
		columns: [
			'id',
			'name',
			'date'
		]
	},
	comments: {
		columns: [
			'id',
			'user',
			'text'
		]
	}
})


var USER_COUNT = 1000,
	COMMENTS_PER_USER = 100,
	COMMENT_COUNT = USER_COUNT * COMMENTS_PER_USER,
	FAILURES = 0,
	SUCCESSES = 0,
	TEST_START= Date.now(),
	ERR = function(msg){console.log('!'.red.bold, msg); FAILURES++},
	SUCCESS = function(msg, duration){console.log('√'.bold.green, msg, ('('+duration.toString()+'ms)').grey); SUCCESSES++},
	users = [],
	comments = [],
	cid = 0

for(let u = 0; u < USER_COUNT; u++) {

	users.push({
		id: u,
		name: 'joe',
		date: Date.now()
	})

	for(let c = 0; c < COMMENTS_PER_USER; c++){
		cid++
		comments.push({
			id: cid,
			user: u,
			text: loremIpsum(loremIpsumSettings)
		})
	}

}


// Insert an array of objects into the database
M.insert({'id': 1,'name': 'yolo'})
 .into('tags')
 .exec(function(res){
	 if((M.count('tags')) !== 1) ERR('Insert single object')
	 else SUCCESS('Insert single object', res.duration)
 })

M.insert(users)
 .into('users')
 .exec(function(res){
	 if((M.count('users')) !== USER_COUNT) ERR('Insert multiple objects')
	 else SUCCESS('Insert multiple objects', res.duration)
 })

// Insert an array of objects into the database
// Shoudl be a test of relational mappings. Users have many comments.
M.insert(comments)
 .into('comments')
 .exec(function(res){
	//  if(M.count('comments') !== COMMENT_COUNT) ERR('Insert multiple objects')
	//  else SUCCESS('Insert multiple objects', res.duration)
 })

M.select('users')
 .exec(function(res){
	if(res.data.length !== USER_COUNT) ERR('Select all')
	else SUCCESS('Select multiple', res.duration)
 })

M.select('users')
 .where({'id':3})
 .exec(function(res){
	if(res.data.length !== 1) ERR('Select where')
	else SUCCESS('Select where', res.duration)
 })


M.update('users')
 .set({'name': 'Sandy'})
 .where({id:3})
 .exec(function(res){
	 M.select('users')
	  .where({name: 'Sandy'}).exec(function(res){
		  if(res.data.length !== 1 || res.data[0].name !== 'Sandy') ERR('Update where')
		  else SUCCESS('Update where', res.duration)
	  })
 })

M.update('users')
 .set({'name': 'Shawn'})
 .exec(function(res){
	 M.select('users')
	  .where({name: 'Shawn'}).exec(function(res){
		  if(res.data.length !== USER_COUNT) ERR('Update')
		  else SUCCESS('Update', res.duration)
	  })
 })

M.delete('users')
 .where({id:3})
 .exec(function(res){
	 if(M.count('users') !== USER_COUNT - 1) ERR('Delete where')
	 else SUCCESS('Delete where', res.duration)
 })


console.log()
console.log('-----------------------------'.grey)
console.log('Test completed in', Date.now() - TEST_START+'ms')
console.log(SUCCESSES.toString().green, 'tests passed')
console.log(FAILURES.toString().red, 'tests failed')
console.log('-----------------------------'.grey)
