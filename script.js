const statNames = [
    "Power", "Strength", "Speed", "Defense",
    "Concentration", "Fortitude", "Intelligence",
    "Support", "Recovery"
];

const baseColors = [
    "#ff3d3d", "#ff7a00", "#ffbf00", "#6ecb00",
    "#00c9b7", "#00a3ff", "#8e3dff", "#ff00bf",
    "#ff0095"
];

let chart;

function generateSunburst() {
    const values = statNames.map(stat => {
        let v = parseFloat(document.getElementById(stat).value);
        return Math.min(Math.max(v, 1), 10);
    });

    const sunburstData = statNames.map((stat, i) => {
        let v = values[i];

        // 10 radial “steps” that darken outward
        let segments = [];
        for (let r = 1; r <= v; r++) {
            segments.push({
                label: `${stat} - ${r}`,
                value: 1,
                backgroundColor: shadeColor(baseColors[i], r * 6)
            });
        }

        return {
            label: stat,
            children: segments
        };
    });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById("sunburstChart"), {
        type: "sunburst",
        data: { children: sunburstData },
        options: {
            responsive: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    drawAdaptabilityRing();
}

// Darken color function
function shadeColor(hex, percent) {
    let f = parseInt(hex.slice(1),16),
        t = percent < 0 ? 0 : 255,
        p = Math.abs(percent) / 100,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;

    return "#" + (
        0x1000000 +
        (Math.round((t - R) * p) + R) * 0x10000 +
        (Math.round((t - G) * p) + G) * 0x100 +
        (Math.round((t - B) * p) + B)
    ).toString(16).slice(1);
}

function drawAdaptabilityRing() {
    const canvas = document.getElementById("outerRing");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 500, 500);

    let adaptability = parseFloat(document.getElementById("Adaptability").value);
    adaptability = Math.min(Math.max(adaptability, 1), 10);

    const center = 250;
    const radius = 230;
    const thickness = 25;

    // Background ring
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = "#ddd";
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Filled segment (clockwise)
    const endAngle = (adaptability / 10) * Math.PI * 2;

    ctx.beginPath();
    ctx.strokeStyle = "#222";
    ctx.arc(center, center, radius, -Math.PI / 2, endAngle - Math.PI / 2);
    ctx.stroke();
}

document.getElementById("generateBtn").addEventListener("click", generateSunburst);
