export const defaultSchedule: Array<[string, string, string]> = [
    ["Pendaftaran online", "2 Feb - 28 Feb", "3 Mar - 30 Apr"],
    ["Verifikasi berkas", "1 Mar - 5 Mar", "1 Mei - 5 Mei"],
    ["Pengumuman kelulusan", "10 Mar", "10 Mei"],
    ["Daftar ulang & seragam", "11 - 15 Mar", "11 - 15 Mei"],
];

export const majors = [
    { code: "RPL", name: "Teknik Komputer", description: "Membangun aplikasi, website, dan solusi digital untuk kebutuhan industri.", careers: ["Web developer", "Software tester", "UI/UX designer"], facilities: ["Lab komputer", "Internet fiber", "Ruang proyek digital"] },
    { code: "TBSM", name: "Teknik Otomotif", description: "Menguasai perawatan mesin, kelistrikan, dan diagnosis sepeda motor modern.", careers: ["Mekanik sepeda motor", "Service advisor", "Teknisi kelistrikan"], facilities: ["Bengkel praktik", "Unit sepeda motor", "Peralatan diagnosis"] },
];

export const gallery = [
    ["Praktik coding", "Siswa mengembangkan ide digital di laboratorium komputer.", "/coding.jpg"],
    ["Ruang belajar", "Lingkungan belajar yang mendukung kolaborasi dan eksperimen.", "/coding.jpg"],
    ["Proyek siswa", "Karya praktik menjadi bekal untuk menghadapi dunia industri.", "/coding.jpg"],
];

export type MediaItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
};

export const defaultAchievements: MediaItem[] = [
    {
        id: "ach-1",
        title: "Juara 2 Bahasa Indonesia tingkat nasional",
        description: "Prestasi siswa dalam kompetisi Bahasa Indonesia.",
        imageUrl: "/juara2bindo.jpeg",
    },
    {
        id: "ach-2",
        title: "Juara 2 Sains tingkat nasional",
        description: "Prestasi siswa dalam kompetisi sains.",
        imageUrl: "/juara2sains.jpeg",
    },
    {
        id: "ach-3",
        title: "Juara 3 Bahasa Indonesia tingkat nasional",
        description: "Prestasi siswa dalam kompetisi Bahasa Indonesia.",
        imageUrl: "/juara3bindo.jpeg",
    },
    {
        id: "ach-4",
        title: "Gema Pramuka",
        description: "Prestasi siswa dalam kegiatan Gema Pramuka.",
        imageUrl: "/gema.jpeg",
    },
];

export const defaultActivities: MediaItem[] = [
    {
        id: "act-1",
        title: "Kumpul Pagi",
        description: "Kegiatan apel pagi untuk membangun kedisiplinan dan semangat siswa.",
        imageUrl: "/kumpul_pagi.jpeg",
    },
    {
        id: "act-2",
        title: "Kegiatan Literasi",
        description: "Membiasakan siswa membaca untuk memperluas wawasan dan pengetahuan.",
        imageUrl: "/literasi.jpeg",
    },
    {
        id: "act-3",
        title: "Pembelajaran di Kelas",
        description: "Suasana belajar yang interaktif dan nyaman di ruang kelas.",
        imageUrl: "/pembelajaran.jpeg",
    },
    {
        id: "act-4",
        title: "Kegiatan Pembelajaran OOP",
        description: "Siswa belajar kerja secara tim dan mengembangkan suatu software.",
        imageUrl: "/kegiatan1.jpeg",
    },
    {
        id: "act-5",
        title: "Praktik Jurusan RPL",
        description: "Praktik langsung di lab komputer untuk jurusan Rekayasa Perangkat Lunak.",
        imageUrl: "/praktek_rpl.jpeg",
    },
    {
        id: "act-6",
        title: "Praktik Jurusan TBSM",
        description: "Pembelajaran membongkar dan merakit mesin sepeda motor secara profesional.",
        imageUrl: "/praktek_tbsm.jpeg",
    },
    {
        id: "act-7",
        title: "Praktik Perbengkelan",
        description: "Mengasah keterampilan mekanik untuk siap terjun ke dunia kerja.",
        imageUrl: "/praktek_tbsm2.jpeg",
    },
];
