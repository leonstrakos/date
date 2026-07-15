const express = require('express');
const path = require('path');   
const fs = require('fs-extra');
const app = express();
const PORT = 3005;
const DB_FILE = path.join(__dirname, 'db.json');

app.set("trust proxy", true);

// Middleware za čitanje podataka iz formi / JSON-a
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Služenje statičnih datoteka (HTML, CSS, JS) iz "public" foldera
app.use(express.static(path.join(__dirname, "public")));

// Preusmjeravanje sa index.html na čisti domenski put /
app.get("/index.html", (req, res) => {
    res.redirect("/");
});

// ==========================================
// PODACI I SIGURNOSNE POSTAVKE
// ==========================================

const solutionGridFlat = [
    5, 2, 4, 1, 6, 3, 9, 8, 7,
    9, 1, 6, 7, 8, 5, 2, 3, 4,
    8, 7, 3, 4, 9, 2, 5, 1, 6,
    1, 9, 5, 3, 4, 8, 7, 6, 2,
    3, 6, 7, 9, 2, 1, 4, 5, 8,
    4, 8, 2, 6, 5, 7, 1, 9, 3,
    6, 4, 8, 2, 1, 9, 3, 7, 5,
    7, 5, 1, 8, 3, 4, 6, 2, 9,
    2, 3, 9, 5, 7, 6, 8, 4, 1
];

// Točni odgovori za pitanje u placeholderu: "Sta piše na kapi?"
const secureAnswers = ["ferrari", "scuderia ferrari", "micka"];

// Pomoćna funkcija za čitanje baze podataka
async function readDB() {
    if (!await fs.pathExists(DB_FILE)) {
        await fs.writeJson(DB_FILE, { submitted: false }, { spaces: 4 });
    }
    return fs.readJson(DB_FILE);
}

async function writeDB(data) {
    await fs.writeJson(DB_FILE, data, { spaces: 4 });
}

// ==========================================
// SIGURNE RUTE (ZAKLJUČAVANJE)
// ==========================================

// OSIGURANA RUTA: Smije proći samo ako ima važeći kolačić (cookie)
app.get("/date", (req, res) => {
    const cookies = req.headers.cookie || '';
    
    if (cookies.includes('helena_unlocked=true')) {
        res.sendFile(path.join(__dirname, "public", "meet.html"));
    } else {
        // Ako nema kolačić, vraćamo je na lock screen
        res.redirect("/");
    }
});

app.get("/meet.html", (req, res) => {
    res.redirect("/date");
});

// Provjera odgovora na pitanje i postavljanje HttpOnly kolačića
app.post('/api/verify-security', (req, res) => {
    const { answer } = req.body;
    
    // Normalizacija i čišćenje unosa
    const cleanUserAnswer = answer ? answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

    if (secureAnswers.includes(cleanUserAnswer)) {
        console.log("NETKO USAO 🙏🙏🙏🙏🙏🙏"); 
        
        // Postavlja se kolačić koji traje 24 sata (siguran, nedostupan JS-u na klijentu)
        res.setHeader('Set-Cookie', 'helena_unlocked=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict');
        
        return res.json({ correct: true, grid: solutionGridFlat });
    } else {
        return res.json({ correct: false });
    }
});

// ==========================================
// API RUTE ZA PODATKE (Baza, Status, Views)
// ==========================================

// Provjera statusa dogovora
app.get('/api/status', async (req, res) => {
    const db = await readDB();
    res.json({
        submitted: db.submitted || false,
        data: db.data || null
    });
});

// Slanje datuma i lokacije
app.post('/api/submit', async (req, res) => {
    console.log("SUBMIT HIT");
    const { day, time, location } = req.body;
    const db = await readDB();

    db.submitted = true;
    db.data = {
        day,
        time,
        location,
        timestamp: new Date().toLocaleString('hr-HR')
    };

    await writeDB(db);
    res.json({ success: true });
});

// Brisanje kolačića i zaključavanje ako se klikne "Predomislila sam se"
app.post('/api/reset', async (req, res) => {
    const db = await readDB();
    db.submitted = false;
    db.data = null;
    await writeDB(db);

    // Uništavamo kolačić postavljanjem datuma u prošlost
    res.setHeader('Set-Cookie', 'helena_unlocked=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
    res.json({ success: true });
});

// Bilježenje posjeta stranici
app.post("/api/view", async (req, res) => {
    const FILE = path.join(__dirname, "views.json");
    let views = [];

    if (await fs.pathExists(FILE)) {
        views = await fs.readJson(FILE);
    }

    views.push({
        timestamp: new Date().toLocaleString("hr-HR")
    });

    await fs.writeJson(FILE, views, { spaces: 4 });
    res.json({ success: true });
});

// Pregled povijesti posjeta
app.get("/views", async (req, res) => {
    console.log("IP:", req.ip);
    console.log("Forwarded:", req.headers["x-forwarded-for"]);
    console.log("UA:", req.headers["user-agent"]);
    console.log("Timestamp:", new Date().toLocaleString("hr-HR"));

    const FILE = path.join(__dirname, "views.json");
    if (!await fs.pathExists(FILE)) {
        return res.json([]);
    }
    res.json(await fs.readJson(FILE));
});

// Pokretanje servera
app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});
