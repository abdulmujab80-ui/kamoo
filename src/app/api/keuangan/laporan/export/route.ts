import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";


// ======================================================
// NAMA BULAN
// ======================================================

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];


// ======================================================
// FORMAT TANGGAL
// ======================================================

function formatTanggal(value: Date) {
  return value.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}


// ======================================================
// EXPORT EXCEL
// ======================================================

export async function GET(request: Request) {
  const session = await getSession();


  // ----------------------------------------------------
  // CEK LOGIN
  // ----------------------------------------------------

  if (!session) {
    return new NextResponse(
      "Unauthorized",
      {
        status: 401,
      }
    );
  }


  // ----------------------------------------------------
  // CEK ROLE
  // ----------------------------------------------------

  if (
    session.role !== "SUPERADMIN" &&
    session.role !== "ADMIN_BENDAHARA"
  ) {
    return new NextResponse(
      "Forbidden",
      {
        status: 403,
      }
    );
  }


  // ----------------------------------------------------
  // AMBIL QUERY
  // ----------------------------------------------------

  const url = new URL(
    request.url
  );


  const modeParam =
    url.searchParams.get(
      "mode"
    );


  const bulanParam =
    Number(
      url.searchParams.get(
        "bulan"
      )
    );


  const tahunParam =
    Number(
      url.searchParams.get(
        "tahun"
      )
    );


  const now = new Date();


  // ----------------------------------------------------
  // VALIDASI MODE
  // ----------------------------------------------------

  const mode =
    modeParam === "tahun"
      ? "tahun"
      : "bulan";


  // ----------------------------------------------------
  // VALIDASI BULAN
  // ----------------------------------------------------

  const bulan =
    Number.isInteger(
      bulanParam
    ) &&
    bulanParam >= 1 &&
    bulanParam <= 12
      ? bulanParam
      : now.getMonth() + 1;


  // ----------------------------------------------------
  // VALIDASI TAHUN
  // ----------------------------------------------------

  const tahun =
    Number.isInteger(
      tahunParam
    ) &&
    tahunParam >= 2000 &&
    tahunParam <= 2100
      ? tahunParam
      : now.getFullYear();


  // ----------------------------------------------------
  // TENTUKAN PERIODE
  // ----------------------------------------------------

  let awalPeriode: Date;
  let akhirPeriode: Date;
  let labelPeriode: string;


  if (
    mode === "tahun"
  ) {
    awalPeriode =
      new Date(
        tahun,
        0,
        1
      );


    akhirPeriode =
      new Date(
        tahun + 1,
        0,
        1
      );


    labelPeriode =
      `Tahun ${tahun}`;
  } else {
    awalPeriode =
      new Date(
        tahun,
        bulan - 1,
        1
      );


    akhirPeriode =
      new Date(
        tahun,
        bulan,
        1
      );


    labelPeriode =
      `${BULAN[bulan - 1]} ${tahun}`;
  }


  // ----------------------------------------------------
  // AMBIL TRANSAKSI
  // ----------------------------------------------------

  const transaksi =
    await prisma.keuangan.findMany({
      where: {
        tanggal: {
          gte: awalPeriode,
          lt: akhirPeriode,
        },
      },

      orderBy: [
        {
          tanggal: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });


  // ----------------------------------------------------
  // HITUNG PEMASUKAN
  // ----------------------------------------------------

  const pemasukan =
    transaksi
      .filter(
        (item) =>
          item.jenis ===
          "MASUK"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.jumlah,
        0
      );


  // ----------------------------------------------------
  // HITUNG PENGELUARAN
  // ----------------------------------------------------

  const pengeluaran =
    transaksi
      .filter(
        (item) =>
          item.jenis ===
          "KELUAR"
      )
      .reduce(
        (
          total,
          item
        ) =>
          total +
          item.jumlah,
        0
      );


  // ----------------------------------------------------
  // HASIL
  // ----------------------------------------------------

  const hasil =
    pemasukan -
    pengeluaran;


  // ====================================================
  // SHEET RINGKASAN
  // ====================================================

  const ringkasan = [
    {
      Informasi:
        "Periode",

      Nilai:
        labelPeriode,
    },

    {
      Informasi:
        "Total Pemasukan",

      Nilai:
        pemasukan,
    },

    {
      Informasi:
        "Total Pengeluaran",

      Nilai:
        pengeluaran,
    },

    {
      Informasi:
        hasil >= 0
          ? "Surplus Periode"
          : "Defisit Periode",

      Nilai:
        Math.abs(hasil),
    },

    {
      Informasi:
        "Jumlah Transaksi",

      Nilai:
        transaksi.length,
    },
  ];


  // ====================================================
  // SHEET TRANSAKSI
  // ====================================================

  const detailTransaksi =
    transaksi.map(
      (
        item,
        index
      ) => ({
        No:
          index + 1,

        Tanggal:
          formatTanggal(
            item.tanggal
          ),

        Jenis:
          item.jenis ===
          "MASUK"
            ? "Uang Masuk"
            : "Uang Keluar",

        Kategori:
          item.kategori,

        Keterangan:
          item.keterangan,

        Pihak:
          item.pihak ??
          "",

        Jumlah:
          item.jumlah,

        Bukti:
          item.buktiUrl ??
          "",
      })
    );


  // ====================================================
  // BUAT WORKBOOK
  // ====================================================

  const workbook =
    XLSX.utils.book_new();


  const sheetRingkasan =
    XLSX.utils.json_to_sheet(
      ringkasan
    );


  const sheetTransaksi =
    XLSX.utils.json_to_sheet(
      detailTransaksi
    );


  // ====================================================
  // ATUR LEBAR KOLOM
  // ====================================================

  sheetRingkasan[
    "!cols"
  ] = [
    {
      wch: 28,
    },

    {
      wch: 35,
    },
  ];


  sheetTransaksi[
    "!cols"
  ] = [
    {
      wch: 6,
    },

    {
      wch: 15,
    },

    {
      wch: 16,
    },

    {
      wch: 22,
    },

    {
      wch: 45,
    },

    {
      wch: 28,
    },

    {
      wch: 18,
    },

    {
      wch: 45,
    },
  ];


  // ====================================================
  // MASUKKAN SHEET
  // ====================================================

  XLSX.utils.book_append_sheet(
    workbook,
    sheetRingkasan,
    "Ringkasan"
  );


  XLSX.utils.book_append_sheet(
    workbook,
    sheetTransaksi,
    "Transaksi"
  );


  // ====================================================
  // GENERATE FILE
  // ====================================================

  const buffer =
    XLSX.write(
      workbook,
      {
        type: "buffer",
        bookType: "xlsx",
      }
    );


  // ====================================================
  // NAMA FILE
  // ====================================================

  const filename =
    mode === "tahun"
      ? `Laporan_Keuangan_${tahun}.xlsx`
      : `Laporan_Keuangan_${tahun}_${String(
          bulan
        ).padStart(
          2,
          "0"
        )}.xlsx`;


  // ====================================================
  // RESPONSE
  // ====================================================

  return new NextResponse(
    new Uint8Array(
      buffer
    ),
    {
      status: 200,

      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

        "Content-Disposition":
          `attachment; filename="${filename}"`,

        "Cache-Control":
          "no-store",
      },
    }
  );
}