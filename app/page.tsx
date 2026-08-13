"use client";

import { ChangeEvent, DragEvent, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { SITE_URL } from "./site";

const TITLES = ["Zero-to-One Builder", "Pixel & Protocol Pirate", "Ship-It Sorcerer", "Full-Stack Firestarter", "Product Tide Turner", "Bug-Squashing Buccaneer"];
const PALETTES = [
  { name: "Goa", a: "#ffd91a", b: "#ffdc36", ink: "#063c29" },
  { name: "Forest", a: "#075d3c", b: "#0a7b4d", ink: "#ffe21f" },
  { name: "Carnival", a: "#ff2b88", b: "#ffcc18", ink: "#073e2b" },
];

const CARD_W = 1080;
const CARD_H = 1350;
/** Photo window inside the card. `.photo-grab` in globals.css mirrors these as percentages. */
const FRAME = { x: 86, y: 170, w: 908, h: 690, r: 38 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const CARD_WEIGHTS = [700, 800, 900];
const FALLBACK_FONT = "Arial, Helvetica, sans-serif";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function loadImage(url: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url; }); }

function isHeic(file: File) { return /image\/hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name); }

/** Stable per-name so the ID on the card always matches the one in the share text. */
function builderId(seed: string) {
  const key = seed.trim().toLowerCase() || "builder";
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) { hash ^= key.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return `HH-GOA-${1000 + ((hash >>> 0) % 9000)}`;
}

