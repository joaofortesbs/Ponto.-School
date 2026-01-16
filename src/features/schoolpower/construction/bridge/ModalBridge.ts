/**
 * MODAL BRIDGE
 * 
 * Singleton que mantém referência ao EditActivityModal e permite
 * que o BuildController acione o modal programaticamente.
 * 
 * FLUXO:
 * 1. ConstructionInterface registra o handle do modal quando monta
 * 2. BuildController usa ModalBridge para acionar o modal
 * 3. Modal abre, recebe campos, executa build, fecha
 */

export interface ModalHandle {
  open: (activityId: string, activityType: string, customFields?: Record<string, any>) => void;
  setFields: (formData: Record<string, any>) => void;
  build: () => Promise<BuildResult>;
  close: () => void;
  isOpen: () => boolean;
}

export interface BuildResult {
  success: boolean;
  result?: any;
  error?: string;
  storageKeys?: string[];
}

class ModalBridgeClass {
  private modalRef: ModalHandle | null = null;
  private buildResolver: ((result: BuildResult) => void) | null = null;
  private buildPromise: Promise<BuildResult> | null = null;

  register(handle: ModalHandle): void {
    console.log('🌉 [ModalBridge] Modal registrado');
    this.modalRef = handle;
  }

  unregister(): void {
    console.log('🌉 [ModalBridge] Modal desregistrado');
    this.modalRef = null;
  }

  isReady(): boolean {
    return this.modalRef !== null;
  }

  getHandle(): ModalHandle | null {
    return this.modalRef;
  }

  async buildActivity(
    activityId: string,
    activityType: string,
    fields: Record<string, any>
  ): Promise<BuildResult> {
    console.log(`\n🌉 ════════════════════════════════════════════════════════`);
    console.log(`🌉 [ModalBridge] INICIANDO BUILD VIA MODAL`);
    console.log(`🌉 ════════════════════════════════════════════════════════`);
    console.log(`🌉 [ModalBridge] Atividade: ${activityId}`);
    console.log(`🌉 [ModalBridge] Tipo: ${activityType}`);
    console.log(`🌉 [ModalBridge] Campos:`, Object.keys(fields));

    if (!this.modalRef) {
      const error = 'Modal não está registrado no ModalBridge';
      console.error(`❌ [ModalBridge] ${error}`);
      return { success: false, error };
    }

    try {
      console.log('📖 [ModalBridge] Passo 1: Abrindo modal...');
      this.modalRef.open(activityId, activityType, fields);
      
      await this.sleep(150);
      
      console.log('📝 [ModalBridge] Passo 2: Injetando campos no formulário...');
      this.modalRef.setFields(fields);
      
      await this.sleep(100);

      console.log('🔨 [ModalBridge] Passo 3: Executando build (clicando em Gerar Atividades)...');
      const buildResult = await this.modalRef.build();
      
      console.log('🔒 [ModalBridge] Passo 4: Fechando modal...');
      this.modalRef.close();

      console.log(`🌉 [ModalBridge] ════════════════════════════════════════════════════════`);
      console.log(`🌉 [ModalBridge] BUILD CONCLUÍDO: ${buildResult.success ? 'SUCESSO' : 'ERRO'}`);
      console.log(`🌉 [ModalBridge] ════════════════════════════════════════════════════════\n`);

      return buildResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`❌ [ModalBridge] Erro no build:`, error);
      
      if (this.modalRef?.isOpen()) {
        this.modalRef.close();
      }
      
      return { success: false, error: errorMessage };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  resolveBuild(result: BuildResult): void {
    if (this.buildResolver) {
      console.log('🌉 [ModalBridge] Resolvendo promise de build:', result.success ? 'sucesso' : 'erro');
      this.buildResolver(result);
      this.buildResolver = null;
      this.buildPromise = null;
    }
  }
}

export const ModalBridge = new ModalBridgeClass();
