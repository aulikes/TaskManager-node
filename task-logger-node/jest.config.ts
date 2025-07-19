export default {
  // Indica que se usará ts-jest como compilador de TypeScript en tiempo de prueba.
  preset: 'ts-jest',

  // Define que las pruebas se ejecutarán en un entorno Node.js (ideal para backend).
  testEnvironment: 'node',

  // Especifica qué extensiones de archivos se deben considerar como válidas para pruebas.
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Define el directorio raíz desde donde Jest debe resolver rutas relativas.
  rootDir: '.',

  // Especifica el patrón de búsqueda para encontrar archivos de prueba.
  // En este caso, busca cualquier archivo `.spec.ts` dentro de la carpeta `test/`.
  testMatch: ['**/test/**/*.spec.ts'],

  // Indica qué archivos deben ser incluidos para el análisis de cobertura.
  // Aquí se toman todos los archivos TypeScript o JavaScript dentro de `src/`.
  collectCoverageFrom: ['src/**/*.(t|j)s'],

  // Define la carpeta donde Jest guardará los reportes de cobertura.
  coverageDirectory: 'coverage',

  // Define cómo Jest debe transformar los archivos antes de ejecutarlos.
  // En este caso, cualquier archivo `.ts` o `.js` se transforma usando `ts-jest`.
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
};
