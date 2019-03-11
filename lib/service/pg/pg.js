'use strict';


let knex = require('knex');


let pgConf = {
    client: 'pg',       // './dialects/pg/index.js'
    
    host: 'localhost',
    connection: {
        database: 'postgres',
        user: 'postgres',
        password: 'posky314',
        port: 5432
    },
};

let pg = knex(pgConf);


pg.select('*').from('public.test').then(res => {
    console.log(res);
})