function safeFileName(value: string) {
  // Keep marks (\p{M}) so Indic and accented names survive intact; drop everything
  // else, which covers path separators, emoji and control characters.
  const base = value.trim().normalize("NFC").replace(/[^\p{L}\p{N}\p{M}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  return base || "Builder";
}

/** Cover-fit scale plus how far the photo may travel before a gap shows at the frame edge. */
function coverMetrics(img: HTMLImageElement, zoom: number, rotation: number) {
  const swapped = rotation % 180 !== 0;
  const iw = swapped ? img.naturalHeight : img.naturalWidth;
  const ih = swapped ? img.naturalWidth : img.naturalHeight;
  const scale = Math.max(FRAME.w / iw, FRAME.h / ih) * zoom;
  return { scale, maxX: Math.max(0, (iw * scale - FRAME.w) / 2), maxY: Math.max(0, (ih * scale - FRAME.h) / 2) };
}

const toSlider = (value: number, max: number) => (max > 0 ? Math.round(50 - (value / max) * 50) : 50);
const fromSlider = (value: number, max: number) => -((value - 50) / 50) * max;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef("");
  const fontPromiseRef = useRef<Promise<void> | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [title, setTitle] = useState(TITLES[0]);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [cardFont, setCardFont] = useState(FALLBACK_FONT);

  const palette = PALETTES[paletteIndex];
  const ready = Boolean(photo && name.trim() && role.trim());
  const passId = builderId(name);
  const metrics = photo ? coverMetrics(photo, zoom, rotation) : null;

  const releasePhoto = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = "";
  }, []);

  const clearPhoto = useCallback(() => {
    releasePhoto();
    setPhotoUrl("");
    setPhoto(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [releasePhoto]);

  useEffect(() => releasePhoto, [releasePhoto]);

  // Resolve the real webfont before anything is drawn, so a downloaded PNG can
  // never contain the fallback face.
  useEffect(() => {
    const stack = getComputedStyle(document.body).getPropertyValue("--font-card").trim();
    if (!stack || !document.fonts) return;
    const family = `${stack}, ${FALLBACK_FONT}`;
    const primary = stack.split(",")[0].trim();
    const settle = () => setCardFont(family);
    fontPromiseRef.current = Promise.all(CARD_WEIGHTS.map(weight => document.fonts.load(`${weight} 74px ${primary}`)))
      .then(() => document.fonts.ready)
      .then(settle, settle);
  }, []);

  // Decode once per photo instead of re-decoding on every keystroke.
  useEffect(() => {
    if (!photoUrl) { setPhoto(null); return; }
    let cancelled = false;
    loadImage(photoUrl).then(
      img => { if (!cancelled) { setPhoto(img); setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); } },
      () => { if (!cancelled) { clearPhoto(); setMessage("We couldn't open that photo. Please choose another one — JPG or PNG works best."); } },
    );
    return () => { cancelled = true; };
  }, [photoUrl, clearPhoto]);

  // Zooming out or rotating shrinks the travel limit; pull the photo back in.
  useEffect(() => {
    if (!photo) return;
    const { maxX, maxY } = coverMetrics(photo, zoom, rotation);
    setOffset(current => {
      const x = clamp(current.x, -maxX, maxX), y = clamp(current.y, -maxY, maxY);
      return x === current.x && y === current.y ? current : { x, y };
    });
  }, [photo, zoom, rotation]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const font = (spec: string) => `${spec} ${cardFont}`;
    ctx.clearRect(0, 0, CARD_W, CARD_H); ctx.fillStyle = "#0f0f14"; ctx.fillRect(0, 0, CARD_W, CARD_H);
    const gradient = ctx.createLinearGradient(0, 0, CARD_W, CARD_H); gradient.addColorStop(0, palette.a); gradient.addColorStop(1, palette.b);
    ctx.fillStyle = gradient; roundRect(ctx, 36, 36, CARD_W - 72, CARD_H - 72, 52); ctx.fill();
    ctx.globalAlpha = .15; ctx.strokeStyle = palette.ink; ctx.lineWidth = 3;
    for (let x = -300; x < 1400; x += 70) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 600, CARD_H); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.fillStyle = palette.ink; ctx.font = font("900 38px"); ctx.fillText("HH", 86, 118);
    ctx.font = font("700 22px"); ctx.fillText("GOA 2026", 162, 116); ctx.textAlign = "right"; ctx.font = font("700 18px"); ctx.fillText(`BUILDER PASS  •  ${passId}`, 994, 112); ctx.textAlign = "left";

    ctx.fillStyle = "rgba(255,255,255,.2)"; roundRect(ctx, FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.r); ctx.fill();
    if (photo) {
      const { scale, maxX, maxY } = coverMetrics(photo, zoom, rotation);
      ctx.save();
      roundRect(ctx, FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.r); ctx.clip();
      ctx.translate(FRAME.x + FRAME.w / 2 + clamp(offset.x, -maxX, maxX), FRAME.y + FRAME.h / 2 + clamp(offset.y, -maxY, maxY));
      ctx.rotate((rotation * Math.PI) / 180);
      const dw = photo.naturalWidth * scale, dh = photo.naturalHeight * scale;
      ctx.drawImage(photo, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
      ctx.save();
      roundRect(ctx, FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.r); ctx.clip();
      const fade = ctx.createLinearGradient(0, FRAME.y + 420, 0, FRAME.y + FRAME.h); fade.addColorStop(0, "transparent"); fade.addColorStop(1, "rgba(0,0,0,.45)");
      ctx.fillStyle = fade; ctx.fillRect(FRAME.x, FRAME.y, FRAME.w, FRAME.h);
      ctx.restore();
    } else {
      ctx.fillStyle = "rgba(15,15,20,.22)"; ctx.font = font("800 34px"); ctx.textAlign = "center"; ctx.fillText("YOUR PHOTO", CARD_W / 2, FRAME.y + FRAME.h / 2); ctx.textAlign = "left";
    }

    ctx.fillStyle = palette.ink; ctx.font = font("700 19px"); ctx.fillText("HELLO, I’M", 86, 930); ctx.font = font("900 74px");
    const displayName = (name || "YOUR NAME").toUpperCase(), fitted = displayName.length > 19 ? `${displayName.slice(0, 18)}…` : displayName;
    ctx.fillText(fitted, 86, 1007); ctx.font = font("700 30px"); ctx.fillText((role || "YOUR STACK / ROLE").toUpperCase().slice(0, 38), 88, 1060);
    ctx.fillStyle = "#063c29"; roundRect(ctx, 86, 1112, 720, 105, 28); ctx.fill(); ctx.fillStyle = "#fff9df"; ctx.font = font("800 30px"); ctx.fillText(title.toUpperCase(), 120, 1177);
    ctx.fillStyle = palette.ink; ctx.font = font("700 18px"); ctx.fillText("AUG 28–31  •  GOA, INDIA", 88, 1257); ctx.textAlign = "right"; ctx.font = font("900 30px"); ctx.fillText("#FRAMEINGOA", 994, 1259); ctx.textAlign = "left";
  }, [cardFont, name, offset.x, offset.y, palette, passId, photo, role, rotation, title, zoom]);

  useEffect(() => { draw(); }, [draw]);

  const renderBlob = useCallback(async () => {
    await fontPromiseRef.current;
    draw();
    return new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve, "image/png", 1));
  }, [draw]);


  const handleFile = async (file?: File) => {
    if (!file) return;
    const heic = isHeic(file);
    if (!file.type.startsWith("image/") && !heic) { setMessage("Please choose a JPG, PNG, WebP, or HEIC photo."); return; }
    if (file.size > 20 * 1024 * 1024) { setMessage("That photo is over 20 MB. Please choose a smaller one."); return; }
    setBusy(true);
    try {
      let source: Blob = file;
      if (heic) {
        setMessage("Converting your iPhone photo…");
        const { default: heic2any } = await import("heic2any");
        const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
        source = Array.isArray(converted) ? converted[0] : converted;
      }
      releasePhoto();
      objectUrlRef.current = URL.createObjectURL(source);
      setPhotoUrl(objectUrlRef.current);
      setMessage("");
    } catch {
      clearPhoto();
      setMessage(heic
        ? "That HEIC photo couldn't be converted. Please pick another one, or export it as JPG first."
        : "We couldn't read that photo. Please choose another one.");
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; e.target.value = ""; handleFile(file); };

  const pinchDistance = () => {
    const [a, b] = [...pointersRef.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!photo) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) pinchRef.current = { distance: pinchDistance(), zoom };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const previous = pointersRef.current.get(e.pointerId);
    if (!previous || !photo) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size >= 2) {
      const start = pinchRef.current;
      if (start && start.distance > 0) setZoom(clamp((start.zoom * pinchDistance()) / start.distance, MIN_ZOOM, MAX_ZOOM));
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = rect.width > 0 ? FRAME.w / rect.width : 1;
    const dx = (e.clientX - previous.x) * ratio, dy = (e.clientY - previous.y) * ratio;
    const { maxX, maxY } = coverMetrics(photo, zoom, rotation);
    setOffset(current => ({ x: clamp(current.x + dx, -maxX, maxX), y: clamp(current.y + dy, -maxY, maxY) }));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const rotate = () => { setRotation(current => (current + 90) % 360); setOffset({ x: 0, y: 0 }); };
  const resetPhoto = () => { setZoom(1); setRotation(0); setOffset({ x: 0, y: 0 }); };

  const cardFileName = () => `HH-Goa-2026-${safeFileName(name)}.png`;

  const shareText = () => `🌴 Built my Hacker Goa House Builder Card!

👤 ${name.trim()}
🪪 Builder ID: #${passId}

Excited to build, ship, and connect with amazing builders in Goa. 🚀

Create your own Builder Card:
${SITE_URL}

#FrameInGoa #HHGoa2026`;

  const savePng = async () => {
    const blob = await renderBlob();
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = cardFileName();
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  };

  const download = async () => {
    if (!ready) { setMessage("Add your photo, name, and role first."); return; }
    try {
      setMessage(await savePng()
        ? "Your Builder ID is downloaded!"
        : "Your browser couldn't export the image. Please try again, or use Chrome or Safari.");
    } catch {
      setMessage("Something went wrong while exporting your card. Please try again.");
    }
  };

  // x.com/intent/post has no image parameter, so on browsers that support
  // sharing files (mostly mobile) we try the native share sheet first, with
  // the card PNG attached. This is strictly additive: any lack of support,
  // any thrown error, and any user cancellation (AbortError) all fall through
  // to the exact same text-only x.com/intent/post flow that already works
  // everywhere, so that flow can never regress because of this addition.
  const share = async () => {
    if (!ready) { setMessage("Add your photo, name, and role first."); return; }

    if (typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
      try {
        const blob = await renderBlob();
        const file = blob ? new File([blob], cardFileName(), { type: "image/png" }) : null;
        if (file && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: shareText() });
          setMessage("Shared! Pick X in the share sheet to post your card.");
          return;
        }
      } catch {
        // Falls through to the text-only flow below — including when the
        // user simply cancelled the share sheet (AbortError).
      }
    }

    window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareText())}`, "_blank", "noopener,noreferrer");
    setMessage("Your post is ready on X. Download the card to attach it yourself.");
  };

  return <main>
    <header className="topbar"><a className="brand" href="#top" aria-label="HH Goa home"><span>HH</span> GOA <b>2026</b></a><span className="status"><i /> BUILDER PASS STUDIO</span></header>
    <section className="hero" id="top"><div className="eyebrow">OCTOBER 28–31 • GOA, INDIA</div><h1>CREATE YOUR<br /><em>GOA MOMENT</em></h1><p>Create the pass that says you came to Goa to ship—not spectate. No login, no upload to a server, no waiting.</p><div className="hero-chips"><span>⚡ INSTANT PREVIEW</span><span>↗ SOCIAL READY</span><span>◉ PRIVATE BY DESIGN</span></div><a className="jump" href="#builder">MAKE MY PASS <span>↓</span></a></section>
    <section className="builder" id="builder">
      <img className="builder-bg" src="/sunrise-bg.webp" alt="" aria-hidden="true" />
      <div className="panel form-panel">
        <div className="pane pane-identity">
          <div className="pane-head"><span className="pane-num">01</span><div><b>Identity</b><small>Who&rsquo;s on the pass.</small></div></div>
          <label>Your name<input maxLength={24} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sivarangini" /></label>
          <label>Your stack / role<input maxLength={38} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Cybersecurity Builder" /></label>
        </div>

        <div className="ticket-rule tr-a" role="presentation" />

        <div className="pane pane-photo">
          <div className="pane-head"><span className="pane-num">02</span><div><b>Photo</b><small>Drag to reposition, zoom, or rotate — we keep it cropped.</small></div></div>
          <input ref={inputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" onChange={onPick} />
        <div className={`dropzone ${dragging ? "dragging" : ""} ${photoUrl ? "has-photo" : ""} ${busy ? "busy" : ""}`} role="button" tabIndex={0} aria-busy={busy} onClick={() => inputRef.current?.click()} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          {photoUrl ? <img src={photoUrl} alt="Your uploaded preview" /> : <span className="upload-icon">↥</span>}<div><b>{busy ? "Preparing your photo…" : photoUrl ? "Change photo" : "Choose a photo"}</b><small>JPG, PNG, WebP or HEIC • max 20 MB</small></div>
        </div>
        {photo && metrics && <div className="crop-controls">
          <label>Zoom <output>{zoom.toFixed(1)}×</output><input type="range" min={MIN_ZOOM} max={MAX_ZOOM} step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} /></label>
          <div className="position-row">
            <label>Horizontal<input type="range" min="0" max="100" value={toSlider(offset.x, metrics.maxX)} disabled={metrics.maxX === 0} onChange={e => setOffset(current => ({ ...current, x: fromSlider(Number(e.target.value), metrics.maxX) }))} /></label>
            <label>Vertical<input type="range" min="0" max="100" value={toSlider(offset.y, metrics.maxY)} disabled={metrics.maxY === 0} onChange={e => setOffset(current => ({ ...current, y: fromSlider(Number(e.target.value), metrics.maxY) }))} /></label>
          </div>
          <div className="crop-actions"><button type="button" onClick={rotate}>↻ Rotate 90°</button><button type="button" onClick={resetPhoto}>⟲ Reset</button></div>
          <p className="crop-hint">Drag the photo in the preview to reposition • pinch to zoom on touch</p>
        </div>}
        </div>

        <div className="ticket-rule tr-b" role="presentation" />

        <div className="pane pane-class">
          <div className="pane-head"><span className="pane-num">03</span><div><b>Builder class</b><small>Your title and the flavour of the pass.</small></div></div>
          <label>Builder title</label><div className="title-row"><select value={title} onChange={e => setTitle(e.target.value)}>{TITLES.map(t => <option key={t}>{t}</option>)}</select><button className="shuffle" onClick={() => setTitle(TITLES[(TITLES.indexOf(title) + 1) % TITLES.length])} aria-label="Generate another builder title">↻</button></div>
          <label>Card flavour</label><div className="palette-row">{PALETTES.map((p, i) => <button key={p.name} className={paletteIndex === i ? "active" : ""} onClick={() => setPaletteIndex(i)}><i style={{ background: `linear-gradient(135deg,${p.a},${p.b})` }} />{p.name}</button>)}</div>
        </div>
      </div>
      <div className="preview-wrap">
        <div className="preview-head"><span>LIVE PREVIEW</span><span>{ready ? "READY TO SHIP" : "ADD YOUR DETAILS"}</span></div>
        <div className="canvas-stage">
          <canvas ref={canvasRef} width={CARD_W} height={CARD_H} aria-label="Live preview of your HH Goa Builder ID" />
          {photo && <div className="photo-grab" role="presentation" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} />}
        </div>
        <div className="actions"><button className="download" onClick={download}>↓ Download PNG</button><button className="share" onClick={share}>𝕏 Share to X</button></div>
        <p className="message" aria-live="polite">{message || "1080 × 1350 px • Optimized for social"}</p>
      </div>
    </section>
    <footer><span>HH GOA 2026</span><p>Built in your browser. Your photo never leaves your device.</p><b>#FRAMEINGOA</b></footer>
  </main>;
}
