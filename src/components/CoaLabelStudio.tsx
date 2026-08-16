import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, Printer, Share2, Smartphone, ShieldCheck } from "lucide-react";

export interface LabelStudioRecord {
  id: string;
  shortCode: string;
  productName: string;
  strength: string;
  productSku: string;
  taskNumber?: string;
}

type MediaPreset = "nelko" | "brother";

const CANONICAL_ORIGIN = "https://peptide-south-africa.com";

const PRESETS: Record<MediaPreset, {
  label: string;
  widthMm: number;
  heightMm: number;
  width: number;
  height: number;
  dpi: number;
}> = {
  nelko: { label: "Nelko P21", widthMm: 40, heightMm: 14, width: 320, height: 112, dpi: 203 },
  brother: { label: "Brother VC-500W", widthMm: 45, heightMm: 25, width: 554, height: 308, dpi: 313 },
};

function fitText(
  context: CanvasRenderingContext2D,
  text: string,
  startSize: number,
  minimumSize: number,
  maxWidth: number,
  weight = 800,
) {
  let size = startSize;
  while (size > minimumSize) {
    context.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Label export failed")), "image/png", 1);
  });
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function nelkoBackgroundBlob(canvas: HTMLCanvasElement) {
  const background = document.createElement("canvas");
  background.width = canvas.width;
  background.height = canvas.height;
  const context = background.getContext("2d", { alpha: false });
  if (!context) throw new Error("Nelko background export failed");
  context.drawImage(canvas, 0, 0);
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, 112, 112);
  return canvasBlob(background);
}

