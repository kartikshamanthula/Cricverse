const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function run() {
    let uri = '';
    const envFiles = ['.env.local', '.env'];
    for (const file of envFiles) {
        try {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const match = content.match(/MONGODB_URI=(.*)/);
                if (match) {
                    uri = match[1].trim().replace(/^['"]|['"]$/g, '');
                    console.log(`Found URI in ${file}`);
                    break;
                }
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e.message);
        }
    }

    if (!uri) {
        console.error('MONGODB_URI not found in .env or .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB.');

        const collections = ['teams', 'tournaments'];
        for (const collName of collections) {
            console.log(`\nChecking collection: ${collName}`);
            const collection = mongoose.connection.db.collection(collName);
            const indexes = await collection.listIndexes().toArray();
            console.log(`Current indexes:`, indexes.map(i => i.name));

            // Look for unique index on 'name' only
            const nameIndex = indexes.find(i => i.key.name === 1 && Object.keys(i.key).length === 1 && i.unique);
            if (nameIndex) {
                console.log(`Dropping unique index "${nameIndex.name}"...`);
                await collection.dropIndex(nameIndex.name);
                console.log('Done.');
            } else {
                console.log('No single-field unique index on "name" found.');
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

run();
