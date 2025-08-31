const axios = require('axios');

async function testFinalLogin() {
  console.log('🧪 Final Login Test - Should Work Now!...\n');
  
  try {
    // Test login with valid credentials
    console.log('1️⃣ Testing login with valid credentials...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'ziaramou200308@gmail.com',
      password: 'Ziar@2024!'
    });
    
    if (response.data.token) {
      console.log('✅ Login successful!');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.user.name}`);
      console.log(`   Current Role: ${response.data.user.currentRole}`);
      console.log(`   All Roles: ${response.data.user.roles.join(', ')}`);
      console.log(`   Message: ${response.data.message}`);
      
      console.log('\n🎉 SUCCESS! The login issue has been resolved!');
      console.log('💡 You can now log in with any of these accounts:');
      console.log('   - ziaramou200308@gmail.com / Ziar@2024!');
      console.log('   - sajidsarower@gmail.com / Sajid@2024!');
      console.log('   - mahiamemu@gmail.com / Mahiam@2024!');
      console.log('   - safin ahamad ifty@gmail.com / Safin@2024!');
      
    } else {
      console.log('❌ Login failed - no token returned');
    }
    
  } catch (error) {
    console.log('❌ Login still failing:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n✨ Final login test complete!');
}

testFinalLogin().catch(console.error);



