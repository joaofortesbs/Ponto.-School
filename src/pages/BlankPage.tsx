
import React from "react";

const BlankPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Página em Branco</h1>
        <p className="text-lg text-gray-600">Pronta para desenvolvimento!</p>
        <div className="mt-8 text-sm text-gray-500">
          <p>Esta página está renderizando corretamente.</p>
          <p>Você pode desenvolver seu aplicativo aqui.</p>
        </div>
      </div>
    </div>
  );
};

export default BlankPage;
