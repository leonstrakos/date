console.log("SCRIPT LOADED");

let currentStep = 0;
const steps = document.querySelectorAll('.step');

const progressBar = document.getElementById("progressBar");


/* -----------------------------
   STEP SYSTEM (CLEAN)
------------------------------*/

function showStep(index) {
    steps.forEach((s, i) => {
        s.classList.toggle('active', i === index);
    });
}

/* -----------------------------
   PROGRESS BAR
------------------------------*/

function updateProgress() {
    const start = 0; // starting percentage
    const percentage = start + (currentStep / (3 - 1)) * (100 - start);

    progressBar.style.width = `${percentage}%`;
}


/* -----------------------------
   NEXT BUTTONS
------------------------------*/

document.querySelectorAll('.next').forEach(btn => {
    btn.addEventListener('click', () => {

        console.log("BEFORE:", currentStep);

        if (currentStep < 2) {
            currentStep++;
            console.log("AFTER:", currentStep);
            showStep(currentStep);
            updateProgress();
        } else {
            console.log("SUBMIT");
            submit();
        }

    });
});





/* OPTION SELECT */
document.querySelectorAll('.option').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
    });
});

/* WHEEL BUILDER */
function createWheel(el, items) {
    el.innerHTML = "";

    items.forEach(val => {
        const div = document.createElement('div');
        div.className = 'item';
        div.textContent = val;
        el.appendChild(div);
    });

    const itemsEl = el.querySelectorAll('.item');

    const update = () => {
        let closest = null;
        let minDist = Infinity;

        itemsEl.forEach(item => {
            const rect = item.getBoundingClientRect();
            const dist = Math.abs(rect.top - window.innerHeight / 2);

            item.classList.remove('active');

            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        });

        if (closest) closest.classList.add('active');
    };

    el.addEventListener('scroll', () => requestAnimationFrame(update));
    update();
}

/* DAYS */
createWheel(
    document.getElementById('dayWheel'),
    [
      "", "", "1.", "2.", "3.", "4.", "5.", "6.", "7.",
        "8.", "9.", "10.", "11.", "12.", "13.", "14.", 
        "15.", "16.", "17.", "18.", "19.", "20.", "21.", "22.", "23.", "24.", "25.",
        "26.", "27.", "28.", "29.", "30.", "", ""
    ]
);

/* TIMES */
createWheel(
    document.getElementById('timeWheel'),
    [
      "", "", "12h", "13h", "14h", "15h", "16h", "17h",
        "18h", "19h", "20h", "21h", "22h", "", ""
    ]
);



async function submit() {
    const activeDayEl = document.querySelector('#dayWheel .item.active');
    const selectedDay = activeDayEl ? activeDayEl.textContent.trim() : "N/A";

    const activeTimeEl = document.querySelector('#timeWheel .item.active');
    const selectedTime = activeTimeEl ? activeTimeEl.textContent.trim() : "N/A";

    const locationValue = document.getElementById('location').value || "N/A";

    const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            day: selectedDay,
            time: selectedTime,
            location: locationValue
        })
    });

    const data = await response.json();

    if (data.success) {
        spawnBlossoms(100); // 🌸✨
        currentStep = steps.length - 1;
        showStep(currentStep);
    }
}












document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".predomislila").addEventListener("click", async () => {
        console.log("Predomislila se");

        const res = await fetch('/api/reset', { method: 'POST' });
        const data = await res.json();
        
        setTimeout(function() {
            window.location.href = "index.html";
        }, 300); // 3000 ms = 3 sekunde

    });
});





const slider = document.getElementById('stepsSlider');

// Funkcija za glatko klizanje i punjenje progress bara
function updateGallery() {
    // Pomičemo slider ulijevo za 100% širine po svakom koraku
    slider.style.transform = `translateX(-${1 * 200}%)`;
    
    // Izračun punjenja trake (3 unosa -> 0%, 33%, 66%, 100%)
    const percentage = (2 / (steps.length - 1)) * 100;
    progressBar.style.width = `${percentage}%`;

    // Sakrij progress bar na zadnjem (success) koraku radi čišćeg dizajna

}





function spawnBlossoms(count = 25) {
    const container = document.getElementById("celebration");

    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.className = "blossom";
        el.textContent = "🌸";

        el.style.left = Math.random() * 100 + "vw";
        el.style.top = "100vh";
        el.style.fontSize = (16 + Math.random() * 20) + "px";
        el.style.animationDuration = (1.8 + Math.random() * 1.5) + "s";

        container.appendChild(el);

        setTimeout(() => el.remove(), 3000);
    }
}