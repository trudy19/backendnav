const {Pool} = require('pg');
const dbConfig = require('../dbconfig')
const pool = new Pool(dbConfig)

module.exports = pool
