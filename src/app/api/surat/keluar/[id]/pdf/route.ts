import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFPage,
  type PDFFont,
} from "pdf-lib";

import fs from "fs";
import path from "path";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


export const runtime = "nodejs";


// ======================================================
// KONFIGURASI KATI
// ======================================================

const KATI = {
  yayasan1: "YAYASAN PENDIDIKAN DAN SOSIAL",

  yayasan2: "TEGALSARI SEJAHTERA GEDANGAN",

  kampus:
    "KAMPUS ALAM TEGALSARI INDONESIA (KATI)",

  alamat:
    "Sekretariat: Dusun Umbulrejo RT.015/RW.005, Sidodadi, Gedangan, Malang 65178",

  email:
    "kampusalamtegalsariindonesia@gmail.com",

  telepon:
    "08133681676",

  kota:
    "Malang",

  sekretaris: {
    jabatan: "Sekretaris",

    organisasi:
      "Kampus Alam Tegalsari Indonesia",

    nama:
      "Abdul Mujab, S.Pd",
  },

  direktur: {
    jabatan:
      "Direktur Utama",

    organisasi:
      "Kampus Alam Tegalsari Indonesia",

    nama:
      "Abdul Mun’im Faradis, S.Pd",
  },
};


// ======================================================
// PAGE
// ======================================================

const PAGE_WIDTH = 595.28;

const PAGE_HEIGHT = 841.89;

const LEFT = 68;

const RIGHT = 68;

const CONTENT_WIDTH =
  PAGE_WIDTH -
  LEFT -
  RIGHT;


// ======================================================
// COLORS
// ======================================================

const BLACK = rgb(
  0,
  0,
  0
);

const GRAY = rgb(
  0.40,
  0.40,
  0.40
);

const BLUE = rgb(
  0.05,
  0.30,
  0.65
);


// ======================================================
// ROUTE TYPE
// ======================================================

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};


// ======================================================
// CLEAN TEXT
// ======================================================

function cleanText(
  value: string
) {
  return value
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/“|”/g, '"')
    .replace(/‘/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(
      /[^\x00-\xFF\u2019]/g,
      ""
    );
}


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(
  tanggal: Date
) {
  return tanggal.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",

      month: "long",

      year: "numeric",
    }
  );
}


// ======================================================
// SAFE FILE NAME
// ======================================================

function safeFileName(
  value: string
) {
  return value.replace(
    /[\\/:*?"<>|]/g,
    "-"
  );
}


// ======================================================
// WRAP TEXT
// ======================================================

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
) {
  const words =
    cleanText(text)
      .trim()
      .split(/\s+/);


  const lines: string[] = [];


  let current = "";


  for (
    const word of words
  ) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;


    const width =
      font.widthOfTextAtSize(
        candidate,
        size
      );


    if (
      width <= maxWidth
    ) {
      current =
        candidate;
    } else {
      if (current) {
        lines.push(
          current
        );
      }

      current =
        word;
    }
  }


  if (current) {
    lines.push(
      current
    );
  }


  return lines;
}


// ======================================================
// DRAW CENTER
// ======================================================

function drawCentered(
  page: PDFPage,

  text: string,

  font: PDFFont,

  size: number,

  y: number,

  color = BLACK
) {
  const safe =
    cleanText(text);


  const width =
    font.widthOfTextAtSize(
      safe,
      size
    );


  page.drawText(
    safe,
    {
      x:
        (
          PAGE_WIDTH -
          width
        ) / 2,

      y,

      size,

      font,

      color,
    }
  );
}


// ======================================================
// LOGO
// ======================================================

async function loadPng(
  pdf: PDFDocument,
  filename: string
) {
  try {
    const filePath =
      path.join(
        process.cwd(),
        "public",
        filename
      );


    if (
      !fs.existsSync(
        filePath
      )
    ) {
      return null;
    }


    const bytes =
      fs.readFileSync(
        filePath
      );


    return await pdf.embedPng(
      bytes
    );
  } catch {
    return null;
  }
}


// ======================================================
// HEADER / KOP
// ======================================================

