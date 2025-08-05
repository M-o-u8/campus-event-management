const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';


const testUsers = [
    {
        name: 'Test Admin',
        email: 'admin2@test.com',
        password: 'password123',
        role: 'admin'
    },
    {
        name: 'Test Organizer',
        email: 'organizer2@test.com',
        password: 'password123',
        role: 'organizer'
    },
    {
        name: 'Test Student',
        email: 'student2@test.com',
        password: 'password123',
        role: 'student'
    }
];

async function testRegistration() {
    console.log('🧪 Testing ULTRA SIMPLIFIED Registration System...\n');
    
    for (const user of testUsers) {
        try {
            console.log(`📝 Testing registration for ${user.role}: ${user.email}`);
            
            const response = await axios.post(`${API_BASE}/register`, user);
            
            if (response.status === 201) {
                console.log(`✅ SUCCESS: ${user.role} registration worked!`);
                console.log(`   User ID: ${response.data.user.id}`);
                console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
            }
            
        } catch (error) {
            console.log(`❌ FAILED: ${user.role} registration failed!`);
            if (error.response) {
                console.log(`   Error: ${error.response.data.error || error.response.data.message}`);
                console.log(`   Details: ${error.response.data.details || 'No details provided'}`);
            } else {
                console.log(`   Error: ${error.message}`);
            }
        }
        console.log('');
    }
    
    console.log('🏁 Registration test completed!');
}


testRegistration().catch(console.error); 