"use client";

import {
  Loader2,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
} from "lucide-react";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  bagikanLoker,
  hapusAksesLoker,
  ubahAksesLoker,
} from "../actions";


type Permission =
  | "VIEWER"
  | "EDITOR";


type UserOption = {
  id: string;
  nama: string;
  email: string;
};


type ShareItem = {
  id: string;
  userId: string;
  permission: Permission;

  user: UserOption;
};


type Props = {
  lokerId: string;
  users: UserOption[];
  shares: ShareItem[];
};


export default function LokerSharePanel({
  lokerId,
  users,
  shares,
}: Props) {
  const router =
    useRouter();


  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");


  const [
    permission,
    setPermission,
  ] = useState<Permission>(
    "VIEWER"
  );


  const [
    pendingKey,
    setPendingKey,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const availableUsers =
    useMemo(
      () => {
        const sharedIds =
          new Set(
            shares.map(
              (share) =>
                share.userId
            )
          );

        return users.filter(
          (user) =>
            !sharedIds.has(
              user.id
            )
        );
      },
      [
        shares,
        users,
      ]
    );


  async function handleShare(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (!selectedUserId) {
      setError(
        "Pilih pengguna terlebih dahulu."
      );

      return;
    }


    setPendingKey(
      "create"
    );

    setError("");


    try {
      await bagikanLoker(
        lokerId,
        selectedUserId,
        permission
      );


      setSelectedUserId(
        ""
      );

      setPermission(
        "VIEWER"
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membagikan Loker."
      );

    } finally {
      setPendingKey(
        ""
      );
    }
  }


  async function handlePermission(
    shareId: string,
    value: Permission
  ) {
    setPendingKey(
      shareId
    );

    setError("");


    try {
      await ubahAksesLoker(
        shareId,
        value
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengubah izin."
      );

    } finally {
      setPendingKey(
        ""
      );
    }
  }


  async function handleRemove(
    shareId: string
  ) {
    const confirmed =
      window.confirm(
        "Cabut akses pengguna dari Loker ini?"
      );


    if (!confirmed) {
      return;
    }


    setPendingKey(
      shareId
    );

    setError("");


    try {
      await hapusAksesLoker(
        shareId
      );

      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mencabut akses."
      );

    } finally {
      setPendingKey(
        ""
      );
    }
  }


  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-6
          lg:flex-row
          lg:items-start
          lg:justify-between
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-cyan-50
              text-cyan-600
            "
          >
            <ShieldCheck
              size={20}
            />
          </div>

          <div>
            <h2
              className="
                text-base
                font-bold
                text-slate-900
                sm:text-lg
              "
            >
              Akses Loker
            </h2>

            <p
              className="
                mt-1
                max-w-xl
                text-xs
                leading-5
                text-slate-500
                sm:text-sm
              "
            >
              VIEWER hanya dapat melihat dan
              membuka file. EDITOR dapat membuat,
              upload, rename, dan menghapus isi Loker.
            </p>
          </div>
        </div>
      </div>


      <form
        onSubmit={
          handleShare
        }
        className="
          grid
          grid-cols-1
          gap-3
          border-b
          border-slate-100
          bg-slate-50/60
          p-5
          sm:p-6
          lg:grid-cols-[minmax(0,1fr)_180px_auto]
          lg:items-end
        "
      >
        <div>
          <label
            htmlFor="share-user"
            className="
              mb-2
              block
              text-xs
              font-bold
              text-slate-600
            "
          >
            Pengguna
          </label>

          <select
            id="share-user"
            value={
              selectedUserId
            }
            onChange={(event) => {
              setSelectedUserId(
                event.target.value
              );
            }}
            disabled={
              pendingKey !==
                "" ||
              availableUsers.length ===
                0
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              text-slate-800
              outline-none
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-50
              disabled:opacity-60
            "
          >
            <option value="">
              {availableUsers.length ===
              0
                ? "Semua pengguna sudah diberi akses"
                : "Pilih pengguna"}
            </option>

            {availableUsers.map(
              (user) => (
                <option
                  key={
                    user.id
                  }
                  value={
                    user.id
                  }
                >
                  {user.nama} —{" "}
                  {user.email}
                </option>
              )
            )}
          </select>
        </div>


        <div>
          <label
            htmlFor="share-permission"
            className="
              mb-2
              block
              text-xs
              font-bold
              text-slate-600
            "
          >
            Izin
          </label>

          <select
            id="share-permission"
            value={
              permission
            }
            onChange={(event) => {
              setPermission(
                event.target
                  .value as Permission
              );
            }}
            disabled={
              pendingKey !==
              ""
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-800
              outline-none
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-50
              disabled:opacity-60
            "
          >
            <option value="VIEWER">
              VIEWER
            </option>

            <option value="EDITOR">
              EDITOR
            </option>
          </select>
        </div>


        <button
          type="submit"
          disabled={
            pendingKey !==
              "" ||
            !selectedUserId
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-cyan-600
            px-5
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-cyan-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {pendingKey ===
          "create" ? (
            <Loader2
              size={17}
              className="
                animate-spin
              "
            />
          ) : (
            <UserRoundPlus
              size={17}
            />
          )}

          Bagikan
        </button>
      </form>


      {error && (
        <div
          className="
            border-b
            border-rose-100
            bg-rose-50
            px-5
            py-3
            text-xs
            text-rose-700
            sm:px-6
          "
        >
          {error}
        </div>
      )}


      {shares.length ===
      0 ? (
        <div
          className="
            px-5
            py-8
            text-center
            text-sm
            text-slate-500
            sm:px-6
          "
        >
          Belum ada pengguna lain
          yang memiliki akses.
        </div>
      ) : (
        <div
          className="
            divide-y
            divide-slate-100
          "
        >
          {shares.map(
            (share) => (
              <div
                key={
                  share.id
                }
                className="
                  flex
                  flex-col
                  gap-3
                  px-5
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  sm:px-6
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    {
                      share.user.nama
                    }
                  </p>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >
                    {
                      share.user.email
                    }
                  </p>
                </div>


                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <select
                    value={
                      share.permission
                    }
                    disabled={
                      pendingKey !==
                      ""
                    }
                    onChange={(event) => {
                      void handlePermission(
                        share.id,
                        event.target
                          .value as Permission
                      );
                    }}
                    className="
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-slate-700
                      outline-none
                      focus:border-cyan-400
                      disabled:opacity-60
                    "
                  >
                    <option value="VIEWER">
                      VIEWER
                    </option>

                    <option value="EDITOR">
                      EDITOR
                    </option>
                  </select>


                  <button
                    type="button"
                    disabled={
                      pendingKey !==
                      ""
                    }
                    onClick={() => {
                      void handleRemove(
                        share.id
                      );
                    }}
                    aria-label={
                      `Cabut akses ${share.user.nama}`
                    }
                    title="Cabut akses"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-500
                      transition
                      hover:border-rose-200
                      hover:bg-rose-50
                      hover:text-rose-600
                      disabled:opacity-50
                    "
                  >
                    {pendingKey ===
                    share.id ? (
                      <Loader2
                        size={15}
                        className="
                          animate-spin
                        "
                      />
                    ) : (
                      <Trash2
                        size={15}
                      />
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