async function drawHeader(
  pdf: PDFDocument,

  page: PDFPage,

  font: PDFFont,

  fontBold: PDFFont,

  fontItalic: PDFFont
) {
  const logoLeft =
    await loadPng(
      pdf,
      "logokati.png"
    );


  const logoRight =
    await loadPng(
      pdf,
      "logoyayasan.png"
    );


  // LOGO KIRI

  if (logoLeft) {
    const scaled =
      logoLeft.scaleToFit(
        63,
        63
      );


    page.drawImage(
      logoLeft,
      {
        x: 31,

        y: 754,

        width:
          scaled.width,

        height:
          scaled.height,
      }
    );
  }


  // LOGO KANAN

  if (logoRight) {
    const scaled =
      logoRight.scaleToFit(
        66,
        66
      );


    page.drawImage(
      logoRight,
      {
        x:
          PAGE_WIDTH -
          31 -
          scaled.width,

        y: 751,

        width:
          scaled.width,

        height:
          scaled.height,
      }
    );
  }


  // KOP BARIS 1

  drawCentered(
    page,

    KATI.yayasan1,

    fontBold,

    12.5,

    812,

    GRAY
  );


  // KOP BARIS 2

  drawCentered(
    page,

    KATI.yayasan2,

    fontBold,

    12.5,

    797,

    GRAY
  );


  // KOP BARIS 3

  drawCentered(
    page,

    KATI.kampus,

    fontBold,

    12.5,

    779,

    GRAY
  );


  // ALAMAT

  drawCentered(
    page,

    KATI.alamat,

    fontItalic,

    7.3,

    765,

    GRAY
  );


  // KONTAK

  const contact =
    `Email: ${KATI.email}  Telp: ${KATI.telepon}`;


  drawCentered(
    page,

    contact,

    fontItalic,

    7.3,

    754,

    BLUE
  );


  // GARIS DOUBLE

  page.drawLine({
    start: {
      x: 54,
      y: 744,
    },

    end: {
      x:
        PAGE_WIDTH - 54,

      y: 744,
    },

    thickness: 1,

    color:
      BLACK,
  });


  page.drawLine({
    start: {
      x: 54,
      y: 741,
    },

    end: {
      x:
        PAGE_WIDTH - 54,

      y: 741,
    },

    thickness: 0.5,

    color:
      BLACK,
  });
}


// ======================================================
// LABEL : VALUE
// ======================================================

function drawField(
  page: PDFPage,

  font: PDFFont,

  fontBold: PDFFont,

  label: string,

  value: string,

  y: number
) {
  page.drawText(
    cleanText(label),
    {
      x: 85,

      y,

      size: 10.5,

      font:
        fontBold,

      color:
        BLACK,
    }
  );


  page.drawText(
    ":",
    {
      x: 171,

      y,

      size: 10.5,

      font,

      color:
        BLACK,
    }
  );


  page.drawText(
    cleanText(value),
    {
      x: 180,

      y,

      size: 10.5,

      font,

      color:
        BLACK,
    }
  );
}


// ======================================================
// PARAGRAPH
// ======================================================

function drawParagraph(
  page: PDFPage,

  font: PDFFont,

  text: string,

  y: number,

  options?: {
    x?: number;

    maxWidth?: number;

    firstIndent?: number;

    size?: number;

    lineHeight?: number;
  }
) {
  const x =
    options?.x ??
    LEFT;


  const maxWidth =
    options?.maxWidth ??
    CONTENT_WIDTH;


  const firstIndent =
    options?.firstIndent ??
    0;


  const size =
    options?.size ??
    10.5;


  const lineHeight =
    options?.lineHeight ??
    15;


  const lines =
    wrapText(
      text,
      font,
      size,
      maxWidth -
        firstIndent
    );


  let currentY =
    y;


  lines.forEach(
    (
      line,
      index
    ) => {
      page.drawText(
        line,
        {
          x:
            index === 0
              ? x +
                firstIndent
              : x,

          y:
            currentY,

          size,

          font,

          color:
            BLACK,
        }
      );


      currentY -=
        lineHeight;
    }
  );


  return currentY;
}


// ======================================================
// RECIPIENT
// ======================================================

function drawRecipient(
  page: PDFPage,

  font: PDFFont,

  tujuan: string,

  startY: number
) {
  const lines =
    cleanText(tujuan)
      .split("\n")
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);


  let y =
    startY;


  if (
    lines.length === 0
  ) {
    lines.push(
      "Penerima Surat"
    );
  }


  const first =
    lines[0];


  if (
    first
      .toLowerCase()
      .startsWith("yth")
  ) {
    page.drawText(
      first,
      {
        x: 85,

        y,

        size: 10.5,

        font,
      }
    );
  } else {
    page.drawText(
      `Yth. ${first}`,
      {
        x: 85,

        y,

        size: 10.5,

        font,
      }
    );
  }


  y -= 15;


  for (
    let i = 1;
    i <
    lines.length;
    i++
  ) {
    page.drawText(
      lines[i],
      {
        x: 85,

        y,

        size: 10.5,

        font,
      }
    );


    y -= 15;
  }


  page.drawText(
    "Di Tempat",
    {
      x: 85,

      y,

      size: 10.5,

      font,
    }
  );


  return y - 30;
}


// ======================================================
// EVENT DETAIL
// ======================================================

