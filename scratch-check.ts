async function testSimulation() {
  const API_KEY = '6b8ec198-cff0-45f4-90c2-d3ec6d2975b2.0bbfed74a8fc8265e873deb3a9b4606e0505e4e66354fe42b9284186e60c9753';
  const url = 'http://localhost:3000/api/v1/suppliers/simulate-payment';
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ amount: 1 })
    });
    
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    console.log('Response JSON:', JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

void testSimulation();
