const https = require('https');


async function httpsUtil(host, port, path, query, method) {

    if (query !== '') {
        path += '?' + query;
    }

    const options = {
        hostname: host,
        port: 443,
        path: path,
        method: method
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            // console.log('statusCode:', res.statusCode);
            // console.log('headers:', res.headers);

            res.on('data', (d) => {
                // process.stdout.write(d);
                resolve(d.toString());
            });
        });

        req.on('error', (e) => {
            console.error(e);
        });

        req.end();
    })
}


async function httpsRequest(hostname, port, path, query, method, keyFile, certFile) {
    
    if (query !== '') {
        path += '?' + query;
    }
    
    const options = {
        hostname,
        port,
        path,
        method
    };
    
    if (keyFile) {
        options.key = fs.readFileSync(keyFile);
    }
    
    if (certFile) {
        options.cert = fs.readFileSync(certFile);
    }
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            res.on('data', data => {
                resolve(data.toString());
            });
        });
        
        req.on('error', err => {
            reject(err);
        });
        
        req.end();
    });
}



const qyapiURI = 'qyapi.weixin.qq.com';
const authorizationPath = '/cgi-bin/gettoken';
const corpID = 'wx880defec936e8664';
const corpSecret = 'U2d3y2R9tuuNqTX72JcF06cO5vtQfhEfefY9XjjDaxU';

const getAccessTokenQuery = `corpid=${corpID}&corpsecret=${corpSecret}`;



// httpsUtil('www.baidu.com', '/', '', 'GET')
// httpsUtil(qyapiURI, 443, authorizationPath, getAccessTokenQuery, 'GET')
httpsRequest(qyapiURI, 443, authorizationPath, getAccessTokenQuery, 'GET')
    .then(data => {
        console.log(data);
    })