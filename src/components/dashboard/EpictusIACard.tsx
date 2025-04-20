
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function EpictusIACard() {
  const navigate = useNavigate();
  
  return (
    <Card className="col-span-1 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Assistente de Estudos</CardTitle>
        <CardDescription>
          Recursos para auxiliar seus estudos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Esta funcionalidade foi atualizada e está disponível em outras áreas da plataforma.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          Explorar recursos
        </Button>
      </CardContent>
    </Card>
  );
}

export default EpictusIACard;
