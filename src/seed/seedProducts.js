 require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/case-management';
const TOTAL_RECORDS = 2000;

// Base medicine/drug names (generic + common Indian brand names)
const BASE_NAMES = [
  'Aspirin', 'Crocin', 'Dolo 650', 'Azithromycin', 'Paracetamol',
  'Ibuprofen', 'Amoxicillin', 'Cetirizine', 'Metformin', 'Amlodipine',
  'Atorvastatin', 'Omeprazole', 'Pantoprazole', 'Ranitidine', 'Losartan',
  'Diclofenac', 'Ciprofloxacin', 'Doxycycline', 'Azee', 'Combiflam',
  'Calpol', 'Disprin', 'Volini', 'Moov', 'Zerodol',
  'Sinarest', 'Cheston Cold', 'Vicks Action 500', 'Digene', 'Eno',
  'Gelusil', 'Levocetirizine', 'Montelukast', 'Domperidone', 'Ondansetron',
  'Metronidazole', 'Norfloxacin', 'Ofloxacin', 'Cefixime', 'Cefpodoxime',
  'Clavulanic Acid', 'Amoxyclav', 'Augmentin', 'Monocef', 'Taxim',
  'Pan D', 'Pan 40', 'Rantac', 'Zinetac', 'Ecosprin',
  'Glimepiride', 'Glipizide', 'Insulin Glargine', 'Human Mixtard', 'Telmisartan',
  'Ramipril', 'Enalapril', 'Clopidogrel', 'Rosuvastatin', 'Simvastatin',
  'Levothyroxine', 'Thyronorm', 'Eltroxin', 'Prednisolone', 'Dexamethasone',
  'Betamethasone', 'Hydrocortisone', 'Salbutamol', 'Asthalin', 'Budesonide',
  'Formoterol', 'Deriphyllin', 'Theophylline', 'Chlorpheniramine', 'Fexofenadine',
  'Loratadine', 'Allegra', 'Avil', 'Benadryl', 'Ascoril',
  'Grilinctus', 'Corex', 'Alex', 'Zincovit', 'Becosules',
  'Neurobion Forte', 'Shelcal', 'Calcirol', 'Supracal', 'Livogen',
  'Folvite', 'B-Complex', 'Vitamin C', 'Limcee', 'Celin',
  'Multivitamin', 'Revital', 'Vitalize', 'Protinex', 'Ensure',
  'Sorbitrate', 'Nitrocontin', 'Digoxin', 'Furosemide', 'Lasix',
  'Spironolactone', 'Hydrochlorothiazide', 'Torsemide', 'Warfarin', 'Heparin',
  'Tramadol', 'Diazepam', 'Alprazolam', 'Escitalopram', 'Sertraline',
  'Fluoxetine', 'Amitriptyline', 'Olanzapine', 'Risperidone', 'Quetiapine',
  'Gabapentin', 'Pregabalin', 'Phenytoin', 'Sodium Valproate', 'Carbamazepine',
  'Levetiracetam', 'Clonazepam', 'Baclofen', 'Tizanidine', 'Chlorzoxazone',
];

// Common dosage forms / strengths used to create realistic variants
const VARIANTS = [
  '', '250mg Tablet', '500mg Tablet', '650mg Tablet', '10mg Tablet',
  '20mg Tablet', '40mg Tablet', '5mg Tablet', '100mg Tablet', 'Syrup',
  'Suspension', 'Injection', 'Capsule', 'Drops', 'Ointment',
  'Gel', 'Cream', 'DS Tablet', 'XR Tablet', 'Forte Tablet',
];

const generateProducts = (count) => {
  const products = [];
  const usedNames = new Set();
  let index = 0;

  outer: for (const base of BASE_NAMES) {
    for (const variant of VARIANTS) {
      const name = variant ? `${base} ${variant}` : base;
      if (usedNames.has(name)) continue;
      usedNames.add(name);

      index += 1;
      const paddedCode = String(index).padStart(4, '0');
      products.push({
        productCode: `P${paddedCode}`,
        productName: name,
      });

      if (index >= count) break outer;
    }
  }

  // Fallback: if base+variant combinations run short of `count`,
  // pad remaining slots with numbered duplicates of base names.
  let suffix = 2;
  while (index < count) {
    for (const base of BASE_NAMES) {
      const name = `${base} (Batch ${suffix})`;
      if (usedNames.has(name)) continue;
      usedNames.add(name);

      index += 1;
      const paddedCode = String(index).padStart(4, '0');
      products.push({
        productCode: `P${paddedCode}`,
        productName: name,
      });

      if (index >= count) break;
    }
    suffix += 1;
  }

  return products;
};

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    const products = generateProducts(TOTAL_RECORDS);
    await Product.insertMany(products);

    console.log(`Successfully seeded ${products.length} products`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();