const express = require('express')
const crypto = require('crypto')

// TODO ::etc function
const algorithm = process.env.ALGORITHM;
const secretKey = crypto.createHash('sha256').update(process.env.SECRET_KEY).digest();

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

        const encryptedText = iv.toString('hex') + ':' + encrypted.toString('hex');

        console.log("🔒 Encrypted Data:", encryptedText);
        return encryptedText;
    } catch (error) {
        console.error("❌ Error saat enkripsi:", error.message);
        return null;
    }
}

function decrypt(text) {
    try {
        const parts = text.split(':');
        if (parts.length !== 2) throw new Error("Format terenkripsi tidak valid!");

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = Buffer.from(parts[1], 'hex');
        const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        const jsonData = JSON.parse(decrypted.toString());

        console.log("Decrypted Data:", decrypted.toString());
        return jsonData;
    } catch (error) {
        console.error("Error saat dekripsi:", error.message);
        return null;
    }
}
module.exports = {
    encrypt,
    decrypt
}