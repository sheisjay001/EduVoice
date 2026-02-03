const http = require('http');

const data = JSON.stringify({
    institution: 'Federal University of Technology Minna',
    faculty: 'Engineering',
    department: 'Computer Engineering',
    courseCode: 'CPE500',
    encryptedOffender: 'TestOffender',
    encryptedDescription: 'TestDescription'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('BODY: ' + body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
