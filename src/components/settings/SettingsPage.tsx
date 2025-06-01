
import React, { useState } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const {
    loading,
    accountInfo,
    securitySettings,
    notificationSettings,
    paymentSubscription,
    privacySettings,
    walletSettings,
    setAccountInfo,
    setSecuritySettings,
    setNotificationSettings,
    setPaymentSubscription,
    setPrivacySettings,
    setWalletSettings,
    saveAccountInfo,
    saveSecuritySettings,
    saveNotificationSettings,
    savePaymentSubscription,
    savePrivacySettings,
    saveWalletSettings
  } = useUserSettings();

  const [saving, setSaving] = useState<string | null>(null);

  const handleSaveAccountInfo = async () => {
    setSaving('account');
    await saveAccountInfo(accountInfo);
    setSaving(null);
  };

  const handleSaveSecuritySettings = async () => {
    setSaving('security');
    await saveSecuritySettings(securitySettings);
    setSaving(null);
  };

  const handleSaveNotificationSettings = async () => {
    setSaving('notifications');
    await saveNotificationSettings(notificationSettings);
    setSaving(null);
  };

  const handleSavePaymentSubscription = async () => {
    setSaving('payment');
    await savePaymentSubscription(paymentSubscription);
    setSaving(null);
  };

  const handleSavePrivacySettings = async () => {
    setSaving('privacy');
    await savePrivacySettings(privacySettings);
    setSaving(null);
  };

  const handleSaveWalletSettings = async () => {
    setSaving('wallet');
    await saveWalletSettings(walletSettings);
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-[#1E3A8A]">Configurações</h1>
      
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="privacy">Privacidade</TabsTrigger>
          <TabsTrigger value="wallet">Carteira</TabsTrigger>
        </TabsList>

        {/* Informações da Conta */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Informações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e de contato.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_exibicao">Nome de Exibição</Label>
                <Input
                  id="nome_exibicao"
                  value={accountInfo.nome_exibicao}
                  onChange={(e) => setAccountInfo({ ...accountInfo, nome_exibicao: e.target.value })}
                  placeholder="Seu nome de exibição"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo</Label>
                <Input
                  id="nome_completo"
                  value={accountInfo.nome_completo}
                  onChange={(e) => setAccountInfo({ ...accountInfo, nome_completo: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={accountInfo.email}
                  onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })}
                  placeholder="seu@email.com"
                />
              </div>
              <Button 
                onClick={handleSaveAccountInfo}
                disabled={saving === 'account'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'account' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Segurança</CardTitle>
              <CardDescription>
                Configure suas preferências de segurança.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Switch
                  checked={securitySettings.autenticacao_2fa}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, autenticacao_2fa: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações de Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando alguém acessar sua conta
                  </p>
                </div>
                <Switch
                  checked={securitySettings.notificacoes_login}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, notificacoes_login: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout_sessao">Timeout da Sessão (minutos)</Label>
                <Select 
                  value={securitySettings.timeout_sessao.toString()}
                  onValueChange={(value) => 
                    setSecuritySettings({ ...securitySettings, timeout_sessao: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSaveSecuritySettings}
                disabled={saving === 'security'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'security' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Notificações</CardTitle>
              <CardDescription>
                Configure como você deseja receber notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações Push</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações push no navegador
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.push}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, push: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Lembretes de Estudo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes para manter seus estudos em dia
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.lembretes_estudo}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, lembretes_estudo: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relatórios Semanais</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba relatórios sobre seu progresso semanal
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.relatorios_semanais}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, relatorios_semanais: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Som das Notificações</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproduzir som ao receber notificações
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.som_notificacoes}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, som_notificacoes: checked })
                  }
                />
              </div>
              <Button 
                onClick={handleSaveNotificationSettings}
                disabled={saving === 'notifications'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'notifications' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Pagamento e Assinatura */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Pagamento e Assinatura</CardTitle>
              <CardDescription>
                Gerencie suas configurações de pagamento e assinatura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Renovação Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Renove automaticamente sua assinatura
                  </p>
                </div>
                <Switch
                  checked={paymentSubscription.renovacao_automatica}
                  onCheckedChange={(checked) => 
                    setPaymentSubscription({ ...paymentSubscription, renovacao_automatica: checked })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_faturas">Email para Faturas</Label>
                <Input
                  id="email_faturas"
                  type="email"
                  value={paymentSubscription.email_faturas}
                  onChange={(e) => 
                    setPaymentSubscription({ ...paymentSubscription, email_faturas: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
              <Button 
                onClick={handleSavePaymentSubscription}
                disabled={saving === 'payment'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'payment' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Privacidade */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Privacidade</CardTitle>
              <CardDescription>
                Configure suas preferências de privacidade.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visibilidade_perfil">Visibilidade do Perfil</Label>
                <Select 
                  value={privacySettings.visibilidade_perfil}
                  onValueChange={(value) => 
                    setPrivacySettings({ ...privacySettings, visibilidade_perfil: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Público">Público</SelectItem>
                    <SelectItem value="Amigos">Apenas Amigos</SelectItem>
                    <SelectItem value="Privado">Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros vejam seu email
                  </p>
                </div>
                <Switch
                  checked={privacySettings.mostrar_email}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, mostrar_email: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mostrar Telefone</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros vejam seu telefone
                  </p>
                </div>
                <Switch
                  checked={privacySettings.mostrar_telefone}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, mostrar_telefone: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Permitir Mensagens</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que outros usuários enviem mensagens
                  </p>
                </div>
                <Switch
                  checked={privacySettings.permitir_mensagens}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, permitir_mensagens: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Coleta de Dados para Melhorias</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir coleta de dados para melhorar o serviço
                  </p>
                </div>
                <Switch
                  checked={privacySettings.coleta_dados_melhorias}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, coleta_dados_melhorias: checked })
                  }
                />
              </div>
              <Button 
                onClick={handleSavePrivacySettings}
                disabled={saving === 'privacy'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'privacy' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações da Carteira */}
        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A8A]">Carteira</CardTitle>
              <CardDescription>
                Gerencie suas configurações da carteira digital.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="saldo_atual">Saldo Atual</Label>
                <Input
                  id="saldo_atual"
                  type="number"
                  step="0.01"
                  value={walletSettings.saldo_atual}
                  onChange={(e) => 
                    setWalletSettings({ ...walletSettings, saldo_atual: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school_points">School Points</Label>
                <Input
                  id="school_points"
                  type="number"
                  value={walletSettings.school_points}
                  onChange={(e) => 
                    setWalletSettings({ ...walletSettings, school_points: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limite_gastos">Limite de Gastos</Label>
                <Input
                  id="limite_gastos"
                  type="number"
                  step="0.01"
                  value={walletSettings.limite_gastos}
                  onChange={(e) => 
                    setWalletSettings({ ...walletSettings, limite_gastos: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recarga Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Recarregar automaticamente quando o saldo estiver baixo
                  </p>
                </div>
                <Switch
                  checked={walletSettings.recarga_automatica}
                  onCheckedChange={(checked) => 
                    setWalletSettings({ ...walletSettings, recarga_automatica: checked })
                  }
                />
              </div>
              <Button 
                onClick={handleSaveWalletSettings}
                disabled={saving === 'wallet'}
                className="bg-[#F97316] hover:bg-[#F97316]/90"
              >
                {saving === 'wallet' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
