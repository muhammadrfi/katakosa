import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, BookOpen, Repeat2, Lightbulb } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="container mx-auto py-12 px-6 text-center max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 leading-tight">
        Selamat Datang di KataLatih!
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-10">
        Platform cerdas untuk menguasai kosakata baru dengan mudah dan efektif.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <Card className="p-6 flex flex-col items-center text-center">
          <Brain className="h-12 w-12 text-blue-500 mb-4" />
          <CardTitle className="mb-2">Belajar Cerdas</CardTitle>
          <CardDescription>Manfaatkan sistem pengulangan berjarak (SRS) untuk menghafal kata lebih efisien.</CardDescription>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <BookOpen className="h-12 w-12 text-green-500 mb-4" />
          <CardTitle className="mb-2">Kosakata Terorganisir</CardTitle>
          <CardDescription>Kelola set kosakata Anda, impor dari Excel, dan lacak kemajuan.</CardDescription>
        </Card>
        <Card className="p-6 flex flex-col items-center text-center">
          <Repeat2 className="h-12 w-12 text-purple-500 mb-4" />
          <CardTitle className="mb-2">Mode Latihan Interaktif</CardTitle>
          <CardDescription>Pilih dari berbagai mode latihan seperti ruang menghafal, kuis, dan mendengarkan.</CardDescription>
        </Card>
      </div>

      <Card className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <CardHeader>
          <Lightbulb className="h-16 w-16 mx-auto mb-4" />
          <CardTitle className="text-3xl font-bold mb-2">Siap untuk Menguasai Kata?</CardTitle>
          <CardDescription className="text-white/80 text-lg">
            Mulai perjalanan belajar kosakata Anda hari ini dan rasakan perbedaannya!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tombol untuk navigasi ke dashboard atau daftar kata bisa ditambahkan di sini */}
        </CardContent>
      </Card>
    </div>
  );
};

export default HomePage;
