const { User, Batch, Verification, Event } = require('../models');
const sequelize = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...\n');

    // Clear existing data
    await sequelize.sync({ force: true });
    console.log('✅ Database cleared\n');

    // Create users
    const farmer1 = await User.create({
      email: 'john@farmer.com',
      password: 'password123',
      name: 'John Smith',
      role: 'farmer',
      phone: '+1234567801',
      reputation: 8.5,
      verified: true
    });

    const farmer2 = await User.create({
      email: 'maria@farmer.com',
      password: 'password123',
      name: 'Maria Garcia',
      role: 'farmer',
      phone: '+1234567802',
      reputation: 9.2,
      verified: true
    });

    const verifier1 = await User.create({
      email: 'alice@verifier.com',
      password: 'password123',
      name: 'Alice Johnson',
      role: 'verifier',
      reputation: 7.8,
      verified: true
    });

    const verifier2 = await User.create({
      email: 'bob@verifier.com',
      password: 'password123',
      name: 'Bob Wilson',
      role: 'verifier',
      reputation: 8.1,
      verified: true
    });

    const verifier3 = await User.create({
      email: 'carol@verifier.com',
      password: 'password123',
      name: 'Carol Davis',
      role: 'verifier',
      reputation: 8.9,
      verified: true
    });

    const consumer = await User.create({
      email: 'consumer@test.com',
      password: 'password123',
      name: 'Test Consumer',
      role: 'consumer'
    });

    console.log('✅ Users created\n');

    // Create batches
    const batch1 = await Batch.create({
      farmerId: farmer1.id,
      produceType: 'Organic Tomatoes',
      quantity: 50,
      unit: 'kg',
      harvestDate: new Date(),
      farmingMethod: 'organic',
      transcription: 'I harvested 50 kilograms of organic tomatoes today. They are very fresh and red.',
      price: 250,
      status: 'verified',
      qualityScore: 8.7
    });

    const batch2 = await Batch.create({
      farmerId: farmer1.id,
      produceType: 'Fresh Lettuce',
      quantity: 30,
      unit: 'kg',
      harvestDate: new Date(),
      farmingMethod: 'organic',
      transcription: 'Fresh organic lettuce, 30 kg. Harvested this morning.',
      price: 150,
      status: 'verified',
      qualityScore: 9.1
    });

    const batch3 = await Batch.create({
      farmerId: farmer2.id,
      produceType: 'Sweet Corn',
      quantity: 100,
      unit: 'kg',
      harvestDate: new Date(),
      farmingMethod: 'conventional',
      transcription: 'Sweet corn, 100 kilograms. Very sweet and tender.',
      price: 200,
      status: 'pending'
    });

    console.log('✅ Batches created\n');

    // Create verifications
    await Verification.create({
      batchId: batch1.id,
      verifierId: verifier1.id,
      score: 9,
      notes: 'Excellent quality tomatoes. Fresh and firm.',
      confidence: 0.9
    });

    await Verification.create({
      batchId: batch1.id,
      verifierId: verifier2.id,
      score: 8,
      notes: 'Very good quality. Minor blemishes but overall great.',
      confidence: 0.85
    });

    await Verification.create({
      batchId: batch1.id,
      verifierId: verifier3.id,
      score: 9,
      notes: 'Premium quality produce.',
      confidence: 0.88
    });

    await Verification.create({
      batchId: batch2.id,
      verifierId: verifier1.id,
      score: 9,
      notes: 'Perfect lettuce. Very fresh.',
      confidence: 0.92
    });

    await Verification.create({
      batchId: batch2.id,
      verifierId: verifier2.id,
      score: 9,
      notes: 'Excellent quality. Crisp and green.',
      confidence: 0.90
    });

    await Verification.create({
      batchId: batch2.id,
      verifierId: verifier3.id,
      score: 9,
      notes: 'Outstanding quality lettuce.',
      confidence: 0.91
    });

    console.log('✅ Verifications created\n');

    // Create events
    await Event.create({
      batchId: batch1.id,
      eventType: 'created',
      description: 'Batch created by John Smith',
      metadata: { quantity: 50, unit: 'kg' }
    });

    await Event.create({
      batchId: batch1.id,
      eventType: 'verified',
      description: 'Batch verified with quality score 8.7/10',
      metadata: { qualityScore: 8.7, verificationCount: 3 }
    });

    await Event.create({
      batchId: batch2.id,
      eventType: 'created',
      description: 'Batch created by John Smith',
      metadata: { quantity: 30, unit: 'kg' }
    });

    await Event.create({
      batchId: batch2.id,
      eventType: 'verified',
      description: 'Batch verified with quality score 9.1/10',
      metadata: { qualityScore: 9.1, verificationCount: 3 }
    });

    await Event.create({
      batchId: batch3.id,
      eventType: 'created',
      description: 'Batch created by Maria Garcia',
      metadata: { quantity: 100, unit: 'kg' }
    });

    console.log('✅ Events created\n');

    console.log('🎉 Database seeded successfully!\n');
    console.log('📧 Demo Credentials:');
    console.log('   Farmer: john@farmer.com / password123');
    console.log('   Verifier: alice@verifier.com / password123');
    console.log('   Consumer: consumer@test.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
