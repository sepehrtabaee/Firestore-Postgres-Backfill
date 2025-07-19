// firestore_to_postgres.js

require('dotenv').config();
const admin = require('firebase-admin');
const { Pool } = require('pg');

// --- CONFIGURATION ---

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);

// Your Firestore project ID
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

// PostgreSQL connection config
const pgConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
    ssl: { rejectUnauthorized: false }
};

// --- INITIALIZE CONNECTIONS ---

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseProjectId,
});

const firestore = admin.firestore();
console.log('Connected to Firebase')
const pgPool = new Pool(pgConfig);
console.log('Connected to Postgres')

// --- CUSTOM MAPPERS ---

/**
 * Map Firestore document data to Postgres table row for each collection.
 * Add a new entry for each collection you want to backfill.
 */
const COLLECTION_MAPPERS = {
    Users: (doc) => {
        const data = doc.data();
        return {
            uid: doc.id,
            first_name: data.firstName,
            last_name: data.lastName,
            middle_name: data.middleName,
            profile_image: null,
            gender: null,
            linkedin: null,
            work_email: data.email,
            personal_email: data.email,
            phone_number: data.phone,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state,
            zipcode: data.zipcode,
            country: data.country,
            is_active: true,
            stripe_customer_id: null,
            title: data.title
        };
    },
    // Add more collections and their mappers here
    // posts: (doc) => { ... }
};

/**
 * Map collection name to Postgres table and columns.
 * Add a new entry for each collection you want to backfill.
 */
const COLLECTION_TABLES = {
    Users: {
        table: 'Users',
        columns: [
            'uid',
            'first_name',
            'last_name',
            'middle_name',
            'profile_image',
            'gender',
            'linkedin',
            'work_email',
            'personal_email',
            'phone_number',
            'address1',
            'address2',
            'city',
            'state',
            'zipcode',
            'country',
            'is_active',
            'stripe_customer_id',
            'create_date',
            'update_date',
            'last_login_date',
            'title'
        ],
        conflictColumn: 'uid', // Assuming 'uid' is the primary key
    },
    // posts: { table: 'posts', columns: [...], conflictColumn: 'id' }
};

// --- BACKFILL LOGIC ---

async function backfillCollection(collectionName) {
    const mapper = COLLECTION_MAPPERS[collectionName];
    const tableInfo = COLLECTION_TABLES[collectionName];

    if (!mapper || !tableInfo) {
        console.error(`No mapper or table info for collection: ${collectionName}`);
        return;
    }

    const snapshot = await firestore.collection(collectionName).get();
    if (snapshot.empty) {
        console.log(`No documents found in Firestore collection: ${collectionName}`);
        return;
    }

    for (const doc of snapshot.docs) {
        const row = mapper(doc);
        const values = tableInfo.columns.map(col => row[col]);

        // Build parameterized query
        const placeholders = tableInfo.columns.map((_, i) => `$${i + 1}`).join(', ');
        const query = `
      INSERT INTO ${tableInfo.table} (${tableInfo.columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (${tableInfo.conflictColumn}) DO NOTHING
    `;

        try {
            await pgPool.query(query, values);
            console.log(`Inserted/Skipped ${collectionName} doc ${doc.id}`);
        } catch (err) {
            console.error(`Error inserting ${collectionName} doc ${doc.id}:`, err);
        }
    }
}

async function main() {
    try {
        // List the collections you want to backfill here
        const collectionsToBackfill = ['Users']; // Add more as needed

        for (const collection of collectionsToBackfill) {
            await backfillCollection(collection);
        }

        console.log('Backfill complete!');
    } catch (err) {
        console.error('Error during backfill:', err);
    } finally {
        await pgPool.end();
        process.exit();
    }
}

main(); 