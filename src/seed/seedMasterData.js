require('dotenv').config();
const mongoose = require('mongoose');
const MasterData = require('../models/MasterData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/case-management';

// category -> list of { value, label, sortOrder }
const MASTER_DATA = {
  title: [
    { value: 'MR', label: 'Mr' },
    { value: 'MRS', label: 'Mrs' },
    { value: 'MS', label: 'Ms' },
    { value: 'MISS', label: 'Miss' },
    { value: 'DR', label: 'Dr' },
    { value: 'PROF', label: 'Prof' },
  ],
  outcome: [
    { value: 'RECOVERED', label: 'Recovered/Resolved' },
    { value: 'RECOVERING', label: 'Recovering/Resolving' },
    { value: 'NOT_RECOVERED', label: 'Not Recovered/Not Resolved' },
    { value: 'RECOVERED_WITH_SEQUELAE', label: 'Recovered with Sequelae' },
    { value: 'FATAL', label: 'Fatal' },
    { value: 'UNKNOWN', label: 'Unknown' },
  ],
};

const seedMasterData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for master-data seeding');

    const categories = Object.keys(MASTER_DATA);

    // Only clear the categories we're about to seed, so other master-data
    // categories (added later) are left untouched.
    await MasterData.deleteMany({ category: { $in: categories } });
    console.log(`Existing master data cleared for: ${categories.join(', ')}`);

    const documents = [];
    for (const category of categories) {
      MASTER_DATA[category].forEach((item, index) => {
        documents.push({
          category,
          value: item.value,
          label: item.label,
          sortOrder: index,
        });
      });
    }

    await MasterData.insertMany(documents);
    console.log(`Successfully seeded ${documents.length} master-data records`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding master data:', error);
    process.exit(1);
  }
};

seedMasterData();
