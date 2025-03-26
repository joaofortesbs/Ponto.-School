import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupDetail from "@/components/turmas/group-detail";

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState({
    id: "",
    nome: "",
    descricao: "",
    membros: 0,
    tags: [],
  });

  useEffect(() => {
    // Simulate fetching group data
    const fetchGroup = async () => {
      try {
        // Add a small delay to simulate network request
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In a real app, you would fetch from an API
        // For now, we'll use mock data
        setGroup({
          id: id || "",
          nome: "Grupo de Cálculo Avançado",
          descricao:
            "Grupo para estudos de cálculo avançado e preparação para provas",
          membros: 6,
          tags: ["Cálculo", "Matemática", "Estudo em grupo"],
        });
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id]);

  const handleBack = () => {
    navigate("/turmas/grupos");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#001427]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001427] p-4">
      <div className="container mx-auto max-w-7xl">
        <GroupDetail group={group} onBack={handleBack} />
      </div>
    </div>
  );
}
