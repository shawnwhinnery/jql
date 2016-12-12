var _ = require('lodash')


/**
* @constructor Model
* 	Mass object store with an SQL like interface.
*/
class Model {

	constructor (schema) {

		this.schema = schema || {}
		this.store = {}
		this.query = {}

		for(let table in schema) this.store[table] = this.store[table] || []

	}

	/**
	* @method count
	* @memberof Model
	* Returns the number of records in a table
	*/
	count(table) {
		return this.store[table].length / this.schema[table].columns.length
	}

	insert(insert) {
		this.query.action = 'insert'
		this.query.insert = insert
		return this
	}

	delete(table) {
		this.query.action = 'delete'
		this.query.table = table
		return this
	}

	select(table) {
		this.query.action = 'select'
		this.query.table = table
		return this
	}

	update(table) {
		this.query.action = 'update'
		this.query.table = table
		return this
	}

	set (set) {
		this.query.set = set
		return this
	}

	where (where) {
		this.query.where = where
		return this
	}

	into (table) {
		if(!Array.isArray(_.get(this.store, table))) return console.warn('Table', table, 'is not a collection')
		this.query.table = table
		return this
	}

	exec (_resolve) {

		var table = _.get(this.store, this.query.table),
			schema = _.get(this.schema, this.query.table),
			columns = _.get(schema, 'columns'),
			types = _.get(schema, 'types'),
			resolve = resolve || function(results){ },
			insert = this.query.insert || [],
			set = deflate(this.query.set, columns),
			where = deflate(this.query.where, columns),
			TL = table.length,
			CL = columns.length,
			IL = insert.length,
			iterate = function(iterator){
				for(let i = 0; i < TL; i += CL) iterator(i, i + CL)
			},
			forEach = function(iterator){
				iterate(function(start, end){
					iterator(table.slice(start, end))
				})
			},
			map = function(iterator){

				var newTable = []

				forEach(function(slice){
					newTable.push(iterator(slice))
				})

				return newTable

			},
			filter = function(iterator){

				var newTable = []

				forEach(function(slice){
					if(iterator(slice)) newTable.push.apply(newTable, slice)
				})

				return newTable

			},
			resolve = function(data){

				var res = {
					action: this.query.action,
					duration: Date.now() - this.query.start
				}

				if(data !== undefined) res.data = data

				this.store[this.query.table] = table

				this.query = {}

				// if(Array.isArray(res.data)) console.log(res.action+':','['+res.data.length+' records effected]',res.duration+'ms')
				// else if(typeof res.data === 'number') console.log(res.action+':','['+res.data+' records effected]',res.duration+'ms')
				// else console.log(res.action+': ',res.duration+'ms')

				_resolve(res)

			}.bind(this)

		this.query.start = Date.now()

		// insert
		if(this.query.action === 'insert' && this.query.insert) {

			if(Array.isArray(insert)) {

				for(let i = 0; i < IL; i++) {

					if(IL > 3000) for(let k = 0; k < CL; k++) table.push(insert[i][columns[k]])
					else table.push.apply(table, deflate(insert[i], columns))

				}

			} else {

				table.push.apply(table, deflate(insert, columns))

			}

			return resolve(insert)

		}


		// delete
		if(this.query.action === 'delete' && this.query.table) {

			let newTable,
				oldTableLength = 1 * table.length

			if(this.query.where) {

				newTable = filter(function(record){
					return !matches(record, where)
				})

			} else {
				newTable = [] // nuke the table
			}

			table = newTable

			return resolve((oldTableLength - newTable.length) / columns.length)

		}


		// select
		if(this.query.action === 'select') {

			let inflatedTable = (this.query.where) ?
				map(function(slice){
					if(matches(slice, where)){
						return inflate(slice, columns)
					}
				}).filter(Boolean) :
				map(function(slice){
					return inflate(slice, columns)
				})
			return resolve(inflatedTable)

		}

		// update
		if(this.query.action === 'update' && this.query.set) {
			let recordsTouched = 0
			if(this.query.where) {

				iterate(function(start, end){
					if(matches(table.slice(start,end), where)) {
						for(let i = 0; i < set.length; i++) {
							table[start + i] = (set[i] !== undefined) ? set[i] : table[start + i]
						}
						recordsTouched++
					}
				})

				return resolve(recordsTouched)

			} else {

				iterate(function(start, end){
					for(let i = 0; i < set.length; i++) {
						table[start + i] = (set[i] !== undefined) ? set[i] : table[start + i]
					}
					recordsTouched++
				})

			}


		return resolve(recordsTouched)

		}

	}


}







// ---------------------------------------------------------
function isValid(obj, columns){
	if(!columns[0]) return true
	var cl = columns.length
	for(let c = 0; c < cl; c++) {
		if( typeof obj[c] !== typeof columns[c]) return false
	}
	return true
}

function deflate(obj, columns){
	var record = [],
		cl = columns.length
	for(let c = 0; c < cl; c++) {
		record.push(_.get(obj, columns[c]))
	}
	return record
}

function inflate(array, columns){
	var obj = {}
	for(let c = 0; c < columns.length; c++) {
		obj[columns[c]] = array[c]
	}
	return obj
}

function matches(test,where){
	var match = false
	for(let k in where) {
		if(Array.isArray(where[k])) {
			for(let w = 0; w < where[k].length; w++) {
				if(test[k] === where[k][w]) {
					match = true;
				}
			}
		} else {
			if(test[k] === where[k] && where[k] !== undefined) {
				match = true
			}
		}
	}
	return match
}

// ---------------------------------------------------------

module.exports = Model