export default function CoaLabelStudio({ records }: { records: LabelStudioRecord[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState(records[0]?.id ?? "");
  const [preset, setPreset] = useState<MediaPreset>("nelko");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [status, setStatus] = useState("");

  const record = useMemo(
    () => records.find((item) => item.id === selectedId) ?? records[0],
    [records, selectedId],
  );
  const media = PRESETS[preset];
  const verifyUrl = record ? `${CANONICAL_ORIGIN}/v/${encodeURIComponent(record.shortCode)}` : "";

  useEffect(() => {
    if (!record) return;
    setSelectedId((current) => records.some((item) => item.id === current) ? current : record.id);
  }, [record, records]);

  useEffect(() => {
    let cancelled = false;
    if (!verifyUrl) return;
    QRCode.toDataURL(verifyUrl, {
      errorCorrectionLevel: "L",
      margin: 4,
      scale: preset === "nelko" ? 3 : 5,
      color: { dark: "#000000", light: "#FFFFFF" },
    }).then((value) => {
      if (!cancelled) setQrDataUrl(value);
    });
    return () => { cancelled = true; };
  }, [preset, verifyUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !record || !qrDataUrl) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    canvas.width = media.width;
    canvas.height = media.height;

    const qr = new Image();
    qr.onload = () => {
      context.save();
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, media.width, media.height);

      if (preset === "nelko") {
        const qrSize = Math.min(qr.naturalWidth, 111);
        context.imageSmoothingEnabled = false;
        context.drawImage(qr, 0, 0, qrSize, qrSize);
        context.imageSmoothingEnabled = true;

        const x = 122;
        const available = media.width - x - 7;
        context.fillStyle = "#000000";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.font = "800 13px Arial, Helvetica, sans-serif";
        context.fillText("PEPTIDE SOUTH AFRICA", x, 23);

        const productLine = `${record.productName} ${record.strength}`;
        const productSize = fitText(context, productLine, 24, 16, available);
        context.font = `800 ${productSize}px Arial, Helvetica, sans-serif`;
        context.fillText(productLine, x, 63);
        context.fillRect(x, 72, 42, 3);
        context.font = "700 12px Arial, Helvetica, sans-serif";
        context.fillText("SCAN TO VERIFY COA", x, 96);
      } else {
        context.fillStyle = "#55C8BE";
        context.fillRect(0, 0, media.width, 11);
        context.fillStyle = "#149F99";
        context.fillRect(0, media.height - 9, media.width, 9);

        const qrSize = 192;
        context.imageSmoothingEnabled = false;
        context.drawImage(qr, 22, 38, qrSize, qrSize);
        context.imageSmoothingEnabled = true;

        const x = 236;
        const available = media.width - x - 24;
        context.fillStyle = "#082B57";
        context.textAlign = "left";
        context.textBaseline = "alphabetic";
        context.font = "800 22px Arial, Helvetica, sans-serif";
        context.fillText("PEPTIDE", x, 67);
        context.font = "700 12px Arial, Helvetica, sans-serif";
        context.fillText("SOUTH AFRICA", x, 85);

        const productLine = `${record.productName} ${record.strength}`;
        const productSize = fitText(context, productLine, 32, 20, available);
        context.font = `800 ${productSize}px Arial, Helvetica, sans-serif`;
        context.fillText(productLine, x, 178);
        context.fillStyle = "#149F99";
        context.fillRect(x, 197, 62, 5);
        context.fillStyle = "#082B57";
        context.font = "800 14px Arial, Helvetica, sans-serif";
        context.fillText("SCAN COA", 82, 258);
      }
      context.restore();
    };
    qr.src = qrDataUrl;
  }, [media, preset, qrDataUrl, record]);

  if (!record) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground">
        Publish a COA before generating a verified label.
      </div>
    );
  }

  const filename = `psa-${record.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${media.widthMm}x${media.heightMm}mm.png`;
  const backgroundFilename = `psa-${record.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-nelko-background-40x14mm.png`;

  const download = async () => {
    if (!canvasRef.current) return;
    const blob = await canvasBlob(canvasRef.current);
    saveBlob(blob, filename);
    setStatus(preset === "nelko"
      ? "Full raster proof saved. For a camera-readable print, use the native Nelko QR workflow below."
      : "Print-ready PNG saved.");
  };

  const downloadNelkoBackground = async () => {
    if (!canvasRef.current) return;
    saveBlob(await nelkoBackgroundBlob(canvasRef.current), backgroundFilename);
    setStatus("Nelko background saved. Import it, then add the QR as a native Nelko element.");
  };

  const copyVerifyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } catch {
      const field = document.createElement("textarea");
      field.value = verifyUrl;
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setStatus("Verification URL copied. Paste it into Nelko's native QR code tool.");
  };

  const share = async () => {
    if (!canvasRef.current) return;
    const useNelkoBackground = preset === "nelko";
    const blob = useNelkoBackground
      ? await nelkoBackgroundBlob(canvasRef.current)
      : await canvasBlob(canvasRef.current);
    const sharedFilename = useNelkoBackground ? backgroundFilename : filename;
    const file = new File([blob], sharedFilename, { type: "image/png" });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try {
        await navigator.share({
          files: [file],
          text: useNelkoBackground ? `Native QR URL: ${verifyUrl}` : undefined,
          title: `${record.productName} vial label`,
        });
        setStatus(useNelkoBackground
          ? "Background shared. Add a native Nelko QR using the copied verification URL."
          : "Label shared.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    saveBlob(blob, sharedFilename);
    setStatus(useNelkoBackground
      ? "Sharing is unavailable here. The Nelko background was downloaded instead."
      : "Sharing is unavailable here. The PNG was downloaded instead.");
  };

  const printExact = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.border = "0";
    frame.srcdoc = `<!doctype html><html><head><style>@page{size:${media.widthMm}mm ${media.heightMm}mm;margin:0}html,body{margin:0;padding:0}img{display:block;width:${media.widthMm}mm;height:${media.heightMm}mm}</style></head><body><img src="${image}" onload="window.print()"></body></html>`;
    document.body.appendChild(frame);
    window.setTimeout(() => frame.remove(), 30_000);
    setStatus("System print dialog opened at exact label dimensions.");
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/20 bg-background shadow-card">
      <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="border-b border-border p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.16em]">Verified label studio</span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold text-foreground">COA-linked vial labels</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Every QR uses a short, PSA-owned verification path. For Nelko prints, create the QR natively in the app so image resizing cannot soften the code.
          </p>

          <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            COA and compound
          </label>
          <select
            value={record.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-input bg-card px-3 py-3 text-sm text-foreground"
          >
            {records.map((item) => (
              <option key={item.id} value={item.id}>
                {item.productName} {item.strength} · {item.productSku}
              </option>
            ))}
          </select>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {(Object.keys(PRESETS) as MediaPreset[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreset(key)}
                className={`rounded-xl border p-3 text-left transition-all ${preset === key ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/40"}`}
              >
                <span className="block text-sm font-bold text-foreground">{PRESETS[key].label}</span>
                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                  {PRESETS[key].widthMm} × {PRESETS[key].heightMm} mm · {PRESETS[key].dpi} dpi
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-muted/50 p-3 font-mono text-[11px] text-muted-foreground">
            QR → {verifyUrl}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-4">
            <canvas
              ref={canvasRef}
              className="h-auto max-w-full bg-white shadow-lg"
              style={{ aspectRatio: `${media.width} / ${media.height}` }}
              aria-label={`${record.productName} ${media.label} label preview`}
            />
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-muted-foreground">
            Native export: {media.width} × {media.height} px · {media.widthMm} × {media.heightMm} mm
          </p>

          {preset === "nelko" ? (
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={copyVerifyUrl} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Copy className="h-4 w-4" /> Copy native QR link
              </button>
              <button type="button" onClick={downloadNelkoBackground} className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-semibold text-foreground hover:bg-primary/10">
                <Download className="h-4 w-4" /> Save Nelko background
              </button>
              <button type="button" onClick={share} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                <Share2 className="h-4 w-4" /> Share background
              </button>
              <button type="button" onClick={download} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
                <Download className="h-4 w-4" /> Full PNG · backup only
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={share} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Share2 className="h-4 w-4" /> Share to phone
              </button>
              <button type="button" onClick={download} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                <Download className="h-4 w-4" /> Save PNG
              </button>
              <button type="button" onClick={printExact} className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                <Printer className="h-4 w-4" /> Print exact size
              </button>
            </div>
          )}

          <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
            <p className="flex items-center gap-2 font-semibold text-foreground"><Smartphone className="h-4 w-4 text-primary" /> Camera-safe Nelko workflow</p>
            <ol className="mt-2 list-decimal space-y-1 pl-4">
              <li>Tap <strong>Copy native QR link</strong>, then save or share the Nelko background.</li>
              <li>In the Nelko app, select the P21 40 × 14 mm label and import the background at 100%.</li>
              <li>Use Nelko's <strong>QR code</strong> tool, paste the copied link and place the native QR over the blank left square.</li>
              <li>Keep the QR black on white and as large as the left square allows. Do not add a border or other artwork around it.</li>
              <li>Use the darkest/highest-quality print setting. Scan the first label while it is still flat, then apply it with the QR centred on the visible face of the vial.</li>
            </ol>
            <p className="mt-2 font-medium text-foreground">If the flat label scans but the vial does not, the vial curvature—not the URL—is the failure point.</p>
          </div>
          {status && <p className="mt-3 text-center text-xs font-medium text-primary" role="status">{status}</p>}
        </div>
      </div>
    </div>
  );
}
