import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Mail, User, GraduationCap, BookOpen, Users, ExternalLink } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Header />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Τίτλος Σελίδας */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
              Ταυτότητα Έργου
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Πληροφορίες για το ακαδημαϊκό πλαίσιο, τη Μεταπτυχιακή Διατριβή και την ομάδα ανάπτυξης του Mytilene Noise Analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. ΣΤΟΙΧΕΙΑ ΔΗΜΙΟΥΡΓΟΥ (Αριστερή Στήλη) */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-6 text-cyan-700">
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Δημιουργός</h2>
                </div>
                
                <div className="space-y-6 flex-grow">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Παναγιώτης Πασινιός</h3>
                    <p className="text-cyan-600 font-medium mt-1">Μεταπτυχιακός Φοιτητής</p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100 mt-auto">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-3 font-semibold">Επικοινωνια</p>
                    <a 
                      href="mailto:panagiotispasinios@gmail.com" 
                      className="flex items-center gap-3 text-gray-700 hover:text-cyan-600 transition-colors bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-cyan-300 group shadow-sm"
                    >
                      <Mail size={20} className="text-gray-400 group-hover:text-cyan-500"/>
                      <span className="font-medium text-sm break-all">panagiotispasinios@gmail.com</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ΠΛΑΙΣΙΟ ΔΙΑΤΡΙΒΗΣ & ΠΜΣ (Δεξιά Στήλη - Πιο φαρδιά) */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-full relative overflow-hidden">
                {/* Διακοσμητικό εικονίδιο φόντου */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <BookOpen size={180} />
                </div>
                
                <div className="flex items-center gap-3 mb-6 text-cyan-700 relative z-10">
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <GraduationCap size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Ακαδημαϊκό Πλαίσιο</h2>
                </div>

                <div className="space-y-8 relative z-10">
                  
                  {/* Πληροφορίες ΠΜΣ */}
                  <div className="bg-cyan-50/50 p-5 rounded-xl border border-cyan-100">
                    <p className="text-gray-700 mb-2 leading-relaxed">
                      Στο <span className="font-semibold">Τμήμα Γεωγραφίας</span> του <span className="font-semibold">Πανεπιστημίου Αιγαίου</span> λειτουργεί το Πρόγραμμα Μεταπτυχιακών Σπουδών (Π.Μ.Σ.) με τίτλο:
                    </p>
                    <a 
                      href="https://geography.aegean.gr/geoinformatics/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-lg md:text-xl font-bold text-cyan-700 hover:text-cyan-900 transition-colors inline-flex items-center gap-2 group"
                    >
                      «Γεωγραφία και Εφαρμοσμένη Γεωπληροφορική»
                      <ExternalLink size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>

                  {/* Τίτλος Διατριβής */}
                  <div className="pl-4 border-l-4 border-cyan-500">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-relaxed italic mb-4">
                      "Ανάπτυξη εφαρμογής WebGIS για την χαρτογράφηση και ανάλυση περιβαλλοντικού θορύβου στην πόλη της Μυτιλήνης"
                    </h3>
                    <div className="prose prose-cyan text-gray-600 leading-relaxed text-sm">
                      <p className="mb-2">
                        Η παρούσα διαδικτυακή εφαρμογή αναπτύχθηκε στο πλαίσιο της μεταπτυχιακής διατριβής με στόχο την οπτικοποίηση, 
                        ανάλυση και διαχείριση χωρικών δεδομένων θορύβου.
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Ανάπτυξη εφαρμογής για τη καταγραφή του περιβαλλοντικού θορύβου.</li>
                        <li>Απεικόνιση επιπέδων θορύβου σε διαδραστικούς χάρτες.</li>
                        <li>Εξαγωγή στατιστικών συμπερασμάτων για το ακουστικό περιβάλλον.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* 3. ΕΥΧΑΡΙΣΤΙΕΣ (Κάτω μέρος) */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-900 rounded-3xl shadow-xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Διακοσμητικά στοιχεία φόντου */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
            
            <div className="relative z-10 text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full mb-4 border border-white/10 backdrop-blur-sm">
                <span className="font-semibold text-xs tracking-wide uppercase text-gray-200">Ευχαριστιες</span>
              </div>
              <h2 className="text-3xl font-bold">Συντελεστές και Επίβλεψη</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 max-w-5xl mx-auto relative z-10">
              
              {/* Επιβλέποντες Καθηγητές */}
              <div className="text-center md:text-right md:border-r border-white/10 md:pr-10">
                <h3 className="text-cyan-300 font-bold text-lg mb-6 flex items-center justify-center md:justify-end gap-2 uppercase tracking-wider">
                  <GraduationCap size={20} /> Επιβλεποντες Καθηγητες
                </h3>
                <ul className="space-y-6">
                  <li className="group">
                    <p className="text-xl font-semibold group-hover:text-cyan-200 transition-colors">Βαΐτης Μιχαήλ</p>
                    <p className="text-gray-400 text-sm mt-1">Καθηγητής / Γεωπληροφορική και Βάσεις Γεωγραφικών Δεδομένων</p>
                  </li>
                  <li className="group">
                    <p className="text-xl font-semibold group-hover:text-cyan-200 transition-colors">Κοψαχείλης Βασίλειος</p>
                    <p className="text-gray-400 text-sm mt-1">PhD Γεωπληροφορικής, Πανεπιστήμιο Αιγαίου</p>
                  </li>
                </ul>
              </div>

              {/* Ομάδα Καταγραφής */}
              <div className="text-center md:text-left md:pl-4">
                <h3 className="text-cyan-300 font-bold text-lg mb-6 flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider">
                  <Users size={20} /> Ομαδα Καταγραφης
                </h3>
                <p className="text-gray-300 text-sm mb-6 italic leading-relaxed max-w-md mx-auto md:mx-0">
                  Θερμές ευχαριστίες για την πολύτιμη και καθοριστική συμβολή τους στη συλλογή των μετρήσεων πεδίου:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg font-medium">
                  <li className="flex items-center justify-center md:justify-start gap-2 text-gray-200 hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Όνομα Συνεργάτη 1
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-gray-200 hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Όνομα Συνεργάτη 2
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-gray-200 hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Όνομα Συνεργάτη 3
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2 text-gray-200 hover:text-white transition-colors">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Όνομα Συνεργάτη 4
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}