function drawStructuredLine(
  page: PDFPage,

  font: PDFFont,

  label: string,

  value: string,

  y: number
) {
  page.drawText(
    cleanText(label),
    {
      x: 85,

      y,

      size: 10.5,

      font,
    }
  );


  page.drawText(
    ":",
    {
      x: 174,

      y,

      size: 10.5,

      font,
    }
  );


  page.drawText(
    cleanText(value),
    {
      x: 183,

      y,

      size: 10.5,

      font,
    }
  );


  return y - 15;
}


// ======================================================
// BODY
// ======================================================

function drawBody(
  page: PDFPage,

  font: PDFFont,

  isiSurat: string,

  startY: number
) {
  let y =
    startY;


  const paragraphs =
    cleanText(
      isiSurat
    ).split("\n");


  for (
    const raw
    of paragraphs
  ) {
    const text =
      raw.trim();


    if (!text) {
      y -= 10;

      continue;
    }


    const structured =
      text.match(
        /^(Hari\/Tanggal|Waktu|Tempat)\s*:\s*(.*)$/i
      );


    if (
      structured
    ) {
      y =
        drawStructuredLine(
          page,

          font,

          structured[1],

          structured[2],

          y
        );


      continue;
    }


    y =
      drawParagraph(
        page,

        font,

        text,

        y,

        {
          x: 85,

          maxWidth:
            PAGE_WIDTH -
            85 -
            RIGHT,

          firstIndent: 46,

          size: 10.5,

          lineHeight: 15,
        }
      );


    y -= 4;
  }


  return y;
}


// ======================================================
// UNDERLINED NAME
// ======================================================

function drawUnderlinedName(
  page: PDFPage,

  fontBold: PDFFont,

  name: string,

  x: number,

  y: number
) {
  const safe =
    cleanText(name);


  page.drawText(
    safe,
    {
      x,

      y,

      size: 10,

      font:
        fontBold,

      color:
        BLACK,
    }
  );


  const width =
    fontBold.widthOfTextAtSize(
      safe,
      10
    );


  page.drawLine({
    start: {
      x,

      y:
        y - 1.5,
    },

    end: {
      x:
        x +
        width,

      y:
        y - 1.5,
    },

    thickness: 0.5,

    color:
      BLACK,
  });
}


// ======================================================
// SIGNATURE
// ======================================================

function drawSignatures(
  page: PDFPage,

  font: PDFFont,

  fontBold: PDFFont,

  tanggalSurat: Date,

  y: number
) {
  const leftX =
    90;


  const rightX =
    350;


  // TANGGAL KANAN

  page.drawText(
    `${KATI.kota}, ${formatTanggal(
      tanggalSurat
    )}`,
    {
      x:
        rightX,

      y:
        y + 27,

      size: 10.5,

      font,
    }
  );


  // SEKRETARIS

  page.drawText(
    KATI.sekretaris
      .jabatan,
    {
      x:
        leftX,

      y,

      size: 10.5,

      font,
    }
  );


  page.drawText(
    KATI.sekretaris
      .organisasi,
    {
      x:
        leftX,

      y:
        y - 15,

      size: 9.5,

      font,
    }
  );


  // DIREKTUR

  page.drawText(
    KATI.direktur
      .jabatan,
    {
      x:
        rightX,

      y,

      size: 10.5,

      font,
    }
  );


  page.drawText(
    KATI.direktur
      .organisasi,
    {
      x:
        rightX,

      y:
        y - 15,

      size: 9.5,

      font,
    }
  );


  // NAMA SEKRETARIS

  drawUnderlinedName(
    page,

    fontBold,

    KATI.sekretaris
      .nama,

    leftX,

    y - 91
  );


  // NAMA DIREKTUR

  drawUnderlinedName(
    page,

    fontBold,

    KATI.direktur
      .nama,

    rightX,

    y - 91
  );
}


// ======================================================
// GET PDF
// ======================================================

// ======================================================
// GET PDF
// ======================================================

