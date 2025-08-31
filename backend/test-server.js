const axios = require('axios');

const testBackend = async () => {
  try {
    console.log('🧪 Testing backend connection...');
    
    // Test basic server connection
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Server is running:', response.data);
    
    // Test auth endpoint
    const authResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'mahiamemu@gmail.com',
      password: 'mahia123'
    });
    
    console.log('✅ Login test successful');
    console.log('User data:', authResponse.data.user);
    console.log('User roles:', authResponse.data.user.roles);
    console.log('Current role:', authResponse.data.user.currentRole);
    
  } catch (error) {
    console.error('❌ Backend test failed:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Make sure backend is running on port 5000');
    } else if (error.response) {
      console.error('Server responded with error:', error.response.status);
      console.error('Error message:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testBackend(); 