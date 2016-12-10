
var Model = require('./index.js')

var M = new Model({
	'users': [],
	'comments': []
})

// M.schema.users = {
// 	columns: ['id', 'name', 'date'],
// 	constraints: {
// 		id: {
// 			unique: true,
// 			type: 'number'
// 		}
// 	}
// }

var users = []

for(var u = 1; u < 100; u++){
	users.push({
		id: u,
		name: 'joe',
		date: Date.now()
	})
}

M.insert(users).into('users').exec()

M.update('users').set({name:'bob'}).where({name:'joe'}).exec()

// M.select('users').exec(function(res){})
// M.select('users').where({id:1}).exec(function(res){})
// M.select('users').where({id:5}).exec(function(res){})
// M.select('users').where({id:10}).exec(function(res){})
// M.select('users').where({id:20}).exec(function(res){})
// M.select('users').where({id:30}).exec(function(res){})
// M.select('users').where({id:40}).exec(function(res){})
// M.select('users').where({id:50}).exec(function(res){})


// console.log(M.store.users)
