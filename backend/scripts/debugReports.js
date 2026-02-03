const axios = require('axios');

async function testReports() {
    const emails = [
        'joy.m2200251@st.futminna.edu.ng', // Super Admin
        'vc@futminna.edu.ng',             // FUT Minna Admin
        'admin@unilag.edu.ng'             // Other Admin
    ];

    for (const email of emails) {
        console.log(`\nTesting with email: ${email}`);
        try {
            const res = await axios.get('http://localhost:5000/api/reports', {
                params: { adminEmail: email }
            });
            console.log(`✅ Success! Found ${res.data.length} reports.`);
        } catch (error) {
            console.error(`❌ Failed:`, error.response ? error.response.data : error.message);
        }
    }
}

testReports();
