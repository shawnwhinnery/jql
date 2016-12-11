
var Model = require('./index.js'),
	loremIpsum = require('lorem-ipsum'),
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

var M = new Model({
	users: {
		columns: ['id', 'name', 'date']
	},
	comments: {
		columns: ['user', 'text']
	}
})


var users = [],
	comments = [],
	cid = 0

for(let u = 0; u < 1000; u++) {

	users.push({
		id: u,
		name: 'joe',
		date: Date.now()
	})

	for(let c = 0; c < 100; c++){
		cid++
		comments.push({
			id: cid,
			user: u,
			text: loremIpsum(loremIpsumSettings)
		})
	}

}


// Insert an array of objects into the database
M.insert(users)
 .into('users')
 .exec(function(res){
	 if((M.store.users.length / M.schema.users.columns.length) !== users.length) console.log('!', 'Insert query failed')
 })
// Insert an array of objects into the database
M.insert(comments)
 .into('comments')
 .exec(function(res){
	 if((M.store.comments.length / M.schema.comments.columns.length) !== comments.length) console.log('!', 'Insert query failed')
 })

M.select('users')
 .exec(function(res){
	if(res.data.length !== users.length) console.log('!', 'Select query failed')
 })

M.select('users')
 .where({'id':3})
 .exec(function(res){
	if(res.data.length !== 1) console.log('!', 'Select where query failed')
 })

M.select('users')
 .where({'id':3})
 .exec(function(res){
	if(res.data.length !== 1) console.log('!', 'Select where query failed')
 })

M.update('users')
 .set({'name': 'Sandy'})
 .where({id:3})
 .exec(function(res){
	 M.select('users')
	  .where({name: 'Sandy'}).exec(function(res){
		  if(res.data.length !== 1 || res.data[0].name !== 'Sandy') console.log('Update query failed')

			M.select('comments')
			 .where({user:res.data[0].id})
			 .exec(function (res) {
				//  console.log(res.data)
			 })

	  })
 })

M.delete('users')
 .where({name:'Sandy'})
 .exec(function(res){
	 if((M.store.users.length / M.schema.users.columns.length) !== users.length - 1) console.log('Delete query failed')
 })
