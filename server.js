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

    const FILE = path.join(__dirname, "views.json");

    if (!await fs.pathExists(FILE)) {
        return res.json([]);
    }

    res.json(await fs.readJson(FILE));


});









app.listen(PORT, () => {
    console.log(`Server radi na http://localhost:${PORT}`);
});









