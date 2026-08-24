import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";


async function updateStatus(formData: FormData) {

  "use server";


  const session = await getSession();


  if (!session) {
    redirect("/login");
  }


  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const catatan = String(formData.get("catatan") || "");




  await prisma.pengajuanSurat.update({

    where: {
      id
    },

    data: {
      status: status as any
    }

  });





  await prisma.approval.create({

    data: {

      modul: "PENGAJUAN_SURAT",

      dataId: id,

      status:
        status === "DISETUJUI"
          ? "DISETUJUI"
          : "DITOLAK",

      catatan,

      userId: String(session.id)

    }

  });





  await prisma.auditLog.create({

    data: {

      userId: String(session.id),

      aktivitas:
        `${status} pengajuan surat ${id}`

    }

  });





  revalidatePath("/surat");

  revalidatePath(`/surat/${id}`);

}






function StatusBadge({
  status
}:{
  status:string
}){


  const colors:any = {

    DIAJUKAN:
      "bg-yellow-500/20 text-yellow-400",

    DIPROSES:
      "bg-blue-500/20 text-blue-400",

    DISETUJUI:
      "bg-green-500/20 text-green-400",

    DITOLAK:
      "bg-red-500/20 text-red-400",

    SELESAI:
      "bg-purple-500/20 text-purple-400"

  };



  return (

    <span
      className={`
      px-3
      py-1
      rounded-full
      ${colors[status] || colors.DIAJUKAN}
      `}
    >

      {status}

    </span>

  );

}








export default async function DetailSurat({

  params

}: {

  params: Promise<{
    id:string
  }>

}) {


  const { id } = await params;



  const session = await getSession();


  if (!session) {

    redirect("/login");

  }






  const surat = await prisma.pengajuanSurat.findUnique({

    where: {
      id
    },

    include: {
      user:true
    }

  });






  if (!surat) {

    notFound();

  }







  const approval = await prisma.approval.findMany({

    where: {
      dataId:id
    },

    include:{
      user:true
    },

    orderBy:{
      createdAt:"desc"
    }

  });








  return (

    <div className="p-8">



      <div className="
      flex
      justify-between
      items-center
      mb-8
      ">


        <div>

          <h1 className="
          text-3xl
          font-bold
          ">
            Detail Pengajuan Surat
          </h1>


          <p className="
          text-gray-400
          mt-2
          ">
            Informasi lengkap dan riwayat approval
          </p>


        </div>



        <Link

          href="/surat"

          className="
          bg-slate-800
          px-5
          py-3
          rounded-lg
          "

        >

          ← Kembali

        </Link>


      </div>






      <div className="
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      p-8
      space-y-6
      ">




        <div>

          <p className="text-gray-400">
            Pemohon
          </p>

          <p className="font-semibold">
            {surat.user.nama}
          </p>

          <p className="text-sm text-gray-500">
            {surat.user.email}
          </p>

        </div>





        <div>

          <p className="text-gray-400">
            Role
          </p>

          <p>
            {surat.user.role}
          </p>

        </div>





        <div>

          <p className="text-gray-400">
            Jenis Surat
          </p>

          <p>
            {surat.jenis}
          </p>

        </div>





        <div>

          <p className="text-gray-400">
            Tujuan
          </p>

          <p>
            {surat.tujuan}
          </p>

        </div>





        <div>

          <p className="text-gray-400">
            Keperluan
          </p>

          <p>
            {surat.keperluan}
          </p>

        </div>





        <div>

          <p className="text-gray-400">
            Tanggal Pengajuan
          </p>

          <p>
            {surat.createdAt.toLocaleDateString("id-ID")}
          </p>

        </div>





        <div>

          <p className="text-gray-400 mb-2">
            Status
          </p>

          <StatusBadge status={surat.status}/>

        </div>







        {
          (
            session.role === "SUPERADMIN" ||
            session.role === "ADMIN_SEKRETARIS"
          )
          &&
          surat.status === "DIAJUKAN"
          &&
          (

            <div className="
            border-t
            border-slate-800
            pt-6
            flex
            gap-3
            ">


              <form action={updateStatus}>

                <input
                  type="hidden"
                  name="id"
                  value={surat.id}
                />

                <input
                  type="hidden"
                  name="status"
                  value="DISETUJUI"
                />

                <input
                  type="hidden"
                  name="catatan"
                  value="Disetujui"
                />


                <button
                  className="
                  bg-green-600
                  px-5
                  py-3
                  rounded-lg
                  font-semibold
                  "
                >

                  ✓ Setujui

                </button>


              </form>





              <form action={updateStatus}>


                <input
                  type="hidden"
                  name="id"
                  value={surat.id}
                />

                <input
                  type="hidden"
                  name="status"
                  value="DITOLAK"
                />

                <input
                  type="hidden"
                  name="catatan"
                  value="Ditolak"
                />


                <button
                  className="
                  bg-red-600
                  px-5
                  py-3
                  rounded-lg
                  font-semibold
                  "
                >

                  ✕ Tolak

                </button>


              </form>


            </div>

          )
        }



      </div>






      <div className="
      mt-8
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      p-8
      ">


        <h2 className="
        text-xl
        font-bold
        mb-5
        ">
          Riwayat Approval
        </h2>



        {
          approval.length === 0

          ?

          <p className="text-gray-400">
            Belum ada approval
          </p>


          :

          approval.map((item)=>(


            <div
              key={item.id}
              className="
              border-b
              border-slate-800
              py-4
              "
            >

              <p className="font-semibold">
                {item.status}
              </p>

              <p className="text-sm text-gray-400">
                Oleh: {item.user.nama}
              </p>

              <p>
                {item.catatan}
              </p>

              <p className="text-xs text-gray-500">
                {item.createdAt.toLocaleDateString("id-ID")}
              </p>


            </div>


          ))

        }


      </div>



    </div>

  );

}