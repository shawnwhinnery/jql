var _ = require('lodash')

function deflate(obj, columns){
	var record = []
	for(var c = 0; c < columns.length; c++) {
		var column = columns[c]
		record.push(_.get(obj, column))
	}
	return record
}

function inflate(array, columns){
	var obj = {}
	for(var c = 0; c < columns.length; c++) {
		var column = columns[c]
		obj[column] = array[c]
	}
	return obj
}

function matches(test,where){
	for(var k in where) {
		if(test[k] !== where[k]) return false
	}
	return true
}

class Model {

	constructor (data) {
		this.store = data || {}
		this.schema = {} // enable flattening of objects into indexed tables
		this.query = {}
	}

	_insert(obj){

		var schema = _.get(this.schema, this.query.table),
			table = _.get(this.store, this.query.table)

		if(schema) {
			var record = deflate(obj, schema.columns)
			for(var i = 0; i < record.length; i++) table.push(record[i])
		} else {
			table.push(obj)
		}

		_.set(this.store, this.query.table, table)

	}

	insert(insert) {
		this.query.action = 'insert'
		this.query.start = Date.now()
		this.query.insert = insert
		return this
	}

	select(table) {
		this.query.action = 'select'
		this.query.start = Date.now()
		this.query.table = table
		return this
	}

	update(table) {
		this.query.action = 'update'
		this.query.start = Date.now()
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

	exec (resolve) {

		var table = _.get(this.store, this.query.table),
			schema = _.get(this.schema, this.query.table),
			resolve = resolve || function(results){ }

		// filter the table before doing anything else
		if(this.query.where) {

			if(schema) {

				var tmpTable = []

				for(var i = 0; i < table.length; i += schema.columns.length) {

					var record = inflate(table.slice(i, (i + schema.columns.length)), schema.columns)

					if(matches(record, this.query.where)) {
						for(var v = 0; v < schema.columns.length; v++) {
							tmpTable.push(table[i+v])
						}
					}

				}

				table = tmpTable

			} else {

				table = table.filter(function(record){

					return matches(record, this.query.where)

				}.bind(this))

			}


		}

		// insert
		if(this.query.action === 'insert' && this.query.insert) {

			if(Array.isArray(this.query.insert)) {

				this.query.insert.map(function(d){
					this._insert(d, this.query.table)
				}.bind(this))

			} else {
				this._insert(this.query.insert, this.query.table)
			}

			_.set(this.store, this.query.table, table)

			resolve(this.query.insert)

		}

		// select
		if(this.query.action === 'select') {

			if(schema) {

				var tmpTable = []

				for(var i = 0; i < table.length; i += schema.columns.length) {
					tmpTable.push(inflate(table.slice(i, (i + schema.columns.length)), schema.columns))
				}

				table = tmpTable

			}

			resolve(table)

		}

		// update
		if(this.query.action === 'update') {

			if(this.query.set) {

				if(schema) {

					for(var i = 0; i < table.length; i += schema.columns.length) {

						var record = inflate(table.slice(i, (i + schema.columns.length)), schema.columns)

						_.merge(record, this.query.set)

						record = deflate(record, schema.columns)

						for(var v = 0; v < record.length; v++){
							table[i+v] = record[v]
						}

					}

				} else {
					table = table.map(function (record) {
						return _.merge(record, this.query.set)
					}.bind(this))
				}

				_.set(this.store, this.query.table, table)

			}

			resolve(table)

		}
		console.log(Date.now() - this.query.start)
		this.query = {}

	}


}

module.exports = Model
