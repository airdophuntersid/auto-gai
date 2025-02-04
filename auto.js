const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

// Membaca konfigurasi dari config.json
const config = require("./config.json");
const API_URL = config.API_URL;
const API_KEY = config.API_KEY;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const CHAT_FILE = path.resolve(__dirname, "text.txt");

async function readChatFile() {
    try {
        const content = await fs.readFile(CHAT_FILE, "utf-8");
        const addresses = content.split("\n").filter(line => line.trim() !== "");
        if (addresses.length === 0) throw new Error("File text.txt kosong.");
        return addresses;
    } catch (error) {
        throw new Error(`Gagal membaca file: ${error.message}`);
    }
}

async function sendMessage(walletContent) {
    try {
        const response = await axios.post(
            API_URL,
            {
                "messages": [
                    { "role": "system", "content": "You are a helpful assistant." },
                    { "role": "user", "content": walletContent }
                ]
            },
            {
                headers: {
                    "accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                }
            }
        );
        return response.data.choices[0]?.message?.content || "Tidak ada respon dari API.";
    } catch (error) {
        const status = error.response?.status;
        const data = error.response?.data;
        console.error(`Gagal mengirim pesan. Status: ${status || "Tidak ada"}, Pesan: ${error.message}`);
        if (data) console.error("Detail error dari API: ", data);
        return null;
    }
}

(async () => {
    console.log("Auto By @AirdropsHuntersID \n\n");
    try {
        const addressListArray = await readChatFile();

        let iteration = 1;

        while (true) {
            console.log(`Mulai iterasi ke-${iteration}`);
            for (let wallet of addressListArray) {
                console.log(`Mengirim pesan untuk: ${wallet}\n`);

                const responseContent = await sendMessage(wallet);
                if (responseContent) {
                    console.log(`Respon: [${responseContent}]\n`);
                } else {
                    console.log("Tidak ada respon, mencoba lagi setelah jeda...\n");
                    await delay(2000);
                }

                console.log("Menunggu 5 detik sebelum lanjut ke alamat berikutnya...\n");
                await delay(5000);
            }

            console.log(`Iterasi ke-${iteration} selesai. Menunggu 30 menit sebelum iterasi berikutnya...\n`);
            iteration++;

            await delay(1800000); // Delay 30 menit
        }

    } catch (error) {
        console.error("Terjadi kesalahan: ", error.message);
    }
})();
