
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function GruposEstudoView() {
  return (
    <Card className="w-full bg-white dark:bg-[#0A2540] border-[#E0E1DD] dark:border-white/10">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-[#29335C] dark:text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#FF6B00]" />
          Grupos de Estudo
        </CardTitle>
        <p className="text-sm text-[#64748B] dark:text-white/60 mt-1">
          Interface em desenvolvimento
        </p>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-[#64748B] dark:text-white/60">
            Esta seção está sendo desenvolvida.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
