const axios = require('axios');

const testAnalytics = async () => {
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@dars.com',
            password: 'adminpassword'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const analyticsRes = await axios.get('http://localhost:5000/api/admin/analytics', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Analytics Data:', JSON.stringify(analyticsRes.data, null, 2));
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
};

testAnalytics();