export async function GET(
  request: Request,
  context: RouteContext
) {
  // ====================================================
  // SESSION
  // ====================================================

  const session =
    await getSession();


  if (!session) {
    return new Response(
      "Unauthorized",
      {
        status: 401,
      }
    );
  }


  // ====================================================
  // PARAMS
  // ====================================================

  const { id } =
    await context.params;


  if (!id) {
    return new Response(
      "ID surat tidak ditemukan.",
      {
        status: 400,
      }
    );
  }


  // ====================================================
  // AMBIL SURAT
  // ====================================================

  const surat =
    await prisma.suratKeluar.findUnique({
      where: {
        id,
      },

      include: {
        pengajuan: {
          include: {
            user: true,
          },
        },
      },
    });


  if (!surat) {
    return new Response(
      "Surat tidak ditemukan.",
      {
        status: 404,
      }
    );
  }


  // ====================================================
  // ACCESS CONTROL PDF
  // ====================================================
  //
  // SUPERADMIN / ADMIN_SEKRETARIS:
  // boleh melihat PDF selama proses.
  //
  // PENGURUS / ANGGOTA:
  // hanya boleh melihat surat miliknya sendiri
  // dan surat harus sudah SELESAI.
  //
  // ====================================================

  const sessionId =
    String(
      session.id ?? ""
    );


  const sessionRole =
    String(
      session.role ?? ""
    );


  const isSekretaris =
    sessionRole === "SUPERADMIN" ||
    sessionRole === "ADMIN_SEKRETARIS";


  const isPemilikSurat =
    Boolean(
      surat.pengajuan &&
      surat.pengajuan.userId ===
        sessionId
    );


  const pemilikBolehAkses =
    isPemilikSurat &&
    surat.status === "SELESAI";


  if (
    !isSekretaris &&
    !pemilikBolehAkses
  ) {
    return new Response(
      "Forbidden",
      {
        status: 403,
      }
    );
  }


  // ====================================================
  // MODE DOWNLOAD
  // ====================================================
  //
  // /pdf
  // → tampilkan di browser
  //
  // /pdf?download=1
  // → download file
  //
  // ====================================================

  const url =
    new URL(
      request.url
    );


  const download =
    url.searchParams.get(
      "download"
    ) === "1";


  // ====================================================
  // PDF SETUP
  // ====================================================

  const pdf =
    await PDFDocument.create();


  const font =
    await pdf.embedFont(
      StandardFonts.TimesRoman
    );


  const fontBold =
    await pdf.embedFont(
      StandardFonts.TimesRomanBold
    );


  const fontItalic =
    await pdf.embedFont(
      StandardFonts.TimesRomanItalic
    );


  const page =
    pdf.addPage([
      PAGE_WIDTH,
      PAGE_HEIGHT,
    ]);


  // ====================================================
  // KOP
  // ====================================================

  await drawHeader(
    pdf,
    page,
    font,
    fontBold,
    fontItalic
  );


  // ====================================================
  // TANGGAL ATAS
  // ====================================================

  page.drawText(
    `${KATI.kota}, ${formatTanggal(
      surat.tanggalSurat
    )}`,
    {
      x: 398,

      y: 712,

      size: 10.5,

      font,

      color:
        BLACK,
    }
  );


  // ====================================================
  // NOMOR / PERIHAL / LAMPIRAN
  // ====================================================

  drawField(
    page,
    font,
    fontBold,
    "No.",
    surat.nomorSurat,
    692
  );


  drawField(
    page,
    font,
    fontBold,
    "Perihal",
    surat.perihal.toUpperCase(),
    676
  );


  drawField(
    page,
    font,
    fontBold,
    "Lampiran",
    "-",
    660
  );


  // ====================================================
  // TUJUAN
  // ====================================================

  let y =
    drawRecipient(
      page,
      font,
      surat.tujuan,
      626
    );


  // ====================================================
  // SALAM
  // ====================================================

  page.drawText(
    "Dengan Hormat,",
    {
      x: 85,

      y,

      size: 10.5,

      font,
    }
  );


  y -= 31;


  // ====================================================
  // ISI SURAT
  // ====================================================

  y =
    drawBody(
      page,
      font,
      surat.isiSurat,
      y
    );


  // ====================================================
  // PENUTUP
  // ====================================================

  y -= 25;


  const closing =
    "Demikian surat ini disampaikan. Atas perhatian dan kerja samanya, kami mengucapkan terimakasih.";


  y =
    drawParagraph(
      page,
      font,
      closing,
      y,
      {
        x: 85,

        maxWidth:
          PAGE_WIDTH -
          85 -
          RIGHT,

        size: 10.5,

        lineHeight: 15,
      }
    );


  // ====================================================
  // TANDA TANGAN
  // ====================================================

  const signatureY =
    Math.min(
      y - 42,
      245
    );


  drawSignatures(
    page,
    font,
    fontBold,
    surat.tanggalSurat,
    signatureY
  );


  // ====================================================
  // METADATA
  // ====================================================

  pdf.setTitle(
    surat.nomorSurat
  );


  pdf.setSubject(
    surat.perihal
  );


  pdf.setAuthor(
    "Kampus Alam Tegalsari Indonesia"
  );


  pdf.setCreator(
    "KAMOO"
  );


  pdf.setProducer(
    "KAMOO"
  );


  // ====================================================
  // SAVE
  // ====================================================

  const bytes =
    await pdf.save();


  const filename =
    safeFileName(
      surat.nomorSurat
    );


  // ====================================================
  // RESPONSE
  // ====================================================

  return new Response(
    Buffer.from(
      bytes
    ),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/pdf",

        /*
         * inline
         * = buka di browser
         *
         * attachment
         * = langsung download
         */
        "Content-Disposition":
          `${download ? "attachment" : "inline"}; filename="${filename}.pdf"`,

        "Cache-Control":
          "private, no-store",
      },
    }
  );
}