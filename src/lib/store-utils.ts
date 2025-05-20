
import { create as createImpl } from 'zustand/vanilla';
import { createWithEqualityFn } from 'zustand/traditional';

// Exportar create como nome alternativo para manter compatibilidade com versões antigas de código
export const create = createWithEqualityFn || createImpl;

// Exportar outras funções úteis do Zustand
export { useStore } from 'zustand';
export { shallow } from 'zustand/shallow';
export { createStore } from 'zustand/vanilla';
