const KUNCI_REKOR = "kartu-memori-rekor-langkah";
const JEDA_TUTUP = 900;

const PASANGAN = [
    {
        id: "matahari",
        nama: "Matahari",
        warna: "#e09a1a",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="11" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"/></g></svg>'
    },
    {
        id: "bulan",
        nama: "Bulan",
        warna: "#5c6fad",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M38 8a24 24 0 1 0 16 40 18 18 0 1 1-16-40z"/></svg>'
    },
    {
        id: "bintang",
        nama: "Bintang",
        warna: "#d4a017",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 6l7.4 16.8L57 25.4 43 37.2l4.2 17.6L32 45.4 16.8 54.8 21 37.2 7 25.4l17.6-2.6z"/></svg>'
    },
    {
        id: "daun",
        nama: "Daun",
        warna: "#2f8f5b",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M12 36C14 18 28 8 54 8 52 30 40 48 22 50 18 58 10 60 10 60s4-10 2-24z"/></svg>'
    },
    {
        id: "ombak",
        nama: "Ombak",
        warna: "#1f8a96",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><path d="M6 26c6 0 6-8 12-8s6 8 12 8 6-8 12-8 6 8 12 8"/><path d="M6 42c6 0 6-8 12-8s6 8 12 8 6-8 12-8 6 8 12 8"/></svg>'
    },
    {
        id: "gunung",
        nama: "Gunung",
        warna: "#8c5a3c",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M4 52 24 16l12 20 8-12 16 28z"/></svg>'
    },
    {
        id: "bunga",
        nama: "Bunga",
        warna: "#d4537e",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="16" r="9" fill="currentColor"/><circle cx="48" cy="32" r="9" fill="currentColor"/><circle cx="32" cy="48" r="9" fill="currentColor"/><circle cx="16" cy="32" r="9" fill="currentColor"/><circle cx="32" cy="32" r="6" fill="#f4efe4"/></svg>'
    },
    {
        id: "ikan",
        nama: "Ikan",
        warna: "#3d7ea6",
        svg: '<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M6 32c12-14 26-16 40-8l12-10v14c0 2-6 4-10 6 4 2 10 4 10 6v14L46 44C32 50 18 46 6 32z"/><circle cx="42" cy="30" r="2.2" fill="#f4efe4"/></svg>'
    }
];

const papan = document.getElementById("papan");
const tampilanLangkah = document.getElementById("langkah");
const tampilanWaktu = document.getElementById("waktu");
const tampilanRekor = document.getElementById("rekor");
const selimut = document.getElementById("selimut");
const catatanMenang = document.getElementById("catatan-menang");
const langkahMenang = document.getElementById("langkah-menang");
const waktuMenang = document.getElementById("waktu-menang");
const tombolMenang = document.getElementById("main-lagi-menang");

let langkah = 0;
let jumlahCocok = 0;
let terkunci = false;
let kartuTerbuka = [];
let jedaTutup = null;
let idWaktu = null;
let awalWaktu = 0;
let rekor = bacaRekor();

document.getElementById("main-lagi").addEventListener("click", aturPermainan);
tombolMenang.addEventListener("click", aturPermainan);

tampilkanRekor();
aturPermainan();

function aturPermainan() {
    if (jedaTutup !== null) {
        clearTimeout(jedaTutup);
        jedaTutup = null;
    }
    hentikanWaktu();

    langkah = 0;
    jumlahCocok = 0;
    terkunci = false;
    kartuTerbuka = [];
    awalWaktu = 0;

    tampilanLangkah.textContent = "0";
    tampilanWaktu.textContent = "00:00";
    selimut.hidden = true;
    papan.removeAttribute("aria-busy");

    const dek = acak(buatDek());
    papan.replaceChildren();

    dek.forEach(function (kartu) {
        papan.appendChild(buatTombolKartu(kartu));
    });
}

function buatDek() {
    const dek = [];
    PASANGAN.forEach(function (pasangan) {
        dek.push(pasangan, pasangan);
    });
    return dek;
}

