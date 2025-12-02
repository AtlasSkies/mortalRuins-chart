function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

let uploadedImage = null;

window.addEventListener("DOMContentLoaded", () => {

  const previewCanvas = document.getElementById("fullChartCanvas");
  const previewCtx = previewCanvas.getContext("2d");

  const modalCanvas = document.getElementById("modalChartCanvas");
  const modalCtx = modalCanvas.getContext("2d");

  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");

  const charName = document.getElementById("charName");
  const charSpecies = document.getElementById("charSpecies");
  const charAbility = document.getElementById("charAbility");
  const charLevel = document.getElementById("charLevel");
  const charDanger = document.getElementById("charDanger");
  const charGod = document.getElementById("charGod");

  const overall = document.getElementById("overallRating");

  const statInputs = {
    energy: document.getElementById("statEnergy"),
    speed: document.getElementById("statSpeed"),
    support: document.getElementById("statSupport"),
    power: document.getElementById("statPower"),
    intelligence: document.getElementById("statIntelligence"),
    concentration: document.getElementById("statConcentration"),
    perception: document.getElementById("statPerception")
  };

  const viewBtn = document.getElementById("viewChartBtn");
  const modal = document.getElementById("chartModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const modalImage = document.getElementById("modalImage");
  const modalInfo = document.getElementById("modalInfo");
  const fileTypeGod = document.getElementById("fileTypeGod");
  const modalDownloadBtn = document.getElementById("modalDownloadBtn");


  /* -------- IMAGE UPLOAD -------- */

  imageUpload.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        uploadedImage = img;
        imagePreview.src = img.src;
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });


  /* -------- STATS -------- */

  function getStats() {
    return [
      clamp(parseFloat(statInputs.energy.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.speed.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.support.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.power.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.intelligence.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.concentration.value) || 1, 1, 10),
      clamp(parseFloat(statInputs.perception.value) || 1, 1, 10)
    ];
  }

  function getOverall() {
    return clamp(parseFloat(overall.value) || 1, 1, 10);
  }

  function computeLevel(stats, overallVal) {
    const sum = stats.reduce((a,b)=>a+b,0);
    return sum + overallVal * 3;
  }


  /* -------- CHART DRAWING -------- */

  function drawChart(ctx, canvas, stats, overallVal) {
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2;

    ctx.clearRect(0,0,w,h);

    const labels = ["Energy","Speed","Support","Power","Intelligence","Concentration","Perception"];
    const hues   = [0, 30, 55, 130, 210, 255, 280];

    const secCount = 7;
    const rings = 10;

    const inner = 60;
    const outer = 210;
    const ringT = (outer-inner)/rings;

    const secA = (2*Math.PI)/secCount;

    /* ---- SUNBURST ---- */
    for (let i=0;i<secCount;i++) {
      const angle0 = -Math.PI/2 + i*secA;
      const angle1 = angle0 + secA;
      const hue = hues[i];
      const val = stats[i];

      for (let r=0;r<val;r++) {
        const rIn = inner + r*ringT;
        const rOut= rIn + ringT;

        const sat = 40 + r*5;
        const lit = 70 - r*4;

        ctx.beginPath();
        ctx.arc(cx,cy,rOut,angle0,angle1);
        ctx.arc(cx,cy,rIn,angle1,angle0,true);
        ctx.closePath();
        ctx.fillStyle = `hsl(${hue},${sat}%,${lit}%)`;
        ctx.fill();
      }

      const mid = (angle0+angle1)/2;
      const lx = cx + Math.cos(mid)*140;
      const ly = cy + Math.sin(mid)*140;
      ctx.fillStyle="#fff";
      ctx.font="14px sans-serif";
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillText(labels[i],lx,ly);
    }

    /* ---- INNER CIRCLE ---- */
    ctx.beginPath();
    ctx.arc(cx,cy,inner*0.45,0,Math.PI*2);
    ctx.fillStyle="#0b1020";
    ctx.fill();

    /* ---- OUTER RING ---- */
    const ringIn = outer+20;
    const ringOut= outer+60;
    const wedgeA= (2*Math.PI)/10;

    ctx.beginPath();
    ctx.arc(cx,cy,ringOut,0,Math.PI*2);
    ctx.arc(cx,cy,ringIn,Math.PI*2,0,true);
    ctx.closePath();
    ctx.fillStyle="#1a2038";
    ctx.fill();

    const full = Math.floor(overallVal);
    const frac = overallVal - full;

    function wedgeColor(i){
      return `hsl(220,20%,${70 - i*4}%)`;
    }

    for (let i=0;i<full;i++){
      const a0 = -Math.PI/2 + i*wedgeA;
      const a1 = a0 + wedgeA;
      ctx.beginPath();
      ctx.arc(cx,cy,ringOut,a0,a1);
      ctx.arc(cx,cy,ringIn,a1,a0,true);
      ctx.closePath();
      ctx.fillStyle=wedgeColor(i);
      ctx.fill();
    }

    if (frac>0 && full<10){
      const i=full;
      const a0 = -Math.PI/2 + i*wedgeA;
      const a1 = a0 + wedgeA*frac;
      ctx.beginPath();
      ctx.arc(cx,cy,ringOut,a0,a1);
      ctx.arc(cx,cy,ringIn,a1,a0,true);
      ctx.closePath();
      ctx.fillStyle=wedgeColor(i);
      ctx.fill();
    }
  }


  /* -------- AUTO UPDATE PREVIEW -------- */

  function updatePreview(){
    const stats = getStats();
    const ov = getOverall();
    const lvl = computeLevel(stats, ov);
    charLevel.value = lvl.toFixed(1);
    drawChart(previewCtx,previewCanvas,stats,ov);
  }

  Object.values(statInputs).forEach(inp=>inp.addEventListener("input",updatePreview));
  overall.addEventListener("input",updatePreview);

  updatePreview();


  /* -------- OPEN POPUP -------- */

  viewBtn.addEventListener("click",() => {

    const stats = getStats();
    const ov = getOverall();
    const lvl = computeLevel(stats,ov);

    charLevel.value = lvl.toFixed(1);

    // File type update
    fileTypeGod.textContent = charGod.value;

    // Image
    modalImage.src = uploadedImage ? uploadedImage.src : "";

    // Info formatting
    modalInfo.innerHTML = `
      <div><span class="label">Name:</span> ${charName.value||"Unknown"}</div>
      <div><span class="label">Species:</span> ${charSpecies.value||"Unknown"}</div>
      <div><span class="label">Ability:</span> ${charAbility.value||"Unknown"}</div>
      <div><span class="label">Patron God:</span> ${charGod.value}</div>
      <div><span class="label">Danger Level:</span> ${charDanger.value}</div>
      <div><span class="label">Level Index:</span> ${lvl.toFixed(1)}</div>
      <div><span class="label">[Redacted]:</span> ${ov.toFixed(1)}</div>
    `;

    drawChart(modalCtx,modalCanvas,stats,ov);

    modal.classList.remove("hidden");
  });


  /* -------- CLOSE POPUP -------- */

  closeBtn.addEventListener("click",()=>{
    modal.classList.add("hidden");
  });


  /* -------- DOWNLOAD POPUP -------- */

  modalDownloadBtn.addEventListener("click",()=>{

    const rect = document.getElementById("modalWrapper").getBoundingClientRect();

    const tmp = document.createElement("canvas");
    tmp.width = rect.width * 2;
    tmp.height = rect.height * 2;
    const tctx = tmp.getContext("2d");
    tctx.scale(2,2);

    tctx.fillStyle="#111524";
    tctx.fillRect(0,0,rect.width,rect.height);

    // Draw image
    if (uploadedImage){
      tctx.drawImage(modalImage, 10, 10, 300, 300);
    }

    // Info text
    tctx.fillStyle="#fff";
    tctx.font="18px serif";
    let y = 330;
    modalInfo.innerText.split("\n").forEach(line=>{
      tctx.fillText(line,10,y);
      y+=26;
    });

    // Chart
    tctx.drawImage(modalCanvas, 350, 10, 520, 520);

    const name = (charName.value||"character").replace(/\s+/g,"");
    const link=document.createElement("a");
    link.download = `${name}_mr_characterchart.png`;
    link.href = tmp.toDataURL();
    link.click();
  });

});
