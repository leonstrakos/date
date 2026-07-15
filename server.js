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


// 1. Definicija točnog odgovora i Sudoku mreže za slanje
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

// Odgovor na pitanje "Sta piše na kapi?" (dodane varijacije za svaki slučaj)
const secureAnswers = ["ferrari", "scuderia ferrari"];

// 2. Potpuno blindirana ruta /date (provjera cookieja)
app.get("/date", (req, res) => {
    const cookies = req.headers.cookie || '';
    
    // Ako klijent ima valjan cookie, pusti ga na rođendanski dogovor
    if (cookies.includes('helena_unlocked=true')) {
        res.sendFile(path.join(__dirname, "public", "meet.html"));
    } else {
        // Ako nema cookie, baci ga natrag na početnu s pitalicom
        res.redirect("/");
    }
});

app.get("/meet.html", (req, res) => {
    res.redirect("/date");
});

// 3. Provjera odgovora i postavljanje kolačića (cookie)
app.post('/api/verify-security', (req, res) => {
    const { answer } = req.body;
    
    // Čišćenje unosa (malo-veliko slovo, razmaci, kvačice)
    const cleanUserAnswer = answer ? answer.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

    if (secureAnswers.includes(cleanUserAnswer)) {
        console.log("HELENA UNLOCKED 🔓"); // Ispis u PM2 logovima
        
        // Postavlja se HttpOnly cookie koji traje 24 sata (ne može se ukrasti preko konzole/JS-a)
        res.setHeader('Set-Cookie', 'helena_unlocked=true; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict');
        
        // Vraćamo ispravnu mrežu za animaciju na frontendu
        return res.json({ correct: true, grid: solutionGridFlat });
    } else {
        return res.json({ correct: false });
    }
});

// 4. Resetiranje stanja i brisanje kolačića ako klikne "Predomislila sam se"
app.post('/api/reset', async (req, res) => {
    const db = await readDB();
    db.submitted = false;
    db.data = null;
    await writeDB(db);

    // Uništavamo cookie tako da ga postavimo na prazno i stavimo datum u prošlost
    res.setHeader('Set-Cookie', 'helena_unlocked=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly');
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


})


app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});








