"use client";

import { useState, useCallback } from "react";
import QRCode from "qrcode";
import JSZip from "jszip";
import { jsPDF } from "jspdf";

interface GeneratedCode {
  cartNumber: string;
  qrCode: string;
  url: string;
  dataUrl: string;
}

const BASE_URL = "https://teraair.co/s/";

export default function AdminQRPage() {
  const [clubSlug, setClubSlug] = useState("");
  const [singleCart, setSingleCart] = useState("");
  const [bulkCarts, setBulkCarts] = useState("");
  const [codes, setCodes] = useState<GeneratedCode[]>([]);
  const [generating, setGenerating] = useState(false);

  const generateQR = useCallback(
    async (cartNumbers: string[]) => {
      if (!clubSlug.trim()) return;
      setGenerating(true);
      const results: GeneratedCode[] = [];
      for (const num of cartNumbers) {
        const trimmed = num.trim();
        if (!trimmed) continue;
        const qrCode = `${clubSlug.trim()}-cart-${trimmed}`;
        const url = `${BASE_URL}${qrCode}`;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 512,
          margin: 2,
          color: { dark: "#1A1A1A", light: "#FFFFFF" },
        });
        results.push({ cartNumber: trimmed, qrCode, url, dataUrl });
      }
      setCodes((prev) => [...prev, ...results]);
      setGenerating(false);
    },
    [clubSlug]
  );

  const handleSingleGenerate = () => {
    if (singleCart.trim()) {
      generateQR([singleCart]);
      setSingleCart("");
    }
  };

  const handleBulkGenerate = () => {
    const numbers = bulkCarts
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (numbers.length > 0) {
      generateQR(numbers);
      setBulkCarts("");
    }
  };

  const downloadPNG = (code: GeneratedCode) => {
    const a = document.createElement("a");
    a.href = code.dataUrl;
    a.download = `qr-cart-${code.cartNumber}.png`;
    a.click();
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const code of codes) {
      const blob = await (await fetch(code.dataUrl)).blob();
      zip.file(`qr-cart-${code.cartNumber}.png`, blob);
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `qr-codes-${clubSlug}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const perRow = 3;
    const perCol = 4;
    const perPage = perRow * perCol;
    const qrSize = 50;
    const marginX = 15;
    const marginY = 25;
    const gapX = (210 - marginX * 2 - qrSize * perRow) / (perRow - 1);
    const gapY = 8;

    codes.forEach((code, i) => {
      if (i > 0 && i % perPage === 0) doc.addPage();
      const pageIdx = i % perPage;
      const col = pageIdx % perRow;
      const row = Math.floor(pageIdx / perRow);

      // Header on each page
      if (pageIdx === 0) {
        doc.setFontSize(12);
        doc.setTextColor(26, 26, 26);
        doc.text(`Tera Air QR Codes — ${clubSlug}`, marginX, 15);
      }

      const x = marginX + col * (qrSize + gapX);
      const y = marginY + row * (qrSize + gapY + 10);

      doc.addImage(code.dataUrl, "PNG", x, y, qrSize, qrSize);
      doc.setFontSize(9);
      doc.setTextColor(66, 91, 106);
      doc.text(`Cart #${code.cartNumber}`, x + qrSize / 2, y + qrSize + 6, {
        align: "center",
      });
    });

    doc.save(`qr-codes-${clubSlug}.pdf`);
  };

  return (
    <div className="min-h-screen bg-cloud p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-carbon mb-1">QR Code Generator</h1>
        <p className="text-sm text-graphite mb-8">
          Generate QR codes for golf cart cooling activations
        </p>

        {/* Club slug input */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-graphite uppercase tracking-wider mb-2">
            Club Slug
          </label>
          <input
            value={clubSlug}
            onChange={(e) => setClubSlug(e.target.value)}
            placeholder="e.g. demo-golf-club"
            className="w-full h-11 rounded-xl border border-mist bg-white px-4 text-sm text-carbon outline-none focus:border-sky transition-colors"
          />
        </div>

        {/* Single cart */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-graphite uppercase tracking-wider mb-2">
            Single Cart Number
          </label>
          <div className="flex gap-3">
            <input
              value={singleCart}
              onChange={(e) => setSingleCart(e.target.value)}
              placeholder="e.g. 001"
              className="flex-1 h-11 rounded-xl border border-mist bg-white px-4 text-sm text-carbon outline-none focus:border-sky transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleSingleGenerate()}
            />
            <button
              onClick={handleSingleGenerate}
              disabled={!clubSlug.trim() || !singleCart.trim() || generating}
              className="h-11 px-6 rounded-xl border-none bg-carbon text-white text-sm font-semibold cursor-pointer disabled:bg-mist disabled:text-gray-400 disabled:cursor-default transition-colors"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Bulk carts */}
        <div className="mb-8">
          <label className="block text-xs font-semibold text-graphite uppercase tracking-wider mb-2">
            Bulk Cart Numbers
          </label>
          <textarea
            value={bulkCarts}
            onChange={(e) => setBulkCarts(e.target.value)}
            placeholder="One per line or comma-separated:&#10;001&#10;002&#10;003"
            rows={4}
            className="w-full rounded-xl border border-mist bg-white px-4 py-3 text-sm text-carbon outline-none focus:border-sky transition-colors resize-y font-mono"
          />
          <button
            onClick={handleBulkGenerate}
            disabled={!clubSlug.trim() || !bulkCarts.trim() || generating}
            className="mt-3 h-11 px-6 rounded-xl border-none bg-carbon text-white text-sm font-semibold cursor-pointer disabled:bg-mist disabled:text-gray-400 disabled:cursor-default transition-colors"
          >
            {generating ? "Generating..." : "Generate All"}
          </button>
        </div>

        {/* Generated codes */}
        {codes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-carbon">
                Generated ({codes.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadZip}
                  className="h-9 px-4 rounded-lg border border-mist bg-white text-xs font-semibold text-carbon cursor-pointer hover:bg-cloud transition-colors"
                >
                  Download ZIP
                </button>
                <button
                  onClick={downloadPDF}
                  className="h-9 px-4 rounded-lg border border-mist bg-white text-xs font-semibold text-carbon cursor-pointer hover:bg-cloud transition-colors"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => setCodes([])}
                  className="h-9 px-4 rounded-lg border border-mist bg-white text-xs font-semibold text-gray-400 cursor-pointer hover:bg-cloud transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {codes.map((code) => (
                <div
                  key={code.qrCode}
                  className="bg-white rounded-2xl p-4 text-center"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={code.dataUrl}
                    alt={`QR code for cart ${code.cartNumber}`}
                    className="w-full aspect-square rounded-lg mb-3"
                  />
                  <div className="text-sm font-semibold text-carbon mb-0.5">
                    Cart #{code.cartNumber}
                  </div>
                  <div className="text-[10px] text-gray-400 mb-3 break-all">
                    {code.url}
                  </div>
                  <button
                    onClick={() => downloadPNG(code)}
                    className="w-full h-8 rounded-lg border border-mist bg-cloud text-xs font-medium text-graphite cursor-pointer hover:bg-mist transition-colors"
                  >
                    Download PNG
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
