
export interface FieldMapping {
  name: string;
  selector: string;
  type: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'custom';
  required: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'array';
  validation?: RegExp;
  options?: string[]; // For select/radio fields
}

export class ModalFieldMapper {
  private static fieldMappings: Map<string, FieldMapping[]> = new Map();

  public static scanModalFields(modalElement: Element): FieldMapping[] {
    const fields: FieldMapping[] = [];

    // Scan all input fields
    const inputs = modalElement.querySelectorAll('input');
    inputs.forEach(input => {
      const mapping = this.createFieldMappingFromInput(input);
      if (mapping) fields.push(mapping);
    });

    // Scan all textarea fields
    const textareas = modalElement.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      const mapping = this.createFieldMappingFromTextarea(textarea);
      if (mapping) fields.push(mapping);
    });

    // Scan all select fields
    const selects = modalElement.querySelectorAll('select');
    selects.forEach(select => {
      const mapping = this.createFieldMappingFromSelect(select);
      if (mapping) fields.push(mapping);
    });

    // Scan custom fields
    const customFields = this.scanCustomFields(modalElement);
    fields.push(...customFields);

    return fields;
  }

  private static createFieldMappingFromInput(input: HTMLInputElement): FieldMapping | null {
    const name = input.name || input.id || this.extractNameFromLabel(input);
    if (!name) return null;

    const type = input.type;
    const required = input.required || input.hasAttribute('aria-required');

    let dataType: 'string' | 'number' | 'boolean' | 'array' = 'string';
    let validation: RegExp | undefined;

    switch (type) {
      case 'number':
        dataType = 'number';
        break;
      case 'checkbox':
        dataType = 'boolean';
        break;
      case 'email':
        validation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        break;
    }

    return {
      name,
      selector: this.generateSelector(input),
      type: type === 'text' || type === 'email' || type === 'password' || type === 'url' ? 'input' : type as any,
      required,
      dataType,
      validation
    };
  }

  private static createFieldMappingFromTextarea(textarea: HTMLTextAreaElement): FieldMapping | null {
    const name = textarea.name || textarea.id || this.extractNameFromLabel(textarea);
    if (!name) return null;

    const required = textarea.required || textarea.hasAttribute('aria-required');

    return {
      name,
      selector: this.generateSelector(textarea),
      type: 'textarea',
      required,
      dataType: 'string'
    };
  }

  private static createFieldMappingFromSelect(select: HTMLSelectElement): FieldMapping | null {
    const name = select.name || select.id || this.extractNameFromLabel(select);
    if (!name) return null;

    const required = select.required || select.hasAttribute('aria-required');
    const options = Array.from(select.options).map(option => option.textContent || option.value).filter(Boolean);

    return {
      name,
      selector: this.generateSelector(select),
      type: 'select',
      required,
      dataType: 'string',
      options
    };
  }

  private static scanCustomFields(modalElement: Element): FieldMapping[] {
    const customFields: FieldMapping[] = [];

    // Scan for button groups (radio-like behavior)
    const buttonGroups = modalElement.querySelectorAll('.btn-group, .button-group, [role="radiogroup"]');
    buttonGroups.forEach(group => {
      const name = group.getAttribute('data-field') || this.extractNameFromContext(group);
      if (name) {
        const buttons = group.querySelectorAll('button');
        const options = Array.from(buttons).map(btn => btn.textContent?.trim()).filter(Boolean);

        customFields.push({
          name,
          selector: this.generateSelector(group),
          type: 'custom',
          required: group.hasAttribute('data-required'),
          dataType: 'string',
          options
        });
      }
    });

    // Scan for multi-select components
    const multiSelects = modalElement.querySelectorAll('.multi-select, [data-multi-select]');
    multiSelects.forEach(multiSelect => {
      const name = multiSelect.getAttribute('data-field') || this.extractNameFromContext(multiSelect);
      if (name) {
        customFields.push({
          name,
          selector: this.generateSelector(multiSelect),
          type: 'custom',
          required: multiSelect.hasAttribute('data-required'),
          dataType: 'array'
        });
      }
    });

    // Scan for checkbox lists
    const checkboxLists = modalElement.querySelectorAll('.checkbox-list, [role="group"]');
    checkboxLists.forEach(list => {
      const checkboxes = list.querySelectorAll('input[type="checkbox"]');
      if (checkboxes.length > 1) {
        const name = list.getAttribute('data-field') || this.extractNameFromContext(list);
        if (name) {
          const options = Array.from(checkboxes).map(cb => {
            const label = cb.nextElementSibling?.textContent || cb.value;
            return label?.trim();
          }).filter(Boolean);

          customFields.push({
            name,
            selector: this.generateSelector(list),
            type: 'custom',
            required: list.hasAttribute('data-required'),
            dataType: 'array',
            options
          });
        }
      }
    });

    return customFields;
  }

  private static extractNameFromLabel(element: HTMLElement): string | null {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label && label.textContent) {
        return this.normalizeFieldName(label.textContent);
      }
    }

    // Try to find label as previous sibling
    let prev = element.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'LABEL' && prev.textContent) {
        return this.normalizeFieldName(prev.textContent);
      }
      prev = prev.previousElementSibling;
    }

    // Try placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) {
      return this.normalizeFieldName(placeholder);
    }

    return null;
  }

  private static extractNameFromContext(element: Element): string | null {
    // Try data attributes
    const dataField = element.getAttribute('data-field');
    if (dataField) return dataField;

    // Try finding nearby label
    const parent = element.parentElement;
    if (parent) {
      const label = parent.querySelector('label');
      if (label && label.textContent) {
        return this.normalizeFieldName(label.textContent);
      }

      // Try finding by heading
      const heading = parent.querySelector('h1, h2, h3, h4, h5, h6, .field-label');
      if (heading && heading.textContent) {
        return this.normalizeFieldName(heading.textContent);
      }
    }

    return null;
  }

  private static normalizeFieldName(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  private static generateSelector(element: Element): string {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try name attribute
    const name = element.getAttribute('name');
    if (name) {
      return `[name="${name}"]`;
    }

    // Try data-field attribute
    const dataField = element.getAttribute('data-field');
    if (dataField) {
      return `[data-field="${dataField}"]`;
    }

    // Generate class-based selector
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 2);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }

    // Fallback to tag name with index
    const siblings = Array.from(element.parentElement?.children || [])
      .filter(child => child.tagName === element.tagName);
    const index = siblings.indexOf(element);

    return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
  }

  public static cacheFieldMappings(activityType: string, mappings: FieldMapping[]): void {
    this.fieldMappings.set(activityType, mappings);
  }

  public static getCachedFieldMappings(activityType: string): FieldMapping[] | null {
    return this.fieldMappings.get(activityType) || null;
  }

  public static getAllCachedMappings(): Map<string, FieldMapping[]> {
    return new Map(this.fieldMappings);
  }
}
