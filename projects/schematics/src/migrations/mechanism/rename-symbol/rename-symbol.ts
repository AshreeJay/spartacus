import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { ImportDeclarationStructure } from 'ts-morph';
import { RenamedSymbol } from '../../../shared/utils/file-utils';
import { createProgram } from '../../../shared/utils/program';
import { getProjectTsConfigPaths } from '../../../shared/utils/project-tsconfig-paths';
import { getDefaultProjectNameFromWorkspace } from '../../../shared/utils/workspace-utils';

export function migrateRenamedSymbols(
  tree: Tree,
  context: SchematicContext,
  renamedSymbols: RenamedSymbol[]
): Tree {
  console.log('migrateRenamedSymbols');
  context.logger.info('Checking renamed symbols...');

  const project = getDefaultProjectNameFromWorkspace(tree);
  const { buildPaths } = getProjectTsConfigPaths(tree, project);
  const basePath = process.cwd();

  for (const tsconfigPath of buildPaths) {
    const { appSourceFiles } = createProgram(tree, basePath, tsconfigPath);

    appSourceFiles.map((sourceFile) => {
      const importDeclarationStructures: ImportDeclarationStructure[] = [];
      sourceFile.getImportDeclarations().forEach((id) => {
        id.getImportClause()
          ?.getNamedImports()
          .forEach((namedImport) => {
            const renamedSymbol = renamedSymbols.find(
              (_) =>
                _.previousNode === namedImport.getName() &&
                _.previousImportPath ===
                  id
                    .getModuleSpecifier()
                    .getText()
                    .substr(1, id.getModuleSpecifier().getText().length - 2)
            );
            if (renamedSymbol) {
              importDeclarationStructures.push({
                namedImports: [renamedSymbol.newNode],
                moduleSpecifier: renamedSymbol.newImportPath,
              } as ImportDeclarationStructure);
              const importedClause = id.getImportClause();

              if (importedClause) {
                if (importedClause.getNamedImports().length > 1) {
                  namedImport.remove();
                } else {
                  id.remove();
                }
              }
            }
          });
      });

      if (importDeclarationStructures.length) {
        sourceFile.addImportDeclarations(importDeclarationStructures);

        sourceFile.organizeImports();
        sourceFile.saveSync();
      }
    });
  }

  return tree;
}
