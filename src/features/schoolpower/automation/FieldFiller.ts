
import { waitForElement } from '../construction/utils/waitForElement';

export interface FieldFillingResult {
  success: boolean;
  filledFields: string[];
  errors: string[];
}

export class FieldFiller {
  private static readonly INTERACTION_DELAY = 300;
  private static readonly FIELD_TIMEOUT = 5000;

  public static async fillAllFields(data: any, containerSelector: string = '.edit-activity-modal'): Promise<FieldFillingResult> {
    const result: FieldFillingResult = {
      success: true,
      filledFields: [],
      errors: []
    };

    try {
      const container = await waitForElement(containerSelector, this.FIELD_TIMEOUT);
      
      if (!container) {
        result.success = false;
        result.errors.push('Modal container not found');
        return result;
      }

      // Process each field in the data
      for (const [fieldName, fieldValue] of Object.entries(data)) {
        if (fieldValue === null || fieldValue === undefined) continue;

        try {
          const filled = await this.fillField(fieldName, fieldValue, container);
          
          if (filled) {
            result.filledFields.push(fieldName);
          } else {
            result.errors.push(`Failed to fill field: ${fieldName}`);
          }

          // Small delay between field interactions
          await this.delay(this.INTERACTION_DELAY);

        } catch (error) {
          const errorMsg = `Error filling field ${fieldName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      // Final validation
      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private static async fillField(fieldName: string, fieldValue: any, container: Element): Promise<boolean> {
    // Find field by various selectors
    const selectors = [
      `[name="${fieldName}"]`,
      `[data-field="${fieldName}"]`,
      `#${fieldName}`,
      `.field-${fieldName}`,
      `input[placeholder*="${fieldName}"]`,
      `textarea[placeholder*="${fieldName}"]`
    ];

    let field: HTMLElement | null = null;

    for (const selector of selectors) {
      field = container.querySelector(selector) as HTMLElement;
      if (field) break;
    }

    // If not found, try by label text
    if (!field) {
      field = this.findFieldByLabel(fieldName, container);
    }

    if (!field) {
      console.warn(`Field not found: ${fieldName}`);
      return false;
    }

    // Fill based on field type
    return await this.fillFieldByType(field, fieldValue);
  }

  private static findFieldByLabel(fieldName: string, container: Element): HTMLElement | null {
    const labels = container.querySelectorAll('label');
    
    for (const label of labels) {
      const labelText = label.textContent?.toLowerCase() || '';
      const searchText = fieldName.toLowerCase().replace('_', ' ');
      
      if (labelText.includes(searchText)) {
        // Try to find associated field
        const forAttr = label.getAttribute('for');
        if (forAttr) {
          const field = container.querySelector(`#${forAttr}`) as HTMLElement;
          if (field) return field;
        }
        
        // Try next sibling
        const nextElement = label.nextElementSibling as HTMLElement;
        if (nextElement && (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA' || nextElement.tagName === 'SELECT')) {
          return nextElement;
        }
      }
    }

    return null;
  }

  private static async fillFieldByType(field: HTMLElement, value: any): Promise<boolean> {
    const tagName = field.tagName.toLowerCase();
    const fieldType = (field as HTMLInputElement).type?.toLowerCase();

    try {
      switch (tagName) {
        case 'input':
          return await this.fillInputField(field as HTMLInputElement, value, fieldType);
        
        case 'textarea':
          return await this.fillTextareaField(field as HTMLTextAreaElement, value);
        
        case 'select':
          return await this.fillSelectField(field as HTMLSelectElement, value);
        
        default:
          // Try custom field handlers
          return await this.fillCustomField(field, value);
      }
    } catch (error) {
      console.error(`Error filling field ${field.name || field.id}:`, error);
      return false;
    }
  }

  private static async fillInputField(input: HTMLInputElement, value: any, type: string): Promise<boolean> {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'url':
        input.value = String(value);
        this.triggerEvents(input, ['input', 'change']);
        return true;

      case 'number':
        input.value = String(Number(value));
        this.triggerEvents(input, ['input', 'change']);
        return true;

      case 'checkbox':
        input.checked = Boolean(value);
        this.triggerEvents(input, ['change']);
        return true;

      case 'radio':
        if (input.value === String(value)) {
          input.checked = true;
          this.triggerEvents(input, ['change']);
          return true;
        }
        return false;

      default:
        input.value = String(value);
        this.triggerEvents(input, ['input', 'change']);
        return true;
    }
  }

  private static async fillTextareaField(textarea: HTMLTextAreaElement, value: any): Promise<boolean> {
    textarea.value = String(value);
    this.triggerEvents(textarea, ['input', 'change']);
    return true;
  }

  private static async fillSelectField(select: HTMLSelectElement, value: any): Promise<boolean> {
    const stringValue = String(value).toLowerCase();

    // Try exact value match first
    for (const option of select.options) {
      if (option.value === stringValue || option.value.toLowerCase() === stringValue) {
        select.value = option.value;
        this.triggerEvents(select, ['change']);
        return true;
      }
    }

    // Try text content match
    for (const option of select.options) {
      if (option.textContent?.toLowerCase().includes(stringValue)) {
        select.value = option.value;
        this.triggerEvents(select, ['change']);
        return true;
      }
    }

    console.warn(`No matching option found for select field with value: ${value}`);
    return false;
  }

  private static async fillCustomField(field: HTMLElement, value: any): Promise<boolean> {
    // Handle custom React components or complex fields
    
    // Check if it's a multi-select or tag input
    if (field.classList.contains('multi-select') || field.classList.contains('tag-input')) {
      return await this.fillMultiSelectField(field, value);
    }

    // Check if it's a button group
    if (field.classList.contains('button-group') || field.querySelector('.btn-group')) {
      return await this.fillButtonGroup(field, value);
    }

    // Check if it's a list with checkboxes
    if (field.classList.contains('checkbox-list')) {
      return await this.fillCheckboxList(field, value);
    }

    // Fallback: try to set textContent or value
    if ('value' in field) {
      (field as any).value = String(value);
      this.triggerEvents(field, ['input', 'change']);
      return true;
    }

    return false;
  }

  private static async fillMultiSelectField(field: HTMLElement, value: any): Promise<boolean> {
    const values = Array.isArray(value) ? value : [value];
    
    for (const val of values) {
      const option = field.querySelector(`[data-value="${val}"], [value="${val}"]`) as HTMLElement;
      if (option) {
        option.click();
        await this.delay(100);
      }
    }

    return true;
  }

  private static async fillButtonGroup(field: HTMLElement, value: any): Promise<boolean> {
    const targetButton = field.querySelector(`button[data-value="${value}"], button:contains("${value}")`) as HTMLElement;
    
    if (targetButton) {
      targetButton.click();
      return true;
    }

    return false;
  }

  private static async fillCheckboxList(field: HTMLElement, value: any): Promise<boolean> {
    const values = Array.isArray(value) ? value : [value];
    
    for (const val of values) {
      const checkbox = field.querySelector(`input[value="${val}"]`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = true;
        this.triggerEvents(checkbox, ['change']);
      }
    }

    return true;
  }

  private static triggerEvents(element: HTMLElement, eventTypes: string[]): void {
    eventTypes.forEach(eventType => {
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true
      });
      element.dispatchEvent(event);
    });
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
