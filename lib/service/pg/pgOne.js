'use strict';


let pg = require('pg');

let config = {
    user: 'postgres',
    database: 'postgres',
    password: 'posky314',
    port: 5432,
};

let pool = new pg.Pool(config);

pool.connect((err, client, done) => {
    if (err) {
        console.log(err);
    }
    
    client.query('SELECT * from public.test', (err, res) => {
        done();
        
        console.log(JSON.stringify(res.rows));
    })
})