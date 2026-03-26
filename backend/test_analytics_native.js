const http = require('http');

const post = (url, data) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (url, token) => {
    return new Promise((resolve, reject) => {
        const req = http.request(url, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.end();
    });
};

async function test() {
    try {
        const login = await post('http://localhost:5000/api/auth/login', {
            email: 'admin@dars.com',
            password: 'adminpassword'
        });
        console.log('Login successful');
        const analytics = await get('http://localhost:5000/api/admin/analytics', login.token);
        console.log('Analytics Data:', JSON.stringify(analytics, null, 2));
    } catch (e) {
        console.error('Test failed:', e.message);
    }
}

test();
