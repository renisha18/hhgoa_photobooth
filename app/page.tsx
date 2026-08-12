"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

const TITLES = ["Zero-to-One Builder", "Pixel & Protocol Pirate", "Ship-It Sorcerer", "Full-Stack Firestarter", "Product Tide Turner", "Bug-Squashing Buccaneer"];
const PALETTES = [
  { name: "Goa", a: "#ffd91a", b: "#ffdc36", ink: "#063c29" },
  { name: "Forest", a: "#075d3c", b: "#0a7b4d", ink: "#ffe21f" },
  { name: "Carnival", a: "#ff2b88", b: "#ffcc18", ink: "#073e2b" },
];

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function loadImage(url: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState(TITLES[0]);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [photoX, setPhotoX] = useState(50);
  const [photoY, setPhotoY] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const palette = PALETTES[paletteIndex];
  const ready = Boolean(photoUrl && name.trim() && role.trim());

  useEffect(() => {
    const draw = async () => {
      const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const W = 1080, H = 1350;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = "#0f0f14"; ctx.fillRect(0, 0, W, H);
      const gradient = ctx.createLinearGradient(0, 0, W, H); gradient.addColorStop(0, palette.a); gradient.addColorStop(1, palette.b);
      ctx.fillStyle = gradient; roundRect(ctx, 36, 36, W - 72, H - 72, 52); ctx.fill();
      ctx.globalAlpha = .15; ctx.strokeStyle = palette.ink; ctx.lineWidth = 3;
      for (let x = -300; x < 1400; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 600, H); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.fillStyle = palette.ink; ctx.font = "900 38px Arial"; ctx.fillText("HH", 86, 118);
      ctx.font = "700 22px Arial"; ctx.fillText("GOA 2026", 162, 116); ctx.textAlign = "right"; ctx.font = "700 18px Arial"; ctx.fillText("BUILDER PASS  •  001", 994, 112); ctx.textAlign = "left";
      const px = 86, py = 170, pw = 908, ph = 690;
      ctx.fillStyle = "rgba(255,255,255,.2)"; roundRect(ctx, px, py, pw, ph, 38); ctx.fill();
      if (photoUrl) {
        try {
          const img = await loadImage(photoUrl), scale = Math.max(pw / img.width, ph / img.height) * zoom, sw = pw / scale, sh = ph / scale;
          const sx = Math.max(0, Math.min(img.width - sw, (img.width - sw) * photoX / 100)), sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) * photoY / 100));
          ctx.save(); roundRect(ctx, px, py, pw, ph, 38); ctx.clip(); ctx.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
          const fade = ctx.createLinearGradient(0, py + 420, 0, py + ph); fade.addColorStop(0, "transparent"); fade.addColorStop(1, "rgba(0,0,0,.45)"); ctx.fillStyle = fade; ctx.fillRect(px, py, pw, ph); ctx.restore();
        } catch { setMessage("This device could not read that image. Try a JPG or PNG."); }
      } else {
        ctx.fillStyle = "rgba(15,15,20,.22)"; ctx.font = "800 34px Arial"; ctx.textAlign = "center"; ctx.fillText("YOUR PHOTO", W / 2, py + ph / 2); ctx.textAlign = "left";
      }
      ctx.fillStyle = palette.ink; ctx.font = "700 19px Arial"; ctx.fillText("HELLO, I’M", 86, 930); ctx.font = "900 74px Arial";
      const displayName = (name || "YOUR NAME").toUpperCase(), fitted = displayName.length > 19 ? displayName.slice(0, 18) + "…" : displayName;
      ctx.fillText(fitted, 86, 1007); ctx.font = "700 30px Arial"; ctx.fillText((role || "YOUR STACK / ROLE").toUpperCase().slice(0, 38), 88, 1060);
      ctx.fillStyle = "#063c29"; roundRect(ctx, 86, 1112, 720, 105, 28); ctx.fill(); ctx.fillStyle = "#fff9df"; ctx.font = "800 30px Arial"; ctx.fillText(title.toUpperCase(), 120, 1177);
      ctx.fillStyle = palette.ink; ctx.font = "700 18px Arial"; ctx.fillText("AUG 28–31  •  GOA, INDIA", 88, 1257); ctx.textAlign = "right"; ctx.font = "900 30px Arial"; ctx.fillText("#FRAMEINGOA", 994, 1259); ctx.textAlign = "left";
    };
    draw();
  }, [name, role, title, photoUrl, palette, zoom, photoX, photoY]);

  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !/\.hei[cf]$/i.test(file.name)) { setMessage("Please choose a JPG, PNG, WebP, or HEIC photo."); return; }
    if (file.size > 20 * 1024 * 1024) { setMessage("That photo is over 20 MB. Please choose a smaller one."); return; }
    const reader = new FileReader();
    reader.onload = () => { setPhotoUrl(String(reader.result)); setMessage(""); };
    reader.onerror = () => setMessage("This photo could not be read. Try a JPG or PNG.");
    reader.readAsDataURL(file);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const makeBlob = () => new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, "image/png", 1));
  const download = async () => {
    if (!ready) { setMessage("Add your photo, name, and role first."); return; }
    const blob = await makeBlob(); if (!blob) return; const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `HH-Goa-2026-${name.trim().replace(/\s+/g, "-")}.png`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage("Your Builder ID is downloaded!");
  };
  const share = async () => {
    if (!ready) { setMessage("Add your photo, name, and role first."); return; }
    const copy = `I’m ${name}, a ${role} — and officially a ${title} at HH Goa 2026! 🌴⚡ #FrameInGoa`, blob = await makeBlob();
    const file = blob ? new File([blob], "hh-goa-builder-id.png", { type: "image/png" }) : null;
    if (file && navigator.share && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ text: copy, files: [file] }); return; } catch { return; } }
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(copy)}`, "_blank", "noopener,noreferrer"); setMessage("Your caption is ready on X. Attach the downloaded card to post it.");
  };

  return <main>
    <header className="topbar"><a className="brand" href="#top" aria-label="HH Goa home"><span>HH</span> GOA <b>2026</b></a><span className="status"><i /> BUILDER PASS STUDIO</span></header>
    <section className="hero" id="top"><div className="eyebrow">AUGUST 28–31 • GOA, INDIA</div><h1>Your face.<br /><em>Your build.</em></h1><p>Create the pass that says you came to Goa to ship—not spectate. No login, no upload to a server, no waiting.</p><div className="hero-chips"><span>⚡ INSTANT PREVIEW</span><span>↗ SOCIAL READY</span><span>◉ PRIVATE BY DESIGN</span></div><a className="jump" href="#builder">MAKE MY PASS <span>↓</span></a></section>
    <section className="builder" id="builder">
      <div className="panel form-panel">
        <div className="step"><span>01</span><div><b>Your photo</b><small>We crop it for you — portrait or landscape.</small></div></div>
        <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={(e: ChangeEvent<HTMLInputElement>) => handleFile(e.target.files?.[0])} />
        <div className={`dropzone ${dragging ? "dragging" : ""} ${photoUrl ? "has-photo" : ""}`} role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          {photoUrl ? <img src={photoUrl} alt="Your uploaded preview" /> : <span className="upload-icon">↥</span>}<div><b>{photoUrl ? "Change photo" : "Choose a photo"}</b><small>JPG, PNG, WebP or HEIC • max 20 MB</small></div>
        </div>
        {photoUrl && <div className="crop-controls"><label>Zoom <output>{zoom.toFixed(1)}×</output><input type="range" min="1" max="2" step="0.1" value={zoom} onChange={e=>setZoom(Number(e.target.value))} /></label><div className="position-row"><label>Horizontal<input type="range" min="0" max="100" value={photoX} onChange={e=>setPhotoX(Number(e.target.value))} /></label><label>Vertical<input type="range" min="0" max="100" value={photoY} onChange={e=>setPhotoY(Number(e.target.value))} /></label></div></div>}
        <div className="step second"><span>02</span><div><b>Make it yours</b><small>A few details. Maximum personality.</small></div></div>
        <label>Your name<input maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sivarangini" /></label>
        <label>Your stack / role<input maxLength={38} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Cybersecurity Builder" /></label>
        <label>Builder title</label><div className="title-row"><select value={title} onChange={e => setTitle(e.target.value)}>{TITLES.map(t => <option key={t}>{t}</option>)}</select><button className="shuffle" onClick={() => setTitle(TITLES[(TITLES.indexOf(title) + 1) % TITLES.length])} aria-label="Generate another builder title">↻</button></div>
        <label>Card flavour</label><div className="palette-row">{PALETTES.map((p, i) => <button key={p.name} className={paletteIndex === i ? "active" : ""} onClick={() => setPaletteIndex(i)}><i style={{ background: `linear-gradient(135deg,${p.a},${p.b})` }} />{p.name}</button>)}</div>
      </div>
      <div className="preview-wrap"><div className="preview-head"><span>LIVE PREVIEW</span><span>{ready ? "READY TO SHIP" : "ADD YOUR DETAILS"}</span></div><canvas ref={canvasRef} width="1080" height="1350" aria-label="Live preview of your HH Goa Builder ID" /><div className="actions"><button className="download" onClick={download}>↓ Download PNG</button><button className="share" onClick={share}>𝕏 Share to X</button></div><p className="message" aria-live="polite">{message || "1080 × 1350 px • Optimized for social"}</p></div>
    </section>
    <footer><span>HH GOA 2026</span><p>Built in your browser. Your photo never leaves your device.</p><b>#FRAMEINGOA</b></footer>
  </main>;
}
