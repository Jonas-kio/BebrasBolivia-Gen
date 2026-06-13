/**
 * Prueba de infraestructura: Verifica que Next.js está configurado correctamente
 * (TDD - Red phase)
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { describe, expect, it } from '@jest/globals';

type TsConfig = {
  compilerOptions?: {
    strict?: boolean;
  };
};

describe('Infraestructura - Cliente Next.js', () => {
  describe('Configuración del cliente', () => {
    it('debería tener la configuración de Next.js disponible', () => {
      const nextConfigPath = path.join(__dirname, '../../next.config.js');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
    });

    it('debería tener TypeScript configurado', () => {
      const tsconfigPath = path.join(__dirname, '../../tsconfig.json');
      const tsconfig = fs.readFileSync(tsconfigPath, 'utf8');
      const parsedConfig: unknown = JSON.parse(tsconfig);
      const config = parsedConfig as TsConfig;

      expect(config.compilerOptions).toBeDefined();
      if (config.compilerOptions === undefined) {
        throw new Error('compilerOptions no está definido');
      }

      expect(config.compilerOptions.strict).toBe(true);
    });

    it('debería tener Tailwind CSS configurado', () => {
      const tailwindPath = path.join(__dirname, '../../tailwind.config.js');
      const tailwindConfig = fs.readFileSync(tailwindPath, 'utf8');
      
      expect(tailwindConfig).toBeDefined();
      expect(tailwindConfig).toContain('content');
    });

    it('debería tener Jest configurado para pruebas', () => {
      const jestPath = path.join(__dirname, '../../jest.config.js');
      expect(fs.existsSync(jestPath)).toBe(true);
    });
  });
});
