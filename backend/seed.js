const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Book = require('./models/Book');
const Membership = require('./models/Membership');

dotenv.config();

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management');
    
    console.log('Connected to MongoDB');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await Membership.deleteMany({});
    
    // Create admin user
    console.log('Creating admin user...');
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      email: 'admin@library.com',
      userType: 'admin'
    });
    await admin.save();
    console.log('✓ Admin user created');
    
    // Create regular users
    console.log('Creating regular users...');
    const user1 = new User({
      username: 'user1',
      password: 'user123',
      email: 'user1@library.com',
      userType: 'user'
    });
    
    const user2 = new User({
      username: 'user2',
      password: 'user123',
      email: 'user2@library.com',
      userType: 'user'
    });
    
    await user1.save();
    await user2.save();
    console.log('✓ User accounts created');
    
    // Create sample books
    console.log('Creating sample books...');
    const books = [
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        serialNumber: 'BOOK001',
        category: 'Classic Literature',
        publication: 'Scribner',
        type: 'book',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        serialNumber: 'BOOK002',
        category: 'Science Fiction',
        publication: 'Signet',
        type: 'book',
        totalCopies: 2,
        availableCopies: 2
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0061120084',
        serialNumber: 'BOOK003',
        category: 'Classic Literature',
        publication: 'HarperCollins',
        type: 'book',
        totalCopies: 2,
        availableCopies: 2
      },
      {
        title: 'Pride and Prejudice',
        author: 'Jane Austen',
        isbn: '978-0141439518',
        serialNumber: 'BOOK004',
        category: 'Romance',
        publication: 'Penguin Classics',
        type: 'book',
        totalCopies: 3,
        availableCopies: 3
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        isbn: '978-0241950761',
        serialNumber: 'BOOK005',
        category: 'Fiction',
        publication: 'Penguin',
        type: 'book',
        totalCopies: 1,
        availableCopies: 1
      },
      {
        title: 'Inception',
        author: 'Christopher Nolan',
        isbn: 'DVD001',
        serialNumber: 'MOVIE001',
        category: 'Science Fiction',
        publication: 'Warner Bros',
        type: 'movie',
        totalCopies: 2,
        availableCopies: 2
      },
      {
        title: 'The Shawshank Redemption',
        author: 'Frank Darabont',
        isbn: 'DVD002',
        serialNumber: 'MOVIE002',
        category: 'Drama',
        publication: 'Columbia Pictures',
        type: 'movie',
        totalCopies: 2,
        availableCopies: 2
      }
    ];
    
    await Book.insertMany(books);
    console.log('✓ Sample books created');
    
    // Create sample memberships
    console.log('Creating sample memberships...');
    const today = new Date();
    const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    const memberships = [
      {
        membershipNumber: 'MEM20260101',
        memberName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main Street, City, Country',
        membershipType: '6months',
        startDate: today,
        endDate: sixMonthsLater,
        status: 'active'
      },
      {
        membershipNumber: 'MEM20260102',
        memberName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        address: '456 Oak Avenue, City, Country',
        membershipType: '1year',
        startDate: today,
        endDate: oneYearLater,
        status: 'active'
      },
      {
        membershipNumber: 'MEM20260103',
        memberName: 'Robert Johnson',
        email: 'robert@example.com',
        phone: '+5555555555',
        address: '789 Pine Road, City, Country',
        membershipType: '6months',
        startDate: today,
        endDate: sixMonthsLater,
        status: 'active'
      }
    ];
    
    await Membership.insertMany(memberships);
    console.log('✓ Sample memberships created');
    
    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test Credentials:');
    console.log('─────────────────────────────────');
    console.log('Admin Account:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('─────────────────────────────────');
    console.log('User Account:');
    console.log('  Username: user1');
    console.log('  Password: user123');
    console.log('─────────────────────────────────');
    console.log('\nSample Memberships:');
    memberships.forEach(m => {
      console.log(`  - ${m.membershipNumber}: ${m.memberName}`);
    });
    console.log('─────────────────────────────────\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
