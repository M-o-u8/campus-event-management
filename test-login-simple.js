const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Testing Login API...\n');

    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile');
      console.log('✅ Server is running and responding');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Server is running (401 expected for unauthenticated request)');
      } else {
        console.log('❌ Server connection failed:', error.message);
        return;
      }
    }

    // Test 2: Try to register a test user
    console.log('\n2️⃣ Testing user registration...');
    try {
      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['student', 'organizer', 'admin']
      });
      
      console.log('✅ User registered successfully!');
      console.log('   Token:', registerResponse.data.token ? '✅ Present' : '❌ Missing');
      console.log('   User ID:', registerResponse.data.user?.id ? '✅ Present' : '❌ Missing');
      
      // Test 3: Try to login with the registered user
      console.log('\n3️⃣ Testing user login...');
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      console.log('✅ Login successful!');
      console.log('   Token:', loginResponse.data.token ? '✅ Present' : '❌ Missing');
      console.log('   User:', loginResponse.data.user?.name ? '✅ Present' : '❌ Missing');
      console.log('   Current Role:', loginResponse.data.user?.currentRole || '❌ Missing');
      
      // Test 4: Try to get profile with token
      console.log('\n4️⃣ Testing profile access with token...');
      const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('✅ Profile access successful!');
      console.log('   User Name:', profileResponse.data.name);
      console.log('   User Email:', profileResponse.data.email);
      console.log('   User Roles:', profileResponse.data.roles?.join(', '));
      
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
      
      if (error.response?.data?.error === 'Email already exists') {
        console.log('ℹ️ User already exists, trying login...');
        
        // Try to login with existing user
        try {
          const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
          });
          
          console.log('✅ Login successful with existing user!');
          console.log('   Token:', loginResponse.data.token ? '✅ Present' : '❌ Missing');
          console.log('   User:', loginResponse.data.user?.name ? '✅ Present' : '❌ Missing');
        } catch (loginError) {
          console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
        }
      }
    }

    console.log('\n✨ Login test complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();

