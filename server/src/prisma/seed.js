const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Localit Production Marketplace Database...');

  // 1. Password hash for test users
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 2. Clear existing transactional records to avoid conflict
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing test data.');

  // 3. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Administrator',
      email: 'admin@localit.market',
      phone: '9999900000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  // 4. Create 3 Shop Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Sunil Sharma',
      email: 'owner1@localit.market',
      phone: '9811000001',
      passwordHash: defaultPasswordHash,
      role: 'SHOP_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Kishore Jain',
      email: 'owner2@localit.market',
      phone: '9811000002',
      passwordHash: defaultPasswordHash,
      role: 'SHOP_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Deepa Rao',
      email: 'owner3@localit.market',
      phone: '9811000003',
      passwordHash: defaultPasswordHash,
      role: 'SHOP_OWNER',
    },
  });

  // 5. Create 20+ Customers
  const customerNames = [
    'Arun Kumar', 'Pooja Hegde', 'Rahul Dravid', 'Ananya Panday', 'Vikram Singh',
    'Sneha Reddy', 'Karthik Aryan', 'Divya Nair', 'Manoj Bajpayee', 'Neha Sharma',
    'Rohan Joshi', 'Priya Mani', 'Amitabh Varma', 'Tanvi Shah', 'Suresh Raina',
    'Meera Jasmine', 'Harish Kalyan', 'Shruti Haasan', 'Gautam Gambhir', 'Kavya Maran',
    'Naveen Polishetty', 'Bhavana Menon'
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const cust = await prisma.user.create({
      data: {
        name: customerNames[i],
        email: `customer${i + 1}@localit.market`,
        phone: `98765000${(i + 10).toString().slice(-2)}`,
        passwordHash: defaultPasswordHash,
        role: 'CUSTOMER',
      },
    });

    // Create address for customer
    await prisma.address.create({
      data: {
        userId: cust.id,
        recipientName: cust.name,
        phone: cust.phone,
        street: `${100 + i * 5}, ${['HAL 2nd Stage', '100 Feet Rd', '12th Main', 'CMH Rd', 'Defence Colony'][i % 5]}`,
        landmark: 'Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        latitude: 12.9716 + (Math.random() - 0.5) * 0.02,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.02,
        isDefault: true,
      },
    });

    customers.push(cust);
  }

  // 6. Create Product Categories
  const categoriesData = [
    { name: 'Dairy & Eggs', slug: 'dairy-eggs', description: 'Fresh milk, curd, paneer, butter, cheese, and farm eggs' },
    { name: 'Fresh Fruits & Veggies', slug: 'fruits-vegetables', description: 'Fresh farm vegetables, leafy greens, and seasonal fruits' },
    { name: 'Bakery & Breads', slug: 'bakery-breads', description: 'Artisan bread, pav, buns, cookies, and rusk' },
    { name: 'Atta, Rice & Dals', slug: 'staples-grains', description: 'Whole wheat flour, basmati rice, pulses, and lentils' },
    { name: 'Snacks & Biscuits', slug: 'snacks-biscuits', description: 'Crisps, namkeen, premium cookies, and chocolates' },
    { name: 'Beverages & Tea', slug: 'beverages-tea', description: 'Filter coffee, tea bags, fruit juices, and cold drinks' },
    { name: 'Personal Care', slug: 'personal-care', description: 'Soaps, shampoos, oral hygiene, and skincare essentials' },
    { name: 'Household Cleaners', slug: 'household-cleaning', description: 'Detergents, floor cleaners, and surface sanitizers' },
  ];

  const categories = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 7. Create 5 Local Independent Shops
  const shopsData = [
    {
      ownerId: owner1.id,
      shopName: 'Daily Fresh Supermarket',
      description: 'Your trusted neighborhood supermarket since 2012. Fresh farm produce, dairy, and household essentials.',
      phone: '9811000001',
      email: 'dailyfresh@localit.market',
      address: '42, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9719,
      longitude: 77.6412,
      openingTime: '07:00 AM',
      closingTime: '10:30 PM',
      deliveryRadius: 5.0,
      deliveryFee: 20.0,
      minOrderAmount: 99.0,
      status: 'OPEN',
      verificationStatus: 'APPROVED',
    },
    {
      ownerId: owner2.id,
      shopName: 'Sri Krishna Provision Store',
      description: 'Authentic local provision store offering high quality grains, pulses, fresh Nandini dairy, and daily essentials.',
      phone: '9811000002',
      email: 'srikrishna@localit.market',
      address: '18, 5th Cross, CMH Road, Indiranagar, Bengaluru',
      latitude: 12.9782,
      longitude: 77.6435,
      openingTime: '06:30 AM',
      closingTime: '10:00 PM',
      deliveryRadius: 4.5,
      deliveryFee: 15.0,
      minOrderAmount: 50.0,
      status: 'OPEN',
      verificationStatus: 'APPROVED',
    },
    {
      ownerId: owner3.id,
      shopName: 'The Artisan Bakery & Cafe',
      description: 'Neighborhood boutique bakery baking oven-fresh sourdough, multi-grain bread, milk buns, and confectionery daily.',
      phone: '9811000003',
      email: 'artisanbaker@localit.market',
      address: '89, 12th Main, HAL 2nd Stage, Indiranagar, Bengaluru',
      latitude: 12.9695,
      longitude: 77.6385,
      openingTime: '08:00 AM',
      closingTime: '10:00 PM',
      deliveryRadius: 6.0,
      deliveryFee: 25.0,
      minOrderAmount: 150.0,
      status: 'OPEN',
      verificationStatus: 'APPROVED',
    },
    {
      ownerId: owner1.id,
      shopName: 'Green Orchard Organics',
      description: 'Direct from farmers. Certified pesticide-free fresh greens, exotic fruits, and organic cold-pressed oils.',
      phone: '9811000004',
      email: 'greenorchard@localit.market',
      address: '104, Double Road, Indiranagar, Bengaluru',
      latitude: 12.9740,
      longitude: 77.6450,
      openingTime: '07:30 AM',
      closingTime: '09:30 PM',
      deliveryRadius: 5.5,
      deliveryFee: 30.0,
      minOrderAmount: 120.0,
      status: 'OPEN',
      verificationStatus: 'APPROVED',
    },
    {
      ownerId: owner2.id,
      shopName: 'Indiranagar Medicals & Personal Care',
      description: 'Licensed retail pharmacy providing personal hygiene, baby essentials, and daily wellness items.',
      phone: '9811000005',
      email: 'indiranagarmedicals@localit.market',
      address: '22, Old Airport Road, Domlur, Bengaluru',
      latitude: 12.9620,
      longitude: 77.6400,
      openingTime: '08:00 AM',
      closingTime: '11:00 PM',
      deliveryRadius: 5.0,
      deliveryFee: 20.0,
      minOrderAmount: 0.0,
      status: 'OPEN',
      verificationStatus: 'APPROVED',
    },
  ];

  const shops = [];
  for (const s of shopsData) {
    const created = await prisma.shop.create({ data: s });
    shops.push(created);
  }

  // 8. 50+ Products across shops demonstrating MULTI-SHOP PRICING MODEL
  // E.g., Nandini Milk is ₹50 at Shop 0, ₹53 at Shop 1, ₹48 at Shop 2
  const productsCatalog = [
    // DAIRY & EGGS
    {
      name: 'Nandini Pasteurised Toned Milk',
      description: 'Pure, fresh toned milk with 3.0% fat and 8.5% SNF.',
      unit: '500 ml',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 50.0, stock: 45 },
        { shopIndex: 1, price: 53.0, stock: 30 },
        { shopIndex: 2, price: 48.0, stock: 20 },
      ],
    },
    {
      name: 'Amul Taaza Homogenised Toned Milk',
      description: 'Long shelf life UHT treated toned milk.',
      unit: '1 Litre',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 72.0, stock: 25 },
        { shopIndex: 1, price: 74.0, stock: 18 },
      ],
    },
    {
      name: 'Amul Salted Butter',
      description: 'Delicious creamy butter made from fresh cream.',
      unit: '500 g',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 275.0, stock: 15 },
        { shopIndex: 1, price: 280.0, stock: 10 },
        { shopIndex: 2, price: 270.0, stock: 12 },
      ],
    },
    {
      name: 'Milky Mist Farm Fresh Paneer',
      description: 'Soft and wholesome malai paneer.',
      unit: '200 g',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 110.0, stock: 20 },
        { shopIndex: 1, price: 115.0, stock: 14 },
      ],
    },
    {
      name: 'Eggoz Farm Fresh Brown Eggs',
      description: 'Naturally laid nutrient-rich brown eggs with bright orange yolk.',
      unit: '6 pcs pack',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 85.0, stock: 35 },
        { shopIndex: 1, price: 90.0, stock: 22 },
        { shopIndex: 3, price: 82.0, stock: 15 },
      ],
    },
    {
      name: 'Nandini Pure Cow Ghee',
      description: 'Traditional aroma and golden granular texture.',
      unit: '500 ml',
      category: 'dairy-eggs',
      shopPrices: [
        { shopIndex: 0, price: 340.0, stock: 18 },
        { shopIndex: 1, price: 345.0, stock: 12 },
      ],
    },

    // BAKERY & BREADS
    {
      name: 'Britannia 100% Whole Wheat Bread',
      description: 'Wholesome brown bread packed with dietary fiber.',
      unit: '400 g',
      category: 'bakery-breads',
      shopPrices: [
        { shopIndex: 0, price: 45.0, stock: 25 },
        { shopIndex: 1, price: 48.0, stock: 15 },
        { shopIndex: 2, price: 42.0, stock: 30 },
      ],
    },
    {
      name: 'Freshly Baked Garlic Herb Sourdough',
      description: 'Artisanal slow-fermented crusty sourdough with roasted garlic.',
      unit: '1 loaf (450 g)',
      category: 'bakery-breads',
      shopPrices: [
        { shopIndex: 2, price: 140.0, stock: 12 },
      ],
    },
    {
      name: 'Soft Ladi Pav',
      description: 'Pillow-soft Mumbai-style bakery pav for bhaji and vada.',
      unit: '6 pcs pack',
      category: 'bakery-breads',
      shopPrices: [
        { shopIndex: 0, price: 25.0, stock: 40 },
        { shopIndex: 2, price: 30.0, stock: 50 },
      ],
    },
    {
      name: 'Chocolate Chip Brioche Bun',
      description: 'Sweet golden brioche filled with Belgian chocolate chips.',
      unit: '2 pcs pack',
      category: 'bakery-breads',
      shopPrices: [
        { shopIndex: 2, price: 95.0, stock: 18 },
      ],
    },

    // ATTA, RICE & GRAINS
    {
      name: 'Aashirvaad Superior MP Sharbati Atta',
      description: '100% pure whole wheat grain flour with rich golden rotis.',
      unit: '5 kg',
      category: 'staples-grains',
      shopPrices: [
        { shopIndex: 0, price: 280.0, stock: 20 },
        { shopIndex: 1, price: 295.0, stock: 15 },
        { shopIndex: 3, price: 275.0, stock: 10 },
      ],
    },
    {
      name: 'Daawat Rozana Super Basmati Rice',
      description: 'Aromatic long slender grain basmati rice for daily cooking.',
      unit: '5 kg',
      category: 'staples-grains',
      shopPrices: [
        { shopIndex: 0, price: 420.0, stock: 15 },
        { shopIndex: 1, price: 435.0, stock: 8 },
      ],
    },
    {
      name: 'Tata Sampann Unpolished Toor Dal',
      description: 'Naturally protein-rich toor dal unpolished without additives.',
      unit: '1 kg',
      category: 'staples-grains',
      shopPrices: [
        { shopIndex: 0, price: 175.0, stock: 22 },
        { shopIndex: 1, price: 180.0, stock: 16 },
      ],
    },
    {
      name: 'Fortune Sunlite Refined Sunflower Oil',
      description: 'Enriched with Vitamin A and D for light healthy cooking.',
      unit: '1 Litre pouch',
      category: 'staples-grains',
      shopPrices: [
        { shopIndex: 0, price: 135.0, stock: 30 },
        { shopIndex: 1, price: 140.0, stock: 25 },
      ],
    },
    {
      name: 'Tata Salt Vacuum Evaporated Iodised Salt',
      description: 'India’s trusted national iodised salt.',
      unit: '1 kg',
      category: 'staples-grains',
      shopPrices: [
        { shopIndex: 0, price: 28.0, stock: 60 },
        { shopIndex: 1, price: 28.0, stock: 45 },
      ],
    },

    // FRESH FRUITS & VEGGIES
    {
      name: 'Farm Fresh Hybrid Tomatoes',
      description: 'Plump red ripe tomatoes sourced daily.',
      unit: '1 kg',
      category: 'fruits-vegetables',
      shopPrices: [
        { shopIndex: 0, price: 32.0, stock: 40 },
        { shopIndex: 3, price: 38.0, stock: 50 },
      ],
    },
    {
      name: 'Baby Potatoes',
      description: 'Firm, clean mini potatoes great for dum aloo.',
      unit: '1 kg',
      category: 'fruits-vegetables',
      shopPrices: [
        { shopIndex: 0, price: 40.0, stock: 35 },
        { shopIndex: 3, price: 45.0, stock: 30 },
      ],
    },
    {
      name: 'Shimla Royal Delicious Apples',
      description: 'Crisp, sweet, and juicy red mountain apples.',
      unit: '4 pcs (approx 600g)',
      category: 'fruits-vegetables',
      shopPrices: [
        { shopIndex: 0, price: 140.0, stock: 15 },
        { shopIndex: 3, price: 160.0, stock: 20 },
      ],
    },
    {
      name: 'Robusta Golden Bananas',
      description: 'Naturally ripened nutrient-dense sweet bananas.',
      unit: '1 kg (5-6 pcs)',
      category: 'fruits-vegetables',
      shopPrices: [
        { shopIndex: 0, price: 45.0, stock: 30 },
        { shopIndex: 3, price: 50.0, stock: 40 },
      ],
    },

    // SNACKS & BEVERAGES
    {
      name: 'Lay’s India’s Magic Masala Potato Chips',
      description: 'Classic spicy wavy potato chips.',
      unit: '50 g pack',
      category: 'snacks-biscuits',
      shopPrices: [
        { shopIndex: 0, price: 20.0, stock: 50 },
        { shopIndex: 1, price: 20.0, stock: 35 },
      ],
    },
    {
      name: 'Parle-G Gold Biscuits',
      description: 'Bigger, crispier golden glucose biscuits.',
      unit: '1 kg family pack',
      category: 'snacks-biscuits',
      shopPrices: [
        { shopIndex: 0, price: 110.0, stock: 25 },
        { shopIndex: 1, price: 115.0, stock: 18 },
      ],
    },
    {
      name: 'Bru Instant Coffee Powder',
      description: 'Fine roasted blend of robusta and chicory.',
      unit: '100 g jar',
      category: 'beverages-tea',
      shopPrices: [
        { shopIndex: 0, price: 195.0, stock: 20 },
        { shopIndex: 1, price: 205.0, stock: 12 },
      ],
    },
    {
      name: 'Red Label Tea with Natural Flavours',
      description: 'Strong, rich aroma Brooke Bond Red Label CTC tea.',
      unit: '500 g pack',
      category: 'beverages-tea',
      shopPrices: [
        { shopIndex: 0, price: 260.0, stock: 20 },
        { shopIndex: 1, price: 270.0, stock: 15 },
      ],
    },

    // PERSONAL CARE & HOUSEHOLD
    {
      name: 'Dettol Original Germ Protection Bathing Soap',
      description: 'Iconic antiseptic trusted pine fragrance bar soap.',
      unit: '125 g × 4 bars pack',
      category: 'personal-care',
      shopPrices: [
        { shopIndex: 0, price: 180.0, stock: 25 },
        { shopIndex: 4, price: 175.0, stock: 40 },
      ],
    },
    {
      name: 'Colgate Strong Teeth Anticavity Toothpaste',
      description: 'Calcium boost formula for healthy enamel and fresh breath.',
      unit: '200 g tube',
      category: 'personal-care',
      shopPrices: [
        { shopIndex: 0, price: 125.0, stock: 30 },
        { shopIndex: 1, price: 130.0, stock: 20 },
        { shopIndex: 4, price: 120.0, stock: 50 },
      ],
    },
    {
      name: 'Surf Excel Quick Wash Detergent Powder',
      description: 'Superior stain removal formula with pleasant fragrance.',
      unit: '1 kg pack',
      category: 'household-cleaning',
      shopPrices: [
        { shopIndex: 0, price: 155.0, stock: 30 },
        { shopIndex: 1, price: 160.0, stock: 20 },
      ],
    },
    {
      name: 'Vim Dishwash Gel Lemon Scent',
      description: 'Powerful degreasing dish cleaner with natural lemon extract.',
      unit: '750 ml bottle',
      category: 'household-cleaning',
      shopPrices: [
        { shopIndex: 0, price: 145.0, stock: 25 },
        { shopIndex: 1, price: 150.0, stock: 15 },
      ],
    },
  ];

  let totalProductsCreated = 0;
  for (const item of productsCatalog) {
    const category = categories[item.category];
    for (const sp of item.shopPrices) {
      const targetShop = shops[sp.shopIndex];
      if (targetShop && category) {
        await prisma.product.create({
          data: {
            shopId: targetShop.id,
            categoryId: category.id,
            name: item.name,
            description: item.description,
            price: sp.price,
            stockQuantity: sp.stock,
            unit: item.unit,
            status: sp.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
          },
        });
        totalProductsCreated++;
      }
    }
  }

  // 9. Create Promotional Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountAmount: 10.0,
      minOrderAmount: 150.0,
      maxDiscount: 50.0,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'LOCALIT50',
      discountType: 'FIXED',
      discountAmount: 50.0,
      minOrderAmount: 300.0,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
      isActive: true,
    },
  });

  // 10. Create Sample Orders & Verified Reviews
  const firstCustomer = customers[0];
  const firstCustAddress = await prisma.address.findFirst({ where: { userId: firstCustomer.id } });
  const sampleShop = shops[0];
  const sampleProducts = await prisma.product.findMany({ where: { shopId: sampleShop.id }, take: 2 });

  if (sampleProducts.length >= 2 && firstCustAddress) {
    const sampleOrderNumber = 'LOC-20260929-1001';
    const subtotal = sampleProducts[0].price * 2 + sampleProducts[1].price * 1;
    const deliveryFee = sampleShop.deliveryFee;
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const totalAmount = subtotal + deliveryFee + tax;

    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: sampleOrderNumber,
        customerId: firstCustomer.id,
        shopId: sampleShop.id,
        addressId: firstCustAddress.id,
        subtotal,
        deliveryFee,
        tax,
        totalAmount,
        orderStatus: 'DELIVERED',
        paymentStatus: 'PAID',
      },
    });

    for (const p of sampleProducts) {
      await prisma.orderItem.create({
        data: {
          orderId: sampleOrder.id,
          productId: p.id,
          productNameSnapshot: p.name,
          priceSnapshot: p.price,
          quantity: 1,
          subtotal: p.price,
        },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: sampleOrder.id,
        paymentMethod: 'ONLINE_MOCK',
        transactionId: 'TXN-SEED-001',
        amount: totalAmount,
        status: 'PAID',
      },
    });

    // Create Verified Review
    await prisma.review.create({
      data: {
        customerId: firstCustomer.id,
        shopId: sampleShop.id,
        productId: sampleProducts[0].id,
        orderId: sampleOrder.id,
        rating: 5,
        comment: 'Fresh toned milk delivered within 18 minutes directly from Daily Fresh Supermarket! Great local service.',
      },
    });
  }

  console.log(`✅ Seed Completed Successfully!`);
  console.log(`- 1 Platform Admin: admin@localit.market (password: admin123)`);
  console.log(`- 3 Shop Owners: owner1@localit.market, owner2@localit.market, owner3@localit.market (password: password123)`);
  console.log(`- ${shops.length} Local Neighborhood Shops created`);
  console.log(`- ${customers.length} Registered Customers`);
  console.log(`- ${categoriesData.length} Product Categories`);
  console.log(`- ${totalProductsCreated} Products listed demonstrating multi-shop price variations!`);
  console.log(`- Active Coupons: WELCOME10, LOCALIT50`);
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
