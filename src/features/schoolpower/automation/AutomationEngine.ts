
import { modalBinderEngine } from '../construction/modalBinder/modalBinderEngine';
import { generateActivityByType } from '../construction/generationStrategies/generateActivityByType';
import { fieldValidator } from '../construction/utils/fieldValidator';
import { waitForElement } from '../construction/utils/waitForElement';

export interface ActivityData {
  id: string;
  type: string;
  titulo: string;
  descricao: string;
  disciplina: string;
  tema: string;
  [key: string]: any;
}

export interface AutomationConfig {
  maxRetries: number;
  delayBetweenSteps: number;
  validationTimeout: number;
}

export class AutomationEngine {
  private config: AutomationConfig;
  private isRunning: boolean = false;
  private currentActivityIndex: number = 0;
  private activities: ActivityData[] = [];

  constructor(config: AutomationConfig = {
    maxRetries: 3,
    delayBetweenSteps: 1000,
    validationTimeout: 5000
  }) {
    this.config = config;
  }

  public async executeAutomation(activities: ActivityData[]): Promise<boolean> {
    if (this.isRunning) {
      console.warn('Automation is already running');
      return false;
    }

    this.isRunning = true;
    this.activities = activities;
    this.currentActivityIndex = 0;

    try {
      console.log('🚀 Starting School Power Automation Engine');
      console.log(`📦 Processing ${activities.length} activities`);

      for (let i = 0; i < activities.length; i++) {
        this.currentActivityIndex = i;
        const activity = activities[i];
        
        console.log(`🔄 Processing activity ${i + 1}/${activities.length}: ${activity.titulo}`);
        
        const success = await this.processActivity(activity);
        
        if (!success) {
          console.error(`❌ Failed to process activity: ${activity.titulo}`);
          return false;
        }

        // Delay between activities
        if (i < activities.length - 1) {
          await this.delay(this.config.delayBetweenSteps);
        }
      }

      console.log('✅ All activities processed successfully');
      return true;

    } catch (error) {
      console.error('❌ Automation failed:', error);
      return false;
    } finally {
      this.isRunning = false;
    }
  }

  private async processActivity(activity: ActivityData): Promise<boolean> {
    try {
      // Step 1: Generate AI data for the activity
      console.log(`🧠 Generating AI data for ${activity.type}`);
      const aiData = await generateActivityByType(activity.type, activity);

      if (!aiData) {
        console.error('Failed to generate AI data');
        return false;
      }

      // Step 2: Open the edit modal for this activity
      console.log(`📝 Opening edit modal for activity`);
      const modalOpened = await this.openEditModal(activity);

      if (!modalOpened) {
        console.error('Failed to open edit modal');
        return false;
      }

      // Step 3: Fill the modal with AI data
      console.log(`📋 Filling modal fields`);
      const fieldsFilled = await modalBinderEngine.fillModalFields(activity.type, aiData);

      if (!fieldsFilled) {
        console.error('Failed to fill modal fields');
        return false;
      }

      // Step 4: Validate all required fields
      console.log(`✓ Validating fields`);
      const fieldsValid = await fieldValidator.validateAllFields(activity.type);

      if (!fieldsValid) {
        console.error('Field validation failed');
        return false;
      }

      // Step 5: Click "Construir Atividade" button
      console.log(`🏗️ Building activity`);
      const activityBuilt = await this.clickBuildButton();

      if (!activityBuilt) {
        console.error('Failed to build activity');
        return false;
      }

      console.log(`✅ Activity "${activity.titulo}" processed successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Error processing activity "${activity.titulo}":`, error);
      return false;
    }
  }

  private async openEditModal(activity: ActivityData): Promise<boolean> {
    try {
      // Find the activity card in the construction grid
      const activityCard = await waitForElement(
        `[data-activity-id="${activity.id}"]`,
        this.config.validationTimeout
      );

      if (!activityCard) {
        console.error('Activity card not found');
        return false;
      }

      // Find and click the edit button
      const editButton = activityCard.querySelector('.edit-button') as HTMLElement;
      
      if (!editButton) {
        console.error('Edit button not found');
        return false;
      }

      editButton.click();

      // Wait for modal to appear
      const modal = await waitForElement(
        '.edit-activity-modal',
        this.config.validationTimeout
      );

      return modal !== null;

    } catch (error) {
      console.error('Error opening edit modal:', error);
      return false;
    }
  }

  private async clickBuildButton(): Promise<boolean> {
    try {
      // Wait for build button to be available
      const buildButton = await waitForElement(
        '.build-activity-button, [data-action="build"], button:contains("Construir")',
        this.config.validationTimeout
      ) as HTMLElement;

      if (!buildButton) {
        console.error('Build button not found');
        return false;
      }

      // Ensure button is enabled
      if (buildButton.hasAttribute('disabled')) {
        console.error('Build button is disabled');
        return false;
      }

      buildButton.click();

      // Wait for confirmation or success indicator
      await this.delay(2000);

      return true;

    } catch (error) {
      console.error('Error clicking build button:', error);
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.currentActivityIndex + 1,
      total: this.activities.length,
      percentage: ((this.currentActivityIndex + 1) / this.activities.length) * 100
    };
  }

  public isAutomationRunning(): boolean {
    return this.isRunning;
  }

  public stopAutomation(): void {
    this.isRunning = false;
    console.log('🛑 Automation stopped by user');
  }
}

export const automationEngine = new AutomationEngine();
