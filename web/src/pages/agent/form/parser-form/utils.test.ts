import { ParseDocumentType } from '@/components/layout-recognize-form-field';
import { FileType, ImageParseMethod } from '../../constant/pipeline';
import { getInitialParseMethod, isForeignParseMethod } from './utils';

describe('parser-form utils', () => {
  describe('getInitialParseMethod', () => {
    it('returns ocr for image', () => {
      expect(getInitialParseMethod(FileType.Image)).toBe(ImageParseMethod.OCR);
    });

    it('returns DeepDOC for pdf/spreadsheet/powerpoint', () => {
      expect(getInitialParseMethod(FileType.PDF)).toBe(
        ParseDocumentType.DeepDOC,
      );
      expect(getInitialParseMethod(FileType.Spreadsheet)).toBe(
        ParseDocumentType.DeepDOC,
      );
      expect(getInitialParseMethod(FileType.PowerPoint)).toBe(
        ParseDocumentType.DeepDOC,
      );
    });

    it('returns empty string for file types without a parse method', () => {
      expect(getInitialParseMethod(FileType.Email)).toBe('');
    });
  });

  describe('isForeignParseMethod', () => {
    it('treats a static method from another file type as foreign', () => {
      // The bug: switching pdf -> image left DeepDOC in parse_method
      expect(
        isForeignParseMethod(FileType.Image, ParseDocumentType.DeepDOC),
      ).toBe(true);
      expect(isForeignParseMethod(FileType.PDF, ImageParseMethod.OCR)).toBe(
        true,
      );
    });

    it('accepts the file type’s own initial method', () => {
      expect(isForeignParseMethod(FileType.Image, ImageParseMethod.OCR)).toBe(
        false,
      );
      expect(
        isForeignParseMethod(FileType.PDF, ParseDocumentType.DeepDOC),
      ).toBe(false);
    });

    it('accepts every static method the file type offers', () => {
      // The bug: selecting Docling for PDF bounced back to DeepDOC because
      // anything other than the initial method was treated as foreign.
      expect(isForeignParseMethod(FileType.PDF, ParseDocumentType.Docling)).toBe(
        false,
      );
      expect(
        isForeignParseMethod(FileType.PDF, ParseDocumentType.OpenDataLoader),
      ).toBe(false);
      expect(
        isForeignParseMethod(FileType.PDF, ParseDocumentType.TCADPParser),
      ).toBe(false);
      expect(
        isForeignParseMethod(FileType.PDF, ParseDocumentType.MonkeyOCRv2),
      ).toBe(false);
      expect(
        isForeignParseMethod(
          FileType.Spreadsheet,
          ParseDocumentType.TCADPParser,
        ),
      ).toBe(false);
      expect(
        isForeignParseMethod(FileType.PowerPoint, ParseDocumentType.TCADPParser),
      ).toBe(false);
    });

    it('treats a static method the file type does not offer as foreign', () => {
      expect(isForeignParseMethod(FileType.Spreadsheet, 'Docling')).toBe(true);
      expect(isForeignParseMethod(FileType.PowerPoint, 'ocr')).toBe(true);
    });

    it('never treats an LLM model id as foreign', () => {
      expect(isForeignParseMethod(FileType.PDF, 'gpt-4o@OpenAI')).toBe(false);
      expect(isForeignParseMethod(FileType.Image, 'deepseek-v3@Moonshot')).toBe(
        false,
      );
    });

    it('ignores empty and non-string values', () => {
      expect(isForeignParseMethod(FileType.Image, '')).toBe(false);
      expect(isForeignParseMethod(FileType.Image, undefined)).toBe(false);
      expect(isForeignParseMethod(FileType.Image, null)).toBe(false);
    });
  });
});
