const http = require('http');

function testGetReports(email) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 Testing Get Reports for: ${email}`);
        const url = `http://localhost:5000/api/reports?adminEmail=${encodeURIComponent(email)}`;
        
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`✅ Success. Found ${parsed.length} reports.`);
                        if (parsed.length > 0) {
                            console.log('Sample Inst:', parsed[0].institution);
                        }
                        resolve();
                    } catch (e) {
                        console.error('❌ JSON Parse Error:', e);
                        resolve();
                    }
                } else {
                    console.error(`❌ Failed: Status ${res.statusCode}`);
                    console.error('Data:', data);
                    resolve();
                }
            });
        }).on('error', (err) => {
            console.error(`❌ Network Error: ${err.message}`);
            resolve();
        });
    });
}

async function run() {
    await testGetReports('joy.m2200251@st.futminna.edu.ng');
    await testGetReports('test@futminna.edu.ng');
    await testGetReports('test@unilag.edu.ng');
}

run();
