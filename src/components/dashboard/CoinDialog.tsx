import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Plus, CreditCard, Wallet } from "lucide-react";

interface CoinDialogProps {
  type: "recharge" | "send";
  onSubmit: (amount: number) => void;
}

export function CoinDialog({ type, onSubmit }: CoinDialogProps) {
  const [amount, setAmount] = React.useState<number>(0);
  const [recipient, setRecipient] = React.useState<string>("");

  const presetAmounts = [100, 500, 1000, 5000];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-5 w-5 hover:scale-105 transition-all duration-300 ${type === "recharge" ? "text-brand-primary hover:bg-brand-primary/10" : "text-muted-foreground hover:bg-accent/50"}`}
        >
          {type === "recharge" ? (
            <Plus className="h-3.5 w-3.5" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {type === "recharge" ? (
              <>
                <Wallet className="h-5 w-5 text-brand-primary" />
                Recarregar School Points
              </>
            ) : (
              <>
                <Send className="h-5 w-5 text-brand-primary" />
                Enviar School Points
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {type === "send" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Destinatário</label>
              <Input
                placeholder="Nome ou ID do usuário"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="h-12"
              />
            </div>
          )}

          <div className="space-y-4">
            <label className="text-sm font-medium">Quantidade</label>

            <div className="grid grid-cols-2 gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? "default" : "outline"}
                  className={`h-12 text-lg font-semibold ${amount === preset ? "bg-brand-primary text-white" : "hover:border-brand-primary hover:text-brand-primary"}`}
                  onClick={() => setAmount(preset)}
                >
                  {preset} SP
                </Button>
              ))}
            </div>

            <div className="relative">
              <Input
                type="number"
                min={1}
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Ou digite um valor personalizado"
                className="h-12 text-lg pl-12"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                SP
              </span>
            </div>
          </div>

          <Button
            className="w-full h-12 text-lg bg-brand-primary hover:bg-brand-primary/90 text-white relative overflow-hidden group"
            onClick={() => onSubmit(amount)}
            disabled={amount <= 0 || (type === "send" && !recipient)}
          >
            <span className="relative z-10 flex items-center gap-2">
              {type === "recharge" ? (
                <>
                  <CreditCard className="h-5 w-5" />
                  Recarregar agora
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar agora
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
