import React from "react";

export default function TurmasPage() {
  return (
    <div className="w-full h-full bg-[#f7f9fa] dark:bg-[#001427] p-6 space-y-6 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-[#29335C] dark:text-white">
        Minhas Turmas
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: "matematica",
            name: "Matemática Avançada",
            teacher: "Prof. Carlos Santos",
            students: 28,
            progress: 65,
          },
          {
            id: "fisica",
            name: "Física Quântica",
            teacher: "Profa. Ana Oliveira",
            students: 22,
            progress: 42,
          },
          {
            id: "quimica",
            name: "Química Orgânica",
            teacher: "Prof. Roberto Almeida",
            students: 25,
            progress: 78,
          },
          {
            id: "biologia",
            name: "Biologia Molecular",
            teacher: "Profa. Mariana Costa",
            students: 30,
            progress: 35,
          },
        ].map((turma) => (
          <div
            key={turma.id}
            className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] cursor-pointer"
            onClick={() => (window.location.href = `/turmas/${turma.id}`)}
          >
            <div className="h-32 bg-gradient-to-r from-[#29335C] to-[#001427] flex items-center justify-center">
              <h3 className="text-xl font-bold text-white">{turma.name}</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[#64748B] dark:text-white/60">
                {turma.teacher}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B] dark:text-white/60">
                  {turma.students} alunos
                </span>
                <span className="text-sm font-medium text-[#29335C] dark:text-white">
                  {turma.progress}% concluído
                </span>
              </div>
              <div className="w-full h-2 bg-[#E0E1DD] dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF6B00] rounded-full"
                  style={{ width: `${turma.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