function buatTombolKartu(kartu) {
    const tombol = document.createElement("button");
    tombol.type = "button";
    tombol.className = "kartu";
    tombol.dataset.simbol = kartu.id;
    tombol.setAttribute("aria-label", "Kartu tertutup");
    tombol.innerHTML =
        '<span class="kartu-dalam">' +
            '<span class="sisi belakang" aria-hidden="true"></span>' +
            '<span class="sisi depan" aria-hidden="true">' +
                '<span class="ikon" style="color:' + kartu.warna + '">' + kartu.svg + "</span>" +
            "</span>" +
        "</span>";
    tombol.addEventListener("click", function () {
        bukaKartu(tombol, kartu.nama);
    });
    return tombol;
}

function bukaKartu(tombol, nama) {
    if (terkunci || selimut.hidden === false) {
        return;
    }
    if (tombol.classList.contains("terbuka") || tombol.classList.contains("cocok")) {
        return;
    }

    tombol.classList.add("terbuka");
    tombol.setAttribute("aria-label", nama);
    kartuTerbuka.push(tombol);

    if (awalWaktu === 0) {
        mulaiWaktu();
    }

    if (kartuTerbuka.length < 2) {
        return;
    }

    terkunci = true;
    papan.setAttribute("aria-busy", "true");
    langkah += 1;
    tampilanLangkah.textContent = String(langkah);

    const pertama = kartuTerbuka[0];
    const kedua = kartuTerbuka[1];

    if (pertama.dataset.simbol === kedua.dataset.simbol) {
        pertama.classList.add("cocok");
        kedua.classList.add("cocok");
        kartuTerbuka = [];
        jumlahCocok += 1;
        terkunci = false;
        papan.removeAttribute("aria-busy");
        if (jumlahCocok === PASANGAN.length) {
            menang();
        }
        return;
    }

    jedaTutup = setTimeout(function () {
        pertama.classList.remove("terbuka");
        kedua.classList.remove("terbuka");
        pertama.setAttribute("aria-label", "Kartu tertutup");
        kedua.setAttribute("aria-label", "Kartu tertutup");
        kartuTerbuka = [];
        terkunci = false;
        jedaTutup = null;
        papan.removeAttribute("aria-busy");
    }, JEDA_TUTUP);
}

function menang() {
    terkunci = true;
    const detik = hentikanWaktu();
    const rekorBaru = rekor === null || langkah < rekor;

    if (rekorBaru) {
        rekor = langkah;
        simpanRekor(langkah);
        tampilkanRekor();
        catatanMenang.textContent = "Ini rekor langkah terbaikmu.";
    } else {
        catatanMenang.textContent = "Rekor langkah terbaikmu: " + rekor + ".";
    }

    langkahMenang.textContent = String(langkah);
    waktuMenang.textContent = formatWaktu(detik);
    selimut.hidden = false;
    tombolMenang.focus();
}

function mulaiWaktu() {
    awalWaktu = Date.now();
    idWaktu = setInterval(function () {
        tampilanWaktu.textContent = formatWaktu(detikBerjalan());
    }, 250);
}

function hentikanWaktu() {
    const detik = awalWaktu === 0 ? 0 : detikBerjalan();
    if (idWaktu !== null) {
        clearInterval(idWaktu);
        idWaktu = null;
    }
    tampilanWaktu.textContent = formatWaktu(detik);
    return detik;
}

function detikBerjalan() {
    return Math.floor((Date.now() - awalWaktu) / 1000);
}

function formatWaktu(totalDetik) {
    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;
    return String(menit).padStart(2, "0") + ":" + String(detik).padStart(2, "0");
}

function bacaRekor() {
    try {
        const nilai = localStorage.getItem(KUNCI_REKOR);
        if (nilai === null) {
            return null;
        }
        const angka = Number(nilai);
        if (!Number.isInteger(angka) || angka < 1) {
            return null;
        }
        return angka;
    } catch (kesalahan) {
        return null;
    }
}

function simpanRekor(nilai) {
    try {
        localStorage.setItem(KUNCI_REKOR, String(nilai));
    } catch (kesalahan) {
        return;
    }
}

function tampilkanRekor() {
    if (rekor === null) {
        tampilanRekor.textContent = "—";
        tampilanRekor.setAttribute("aria-label", "Belum ada rekor");
        return;
    }
    tampilanRekor.textContent = String(rekor);
    tampilanRekor.setAttribute("aria-label", rekor + " langkah");
}

function acak(daftar) {
    const hasil = daftar.slice();
    for (let i = hasil.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const sementara = hasil[i];
        hasil[i] = hasil[j];
        hasil[j] = sementara;
    }
    return hasil;
}
