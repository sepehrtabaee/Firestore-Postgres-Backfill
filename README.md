# Firestore to Postgres Backfill Tool

A Node.js script to backfill data from Google Firestore collections into PostgreSQL tables. This tool is designed for one-time or repeated migrations, making it easy to transfer and map Firestore data into your relational database.

## Features
- Connects to Firestore using a service account
- Connects to PostgreSQL using environment variables
- Customizable mapping for each Firestore collection to Postgres table
- Handles conflicts using `ON CONFLICT DO NOTHING`
- Easily extensible for additional collections

## Prerequisites
- Node.js (v14 or higher recommended)
- Access to a Firestore project and service account key
- Access to a PostgreSQL database

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Firebase-Postgres.git
   cd Firebase-Postgres
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```

## Configuration

1. **Create a `.env` file in the project root:**
   ```env
   FIREBASE_SERVICE_ACCOUNT=./path/to/serviceAccountKey.json
   FIREBASE_PROJECT_ID=your-firebase-project-id
   PG_USER=your_pg_user
   PG_HOST=your_pg_host
   PG_DATABASE=your_pg_database
   PG_PASSWORD=your_pg_password
   PG_PORT=5432
   ```
   - `FIREBASE_SERVICE_ACCOUNT`: Path to your Firebase service account JSON file
   - `FIREBASE_PROJECT_ID`: Your Firestore project ID
   - `PG_USER`, `PG_HOST`, `PG_DATABASE`, `PG_PASSWORD`, `PG_PORT`: PostgreSQL connection details

2. **Prepare your Postgres tables:**
   - Ensure your tables (e.g., `Users`) exist and have columns matching those defined in the script's `COLLECTION_TABLES` mapping.

## Usage

Run the script with Node.js:

```bash
node firestore_to_postgres.js
```

- By default, the script will backfill the `Users` collection. To add more collections, update the `collectionsToBackfill` array and provide appropriate mappers and table definitions in the script.

## Customization
- **Add more collections:**
  - Edit the `COLLECTION_MAPPERS` and `COLLECTION_TABLES` objects in `firestore_to_postgres.js` to define how each Firestore collection maps to your Postgres tables.

## Environment Variables
All configuration is handled via environment variables in your `.env` file. See the example above.

## License

MIT License © 2025 Sepehr Tabaee 