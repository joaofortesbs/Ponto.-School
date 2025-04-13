
# Guia de Padronização de Importações

Para manter o código organizado e consistente, siga estas diretrizes:

## Ordem de Importações

1. Bibliotecas React e React-related
2. Bibliotecas de terceiros
3. Componentes, hooks e utilidades internas
4. Tipos
5. Estilos

## Exemplo:

```tsx
// 1. React e React-related
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. Bibliotecas de terceiros 
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// 3. Componentes, hooks e utilidades internas
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import { formatCurrency } from '@/utils/format';

// 4. Tipos
import type { UserProfile } from '@/types/user';

// 5. Estilos
import './styles.css';
```

## Uso de imports com barrel files

Para reduzir o número de importações, crie arquivos index.ts que reexportam componentes:

```tsx
// src/components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card, CardHeader, CardContent, CardFooter } from './card';

// Uso em outros arquivos:
import { Button, Input, Card } from '@/components/ui';
```
