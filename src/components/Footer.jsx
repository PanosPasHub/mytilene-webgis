import React from "react";

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-10 text-center">
      <div className="max-w-4xl mx-auto space-y-4">
        <img src="/images/chios-logo.png" alt="Mytilene City" className="mx-auto h-12" />
        <nav className="space-x-4">
          <a href="#explore" className="hover:text-white">Αρχική</a>
          <a href="#events" className="hover:text-white">Πληροφορίες</a>
          <a href="#mustdo" className="hover:text-white">Αξιοθέατα</a>
          <a href="#map" className="hover:text-white">Χάρτης</a>
          <a href="#contact" className="hover:text-white">Επικοινωνία</a>
        </nav>
        <p className="text-sm">
          Η ιστοσελίδα δημιουργήθηκε στο πλαίσιο της διπλωματικής μου εργασίας για το ΠΜΣ Γεωπληροφορικής, Πανεπιστημίου Αιγαίου.
        </p>
        <p className="text-xs text-gray-500">
          © 2025 Πασινιός Παναγιώτης | email: panagiotispasinios@gmail.com
        </p>
      </div>
    </footer>
  );
}
