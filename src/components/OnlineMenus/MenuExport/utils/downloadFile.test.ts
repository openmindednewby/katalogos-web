import { buildExportFilename } from './downloadFile';
import ExportFormat from '../../../../shared/enums/ExportFormat';

describe('buildExportFilename', () => {
  it('builds filename with sanitized menu name and CSV extension', () => {
    const result = buildExportFilename('My Menu', ExportFormat.Csv);
    expect(result).toMatch(/^my-menu-export-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('builds filename with JSON extension', () => {
    const result = buildExportFilename('My Menu', ExportFormat.Json);
    expect(result).toMatch(/^my-menu-export-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('sanitizes special characters from menu name', () => {
    const result = buildExportFilename('Caf\u00e9 Menu!!! @#$', ExportFormat.Csv);
    expect(result).toMatch(/^caf-menu-export-/);
  });

  it('uses default name for empty menu name', () => {
    const result = buildExportFilename('', ExportFormat.Csv);
    expect(result).toMatch(/^menu-export-/);
  });

  it('uses default name for whitespace-only menu name', () => {
    const result = buildExportFilename('   ', ExportFormat.Csv);
    expect(result).toMatch(/^menu-export-/);
  });

  it('strips leading and trailing hyphens from sanitized name', () => {
    const result = buildExportFilename('---Test---', ExportFormat.Csv);
    expect(result).toMatch(/^test-export-/);
  });

  it('collapses consecutive special characters into single hyphen', () => {
    const result = buildExportFilename('Menu   &   Items', ExportFormat.Csv);
    expect(result).toMatch(/^menu-items-export-/);
  });
});
