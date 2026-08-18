import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Shelter from "./models/Shelter.js";
import Request from "./models/Request.js";
import Donation from "./models/Donation.js";

dotenv.config();

const sheltersData = [
  // Bengaluru
  {
    name: "Hope Foundation Shelter - Bengaluru",
    address: "12, Richmond Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025",
    availableBeds: 25,
    foodAvailable: true,
    suppliesAvailable: true,
    urgencyLevel: 2,
    location: { lat: 12.971598, lng: 77.594562 }
  },
  {
    name: "Karunalaya NGO Community Home",
    address: "88, Koramangala 4th Block, 100 Feet Road, Bengaluru, Karnataka 560034",
    availableBeds: 8,
    foodAvailable: true,
    suppliesAvailable: false,
    urgencyLevel: 4,
    location: { lat: 12.927923, lng: 77.627108 }
  },
  // Delhi
  {
    name: "Delhi Brotherhood Society Night Shelter",
    address: "7, DBG Road, Aram Bagh, Paharganj, New Delhi, Delhi 110055",
    availableBeds: 45,
    foodAvailable: true,
    suppliesAvailable: true,
    urgencyLevel: 1,
    location: { lat: 28.613939, lng: 77.209021 }
  },
  {
    name: "Aashray Adhikar Abhiyan AAA Shelter",
    address: "Near Old Delhi Railway Station, Chandni Chowk, Delhi 110006",
    availableBeds: 4,
    foodAvailable: false,
    suppliesAvailable: false,
    urgencyLevel: 5,
    location: { lat: 28.656827, lng: 77.240741 }
  },
  // Mumbai
  {
    name: "Salaam Baalak Trust Shelter",
    address: "1st Floor, Asha Sadan Marg, Umerkhadi, Mumbai, Maharashtra 400009",
    availableBeds: 18,
    foodAvailable: true,
    suppliesAvailable: true,
    urgencyLevel: 3,
    location: { lat: 18.9696, lng: 72.8193 }
  },
  {
    name: "Shelter Don Bosco - Wadala",
    address: "Opp. Wadala Fire Brigade, Katrak Road, Wadala West, Mumbai, Maharashtra 400031",
    availableBeds: 12,
    foodAvailable: true,
    suppliesAvailable: false,
    urgencyLevel: 3,
    location: { lat: 19.0222, lng: 72.8561 }
  },
  // Kolkata
  {
    name: "Calcutta Rescue Aid Shelter",
    address: "85/1, Mahatma Gandhi Road, College Square, Kolkata, West Bengal 700009",
    availableBeds: 30,
    foodAvailable: true,
    suppliesAvailable: true,
    urgencyLevel: 2,
    location: { lat: 22.5726, lng: 88.3639 }
  },
  {
    name: "Prem Dan (Missionaries of Charity)",
    address: "15, Lansdowne Road, Elgin, Kolkata, West Bengal 700020",
    availableBeds: 50,
    foodAvailable: true,
    suppliesAvailable: true,
    urgencyLevel: 1,
    location: { lat: 22.5448, lng: 88.3425 }
  },
  // Chennai
  {
    name: "Udhavum Karangal Shelter - Chennai",
    address: "No. 460, NSK Nagar, Arumbakkam, Chennai, Tamil Nadu 600106",
    availableBeds: 3,
    foodAvailable: false,
    suppliesAvailable: true,
    urgencyLevel: 5,
    location: { lat: 13.0827, lng: 80.2707 }
  },
  // Hyderabad
  {
    name: "Aman Vedika Rainbow Home",
    address: "Government School Campus, Koti, Hyderabad, Telangana 500095",
    availableBeds: 15,
    foodAvailable: true,
    suppliesAvailable: false,
    urgencyLevel: 3,
    location: { lat: 17.3850, lng: 78.4867 }
  }
];

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");

    // Clean existing transactions & requests to prevent orphans
    console.log("Cleaning old data...");
    await Request.deleteMany({});
    await Donation.deleteMany({});
    await Shelter.deleteMany({});

    // 1. Establish default admin
    const defaultEmail = "operator@shelterlink.org";
    let admin = await User.findOne({ email: defaultEmail });

    if (!admin) {
      console.log("Creating default operator admin account...");
      admin = await User.create({
        name: "National Coordinator",
        email: defaultEmail,
        password: "coordinator123" // Will be hashed automatically by userSchema pre-save
      });
      console.log("Admin operator account created.");
    } else {
      console.log("Using existing operator admin account.");
    }

    // 2. Insert shelters
    console.log("Seeding Indian shelters and NGO community homes...");
    const sheltersWithAdmin = sheltersData.map(shelter => ({
      ...shelter,
      admin: admin._id
    }));

    const insertedShelters = await Shelter.insertMany(sheltersWithAdmin);
    console.log(`Successfully seeded ${insertedShelters.length} shelters across India.`);

    // 3. Seed some mock resource requests for demonstration
    console.log("Seeding demonstration resource requests...");
    const mockRequests = [
      {
        shelter: insertedShelters[1]._id, // Karunalaya NGO (urgency 4)
        resourceType: "food",
        quantity: 150,
        notes: "Urgently need dry food rations and milk packets for daily community kitchen.",
        status: "pending"
      },
      {
        shelter: insertedShelters[3]._id, // AAA Shelter Delhi (urgency 5)
        resourceType: "beds",
        quantity: 20,
        notes: "Extreme winter wind. Desperately need 20 canvas folding beds or thermal sleeping bags.",
        status: "pending"
      },
      {
        shelter: insertedShelters[5]._id, // Shelter Don Bosco Mumbai
        resourceType: "supplies",
        quantity: 40,
        notes: "Need 40 sets of hygiene kits (soap, toothpaste, sanitizers) for youth residents.",
        status: "pending"
      },
      {
        shelter: insertedShelters[8]._id, // Chennai Udhavum Karangal (urgency 5)
        resourceType: "food",
        quantity: 300,
        notes: "Flooding in neighborhood. Need immediate dry lunch boxes and bottled drinking water.",
        status: "pending"
      }
    ];

    await Request.insertMany(mockRequests);
    console.log("Successfully seeded mock resource requests.");

    console.log("Seeding complete. Ready to run!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
