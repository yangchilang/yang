const API_BASE = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 开始测试 API...\n');

  console.log('1️⃣  测试健康检查...');
  try {
    const healthRes = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ 健康检查通过:', healthData);
  } catch (error) {
    console.log('❌ 健康检查失败:', error);
    return;
  }

  console.log('\n2️⃣  测试用户注册...');
  try {
    const registerRes = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      }),
    });
    const registerData = await registerRes.json();
    console.log('✅ 注册成功:', registerData);

    if (registerData.success && registerData.data) {
      const token = registerData.data.token;
      console.log('\n3️⃣  测试获取当前用户...');
      const meRes = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const meData = await meRes.json();
      console.log('✅ 获取用户成功:', meData);

      console.log('\n4️⃣  测试保存解读...');
      const readingRes = await fetch(`${API_BASE}/api/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cards: [{ id: 1, name: 'The Fool', nameCn: '愚人' }],
          interpretation: '这是一个测试解读',
          user_context: '测试',
        }),
      });
      const readingData = await readingRes.json();
      console.log('✅ 保存解读成功:', readingData);

      console.log('\n5️⃣  测试获取解读列表...');
      const listRes = await fetch(`${API_BASE}/api/readings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listData = await listRes.json();
      console.log('✅ 获取解读列表成功:', listData);

      console.log('\n6️⃣  测试登录...');
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerData.data.user.email,
          password: 'password123',
        }),
      });
      const loginData = await loginRes.json();
      console.log('✅ 登录成功:', loginData);
    }
  } catch (error) {
    console.log('❌ API 测试失败:', error);
  }

  console.log('\n✨ 所有测试完成！');
}

testAPI();
