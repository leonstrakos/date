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
"",
    "11.7.", "12.7.", "13.7.", "14.7.", "15.7.",
    "16.7.", "17.7.", "18.7.", "19.7.", "20.7.",
    "21.7.", "22.7.", "23.7.", "24.7.", "25.7.",
    "26.7.", "27.7.", "28.7.", "29.7.", "30.7.",
    "31.7.",  "1.8.", "2.8.", "3.8.", "4.8.", "5.8.", "6.8.", "7.8.", "8.8.", 
       "9.8.",      
      "10.8.",
      "11.8.",
      // "12.8.",
      // "13.8.",
      // "14.8.",
      // "15.8.",
      // "16.8.",
      // "17.8.",
      // "18.8.",
      // "19.8.", 
      // "20.8.", 
      // "21.8.",
      // "22.8.",
      // "23.8.",
      // "24.8.",
      // "25.8.",
      // "26.8.",
      // "27.8.",
      // "28.8.",
      // "29.8.",
      // "30.8.",
      // "31.8.", 
       
      // "1.9.",
      // "2.9.",
      // "3.9.",
      // "4.9.",
      // "5.9.",
      // "6.9.",
      // "7.9.",
      // "8.9.",
      // "9.9.",
      // "10.9.",
      // "11.9.",
      // "12.9.",
      // "13.9.",
      // "14.9.",
      // "15.9.",
      // "16.9.",
      // "17.9.",
      // "18.9.",
      // "19.9.",
      // "20.9.",
      // "21.9.",
      // "22.9.",
      // "23.9.",
      // "24.9.",
      // "25.9.",
      // "26.9.",
      // "27.9.",
      // "28.9.",
      // "29.9.",
      // "30.9.",
       
      // "1.10.",
      // "2.10.",
      // "3.10.",
      // "4.10.",
      // "5.10.",
      // "6.10.",
      // "7.10.",
      // "8.10.",
      // "9.10.",
      // "10.10.",
      // "11.10.",
      // "12.10.",
      // "13.10.",
      // "14.10.",
      // "15.10.",
      // "16.10.",
      // "17.10.",
      // "18.10.",
      // "19.10.",
      // "20.10.",
      // "21.10.",
      // "22.10.",
      // "23.10.",
      // "24.10.",
      // "25.10.",
      // "26.10.",
      // "27.10.",
      // "28.10.",
      // "29.10.",
      // "30.10.",
      // "31.10.",
          
       ""
    ]
);

/* TIMES */
createWheel(
    document.getElementById('timeWheel'),
    [
      "","10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h",
        "18h", "19h", "20h", "21h", "22h", ""
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
