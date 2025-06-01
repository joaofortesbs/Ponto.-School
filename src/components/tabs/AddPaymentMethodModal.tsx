
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard, 
  X, 
  Lock,
  AlertCircle,
  Check
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (method: any) => void;
  userProfile: any;
}

export default function AddPaymentMethodModal({
  isOpen,
  onClose,
  onAddPaymentMethod,
  userProfile
}: AddPaymentMethodModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    cardNumber: "",
    holderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardType: "credit",
    brand: "",
    isDefault: false,
    billingAddress: "",
    cpf: "",
    phone: ""
  });

  const detectCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, "");
    
    if (number.match(/^4/)) return "Visa";
    if (number.match(/^5[1-5]/)) return "Mastercard";
    if (number.match(/^3[47]/)) return "American Express";
    if (number.match(/^6/)) return "Discover";
    if (number.match(/^38|^30/)) return "Diners Club";
    
    return "Outros";
  };

  const formatCardNumber = (value: string) => {
    const number = value.replace(/\s/g, "");
    const match = number.match(/\d{1,4}/g);
    return match ? match.join(" ") : "";
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
      newErrors.cardNumber = "Número do cartão inválido";
    }

    if (!formData.holderName.trim()) {
      newErrors.holderName = "Nome do portador é obrigatório";
    }

    if (!formData.expiryMonth) {
      newErrors.expiryMonth = "Mês de vencimento é obrigatório";
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = "Ano de vencimento é obrigatório";
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    if (!formData.cpf || formData.cpf.length < 11) {
      newErrors.cpf = "CPF inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;

    if (field === "cardNumber") {
      processedValue = formatCardNumber(value);
      const brand = detectCardBrand(processedValue);
      setFormData(prev => ({ ...prev, brand }));
    } else if (field === "cvv") {
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "cpf") {
      processedValue = value.replace(/\D/g, "").slice(0, 11);
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const cardNumberLast4 = formData.cardNumber.replace(/\s/g, "").slice(-4);
      
      const paymentMethod = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "card",
        card_type: formData.cardType,
        brand: formData.brand,
        last4: cardNumberLast4,
        exp_month: formData.expiryMonth,
        exp_year: formData.expiryYear,
        holder_name: formData.holderName,
        is_default: formData.isDefault,
        billing_address: formData.billingAddress,
        cpf: formData.cpf,
        phone: formData.phone,
        created_at: new Date().toISOString(),
        is_verified: false
      };

      // Salvar no Supabase
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: userProfile?.id,
          payment_settings: {
            paymentMethods: [paymentMethod],
            billingAddress: formData.billingAddress,
            autoRenewal: true,
            invoiceEmail: userProfile?.email || ""
          },
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (error) {
        console.error("Erro ao salvar método de pagamento:", error);
        throw error;
      }

      onAddPaymentMethod(paymentMethod);
      handleClose();
    } catch (error) {
      console.error("Erro ao adicionar método de pagamento:", error);
      setErrors({ general: "Erro ao adicionar método de pagamento. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cardNumber: "",
      holderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardType: "credit",
      brand: "",
      isDefault: false,
      billingAddress: "",
      cpf: "",
      phone: ""
    });
    setErrors({});
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    { value: "01", label: "01 - Janeiro" },
    { value: "02", label: "02 - Fevereiro" },
    { value: "03", label: "03 - Março" },
    { value: "04", label: "04 - Abril" },
    { value: "05", label: "05 - Maio" },
    { value: "06", label: "06 - Junho" },
    { value: "07", label: "07 - Julho" },
    { value: "08", label: "08 - Agosto" },
    { value: "09", label: "09 - Setembro" },
    { value: "10", label: "10 - Outubro" },
    { value: "11", label: "11 - Novembro" },
    { value: "12", label: "12 - Dezembro" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Adicionar Método de Pagamento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {errors.general && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">{errors.general}</span>
            </div>
          )}

          {/* Tipo de Cartão */}
          <div>
            <Label>Tipo de Cartão</Label>
            <Select value={formData.cardType} onValueChange={(value) => handleInputChange("cardType", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número do Cartão */}
          <div>
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                placeholder="1234 5678 9012 3456"
                className={`mt-1 pr-20 ${errors.cardNumber ? "border-red-500" : ""}`}
                maxLength={19}
              />
              {formData.brand && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-medium text-gray-500">
                  {formData.brand}
                </div>
              )}
            </div>
            {errors.cardNumber && (
              <span className="text-xs text-red-500 mt-1">{errors.cardNumber}</span>
            )}
          </div>

          {/* Nome do Portador */}
          <div>
            <Label htmlFor="holderName">Nome do Portador</Label>
            <Input
              id="holderName"
              value={formData.holderName}
              onChange={(e) => handleInputChange("holderName", e.target.value)}
              placeholder="Nome como está no cartão"
              className={`mt-1 ${errors.holderName ? "border-red-500" : ""}`}
            />
            {errors.holderName && (
              <span className="text-xs text-red-500 mt-1">{errors.holderName}</span>
            )}
          </div>

          {/* Validade e CVV */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Mês</Label>
              <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange("expiryMonth", value)}>
                <SelectTrigger className={`mt-1 ${errors.expiryMonth ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiryMonth && (
                <span className="text-xs text-red-500 mt-1">Obrigatório</span>
              )}
            </div>

            <div>
              <Label>Ano</Label>
              <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange("expiryYear", value)}>
                <SelectTrigger className={`mt-1 ${errors.expiryYear ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.expiryYear && (
                <span className="text-xs text-red-500 mt-1">Obrigatório</span>
              )}
            </div>

            <div>
              <Label htmlFor="cvv">CVV</Label>
              <div className="relative">
                <Input
                  id="cvv"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  placeholder="123"
                  className={`mt-1 ${errors.cvv ? "border-red-500" : ""}`}
                  maxLength={4}
                  type="password"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              </div>
              {errors.cvv && (
                <span className="text-xs text-red-500 mt-1">Inválido</span>
              )}
            </div>
          </div>

          {/* CPF */}
          <div>
            <Label htmlFor="cpf">CPF do Portador</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={(e) => handleInputChange("cpf", e.target.value)}
              placeholder="12345678901"
              className={`mt-1 ${errors.cpf ? "border-red-500" : ""}`}
              maxLength={11}
            />
            {errors.cpf && (
              <span className="text-xs text-red-500 mt-1">{errors.cpf}</span>
            )}
          </div>

          {/* Telefone */}
          <div>
            <Label htmlFor="phone">Telefone (Opcional)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              className="mt-1"
            />
          </div>

          {/* Endereço de Cobrança */}
          <div>
            <Label htmlFor="billingAddress">Endereço de Cobrança (Opcional)</Label>
            <Input
              id="billingAddress"
              value={formData.billingAddress}
              onChange={(e) => handleInputChange("billingAddress", e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade, CEP"
              className="mt-1"
            />
          </div>

          {/* Definir como Padrão */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label>Definir como Método Padrão</Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Este cartão será usado automaticamente para cobranças
              </p>
            </div>
            <Switch
              checked={formData.isDefault}
              onCheckedChange={(checked) => handleInputChange("isDefault", checked.toString())}
            />
          </div>

          {/* Aviso de Segurança */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Lock className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-xs text-blue-600 dark:text-blue-400">
              <p className="font-medium">Segurança dos Dados</p>
              <p>Suas informações são criptografadas e armazenadas com segurança.</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90"
          >
            {isLoading ? "Salvando..." : "Adicionar Cartão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
