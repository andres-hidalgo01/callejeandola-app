import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let spots = [
    { id: "s1", name: "Banco del Centro", zone: "Centro", type: "street", obstacles: ["ledge", "manual"], time: "10–20 min", rating: 4.3, verified: true },
    { id: "s2", name: "Skatepark Norte", zone: "Norte", type: "park", obstacles: ["rail", "quarter"], time: "20–35 min", rating: 4.8, verified: true },
    { id: "s3", name: "Bowl Viejo", zone: "Occidente", type: "bowl", obstacles: ["bowl"], time: "25–40 min", rating: 3.9, verified: false }
];

let clips = [
    { id: "c1", title: "Switch flip en el banco", skater: "Dani", tag: "trick", spot: "Banco del Centro", likes: 128 },
    { id: "c2", title: "Line rápida (3 trucos)", skater: "Vale", tag: "line", spot: "Skatepark Norte", likes: 312 },
    { id: "c3", title: "Bowl bail (por poco)", skater: "Santi", tag: "bail", spot: "Bowl Viejo", likes: 96 }
];

let events = [
    { id: "e1", month: "MAR", day: "22", title: "Street Jam — Centro", time: "2:00 PM", place: "Punto por confirmar", format: "Best trick + líneas" },
    { id: "e2", month: "APR", day: "06", title: "Park Contest — Clasificatorio", time: "10:00 AM", place: "Skatepark", format: "Rondas + cupos" }
];

// Logos reales por URL (para probar que tu front ya jala imágenes desde API)
let sponsors = [
    { id: "sp1", name: "VANS", logo: "https://dummyimage.com/120x120/111827/ffffff.png&text=VANS", url: "https://www.vans.com" },
    { id: "sp2", name: "NIKE SB", logo: "https://dummyimage.com/120x120/111827/ffffff.png&text=NIKE+SB", url: "https://www.nike.com" },
    { id: "sp3", name: "RED BULL", logo: "https://dummyimage.com/120x120/111827/ffffff.png&text=RED+BULL", url: "https://www.redbull.com" },
    { id: "sp4", name: "LOCAL SHOP", logo: "https://dummyimage.com/120x120/111827/ffffff.png&text=SHOP", url: "#" }
];

/* -------- GET -------- */
app.get("/api/spots", (req, res) => res.json(spots));
app.get("/api/clips", (req, res) => res.json(clips));
app.get("/api/events", (req, res) => res.json(events));
app.get("/api/sponsors", (req, res) => res.json(sponsors));

/* -------- POST -------- */
app.post("/api/spots", (req, res) => {
    const id = "s" + Date.now();
    const spot = { id, ...req.body };
    spots = [spot, ...spots];
    res.json(spot);
});

app.post("/api/events", (req, res) => {
    const id = "e" + Date.now();
    const ev = { id, ...req.body };
    events = [ev, ...events];
    res.json(ev);
});

app.post("/api/spots/:id/report", (req, res) => {
    res.json({ ok: true, spotId: req.params.id, ...req.body });
});

app.post("/api/clips/:id/like", (req, res) => {
    const clip = clips.find(c => c.id === req.params.id);
    if (clip) clip.likes = Number(clip.likes || 0) + 1;
    res.json({ ok: true, id: req.params.id, likes: clip?.likes ?? 0 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Mock API: http://localhost:${PORT}/api`));
