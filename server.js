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

// Služenje statičnih datoteka (HTML, CSS, JS) iz trenutnog foldera
app.use(express.static(path.join(__dirname, "public")));



app.get("/index.html", (req, res) => {
    res.redirect("/");
});


app.get("/date", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "meet.html"));
});

app.get("/meet.html", (req, res) => {
    res.redirect("/date");
});


// Pomoćna funkcija za čitanje baze
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
// SIGURNA PROVJERA I GENERIRANJE BATCHEVA
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

// Flat indeksi (0-80) podijeljeni u 3 vala iskakanja (24, 24, preostala 33)
const cellBatchesFlat = [
    [1, 4, 11, 15, 18, 23, 30, 34, 37, 41, 44, 47, 51, 54, 58, 61, 65, 68, 73, 75, 78, 8, 9, 21],
    [2, 6, 13, 17, 19, 25, 27, 32, 38, 42, 48, 52, 55, 59, 63, 66, 70, 74, 77, 5, 12, 22, 33, 45],
    [0, 3, 7, 10, 14, 16, 20, 24, 26, 28, 29, 31, 35, 36, 39, 40, 43, 46, 49, 50, 53, 56, 57, 60, 62, 64, 67, 69, 71, 72, 76, 79, 80]
];

const secureAnswers = [
    ["exit"],
    ["pizza movie"],
    ["ferrari", "scuderia ferrari"]
];

app.post('/api/verify-security', (req, res) => {
    const { step, answer } = req.body;

    if (step === undefined || step >= secureAnswers.length) {
        return res.status(400).json({ correct: false });
    }

    const cleanUserAnswer = answer ? answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
    const validOptions = secureAnswers[step];

    if (validOptions.includes(cleanUserAnswer)) {
        // Generiraj pripadajući paket brojeva iz matrice rješenja za taj korak
        const batchIndices = cellBatchesFlat[step];
        const newCells = batchIndices.map(idx => ({ flatIdx: idx, v: solutionGridFlat[idx] }));

        if (step === secureAnswers.length - 1) {
            console.log("HELENA UNLOCKED");
        }
        return res.json({ correct: true, newCells: newCells });
    } else {
        return res.json({ correct: false });
    }
});






// 1. Ruta za provjeru statusa 
app.get('/api/status', async (req, res) => {
    
    const db = await readDB();

    // console.log("STATUS HIT:", db);

    res.json({
        submitted: db.submitted || false,
        data: db.data || null
    });
});




// 2. Ruta za spremanje podataka 
app.post('/api/submit', async (req, res) => {
        console.log("SUBMIT HIT");
    const { day, time, location } = req.body;

    const db = await readDB();
        console.log("BEFORE:", db);

    db.submitted = true;
    db.data = {
        day,
        time,
        location,
        timestamp: new Date().toLocaleString('hr-HR')
    };

    await writeDB(db);
        console.log("AFTER:", db);

    res.json({ success: true });
});







// 3. Ruta ako klikne "Predomislila sam se"
app.post('/api/reset', async (req, res) => {
    const db = await readDB();

    db.submitted = false;
    db.data = null;

    await writeDB(db);

    res.json({ success: true });
});








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









app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});









