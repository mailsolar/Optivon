
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'optivon.db');
const db = new sqlite3.Database(dbPath);

const email = 'deepaknairm10@gmail.com';
const plainPassword = 'Singleaf@12k';

async function seedUser() {
    try {
        const hash = await bcrypt.hash(plainPassword, 10);

        db.run('INSERT INTO users (email, password_hash, ip_address) VALUES (?, ?, ?)',
            [email, hash, '127.0.0.1'],
            function (err) {
                if (err) {
                    console.error('Error inserting user:', err.message);
                } else {
                    console.log('User inserted successfully with ID:', this.lastID);
                }
                db.close();
            });
    } catch (e) {
        console.error('Error hashing password:', e);
        db.close();
    }
}

seedUser();
