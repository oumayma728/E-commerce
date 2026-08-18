const request = require('supertest');
const app = require('../src/app');
const { Product, Category, User, UserEvent, sequelize } = require('../models');

async function runTests() {
  console.log('\n🧪 === INTEGRATION & ENDPOINTS VERIFICATION SYSTEM ===\n');

  try {
    // 1. Authenticate with test user
    console.log('🔑 Authenticating user...');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'UserPassword123'
      });

    if (!loginResponse.body.success) {
      throw new Error(`Authentication failed: ${loginResponse.body.message}`);
    }

    const token = loginResponse.body.data.accessToken;
    console.log('✅ Authentication successful. JWT Token obtained.');

    // 2. Fetch a sample product from DB
    const sampleProduct = await Product.findOne({ where: { isActive: true } });
    if (!sampleProduct) {
      throw new Error('No active products found in the database to test.');
    }
    console.log(`📦 Using sample product: "${sampleProduct.name}" (ID: ${sampleProduct.id})`);

    // 3. Test Event Logging (View)
    console.log('\n📡 Testing POST /events/view...');
    const viewResponse = await request(app)
      .post('/events/view')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: loginResponse.body.data.user.id, product_id: sampleProduct.id });

    console.log(`Status: ${viewResponse.status}`);
    console.log('Response:', JSON.stringify(viewResponse.body, null, 2));
    if (viewResponse.status !== 201) throw new Error('Failed to log view event');

    // 4. Test Event Logging (Purchase)
    console.log('\n📡 Testing POST /events/purchase...');
    const purchaseResponse = await request(app)
      .post('/events/purchase')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user_id: loginResponse.body.data.user.id,
        product_ids: [sampleProduct.id],
        total_amount: sampleProduct.price
      });

    console.log(`Status: ${purchaseResponse.status}`);
    console.log('Response:', JSON.stringify(purchaseResponse.body, null, 2));
    if (purchaseResponse.status !== 201) throw new Error('Failed to log purchase event');

    // 5. Test Similar Products Recommendation
    console.log(`\n📡 Testing GET /recommendations/similar/${sampleProduct.id}...`);
    const similarResponse = await request(app)
      .get(`/recommendations/similar/${sampleProduct.id}`);

    console.log(`Status: ${similarResponse.status}`);
    console.log('Similar products found:', similarResponse.body.data.length);
    console.log('First similar product score:', similarResponse.body.data[0]?.similarityScore);
    if (similarResponse.status !== 200) throw new Error('Failed similar recommendations');

    // 6. Test Trending Products Recommendation
    console.log('\n📡 Testing GET /recommendations/trending...');
    const trendingResponse = await request(app)
      .get('/recommendations/trending');

    console.log(`Status: ${trendingResponse.status}`);
    console.log('Trending products found:', trendingResponse.body.data.length);
    if (trendingResponse.status !== 200) throw new Error('Failed trending recommendations');

    // 7. Test Personalized Recommendations
    console.log('\n📡 Testing GET /recommendations/for-you...');
    const personalizedResponse = await request(app)
      .get('/recommendations/for-you')
      .set('Authorization', `Bearer ${token}`);

    console.log(`Status: ${personalizedResponse.status}`);
    console.log('Personalized products found:', personalizedResponse.body.data.length);
    if (personalizedResponse.status !== 200) throw new Error('Failed personalized recommendations');

    // 8. Test Classic Search (Fallback)
    console.log('\n📡 Testing GET /search?q=phone...');
    const classicSearchResponse = await request(app)
      .get('/search?q=phone');

    console.log(`Status: ${classicSearchResponse.status}`);
    console.log('Classic search results count:', classicSearchResponse.body.data.length);
    if (classicSearchResponse.status !== 200) throw new Error('Failed classic search');

    // 9. Test NLP Intelligent Search (using fallback/mock since API key is absent)
    console.log('\n📡 Testing POST /search/nlp (NLP Intelligent Search)...');
    const nlpSearchResponse = await request(app)
      .post('/search/nlp')
      .send({ query: 'laptop pas cher moins de 1500 euros' });

    console.log(`Status: ${nlpSearchResponse.status}`);
    console.log('Extracted Filters:', JSON.stringify(nlpSearchResponse.body.filters, null, 2));
    console.log('NLP results count:', nlpSearchResponse.body.data.length);
    if (nlpSearchResponse.status !== 200) throw new Error('Failed NLP search');

    // 10. Test Reviews Summary
    console.log(`\n📡 Testing GET /search/products/${sampleProduct.id}/review-summary...`);
    const summaryResponse = await request(app)
      .get(`/search/products/${sampleProduct.id}/review-summary`);

    console.log(`Status: ${summaryResponse.status}`);
    console.log('Summary Content:', JSON.stringify(summaryResponse.body.data, null, 2));
    if (summaryResponse.status !== 200) throw new Error('Failed reviews summary');

    console.log('\n🎉 ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY! FOR BOTH RECOMMENDATIONS & NLP SEARCH.');

  } catch (error) {
    console.error('\n❌ INTEGRATION TESTS FAILED:', error.message);
    process.exit(1);
  } finally {
    // Close sequelize connection
    await sequelize.close();
  }
}

runTests();
