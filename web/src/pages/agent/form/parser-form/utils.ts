import { ParseDocumentType } from '@/components/layout-recognize-form-field';
import {
  FileType,
  FileTypeDefaultModelFieldMap,
  ImageParseMethod,
  initialParserValues,
} from '../../constant/pipeline';

export function buildFieldNameWithPrefix(name: string, prefix: string) {
  return `${prefix}.${name}`;
}

export function withDefaultParserModels(
  formValues: Record<string, any>,
  defaultModelDictionary: Record<string, string>,
) {
  const setups = formValues?.setups;
  if (!Array.isArray(setups)) {
    return formValues;
  }

  return {
    ...formValues,
    setups: setups.map((setup) => {
      const field = FileTypeDefaultModelFieldMap[setup?.fileFormat as FileType];
      const modelId = field ? defaultModelDictionary[field] : '';
      if (!modelId || setup?.vlm?.llm_id) {
        return setup;
      }
      return { ...setup, vlm: { ...setup?.vlm, llm_id: modelId } };
    }),
  };
}

export function getInitialParseMethod(fileType: FileType): string {
  const setup = initialParserValues.setups.find(
    (x) => x.fileFormat === fileType,
  );
  return setup?.parse_method ?? '';
}

// Static parse-method options offered for PDF, mirroring the default
// optionsWithoutLLM list of LayoutRecognizeFormField.
// Note: ParseDocumentType is a const enum — list members explicitly instead of
// Object.values, which is not allowed on const enums (TS2475).
const PdfStaticParseMethods = [
  ParseDocumentType.DeepDOC,
  ParseDocumentType.PlainText,
  ParseDocumentType.Docling,
  ParseDocumentType.OpenDataLoader,
  ParseDocumentType.TCADPParser,
  ParseDocumentType.MonkeyOCRv2,
];

// Per file type, the static parse methods the form actually offers. This must
// stay in sync with the optionsWithoutLLM lists in the file-type form fields:
// spreadsheet and PowerPoint only offer DeepDOC and TCADP Parser; image only
// offers OCR. Every listed method is a legitimate saved value — a previous
// version of this check treated any static value other than the file type's
// initial method as foreign and silently reset it on remount, which made
// choices like PDF → Docling bounce back to DeepDOC.
const AllowedStaticParseMethodsByFileType: Partial<
  Record<FileType, string[]>
> = {
  [FileType.PDF]: PdfStaticParseMethods,
  [FileType.Spreadsheet]: [
    ParseDocumentType.DeepDOC,
    ParseDocumentType.TCADPParser,
  ],
  [FileType.PowerPoint]: [
    ParseDocumentType.DeepDOC,
    ParseDocumentType.TCADPParser,
  ],
  [FileType.Image]: [ImageParseMethod.OCR],
};

// All static parse-method values across all file types. LLM model ids from
// the model tree are never in this set, so a user-picked model is never
// treated as foreign.
const KnownStaticParseMethods = new Set<string>([
  ...PdfStaticParseMethods,
  ImageParseMethod.OCR,
]);

export function isForeignParseMethod(
  fileType: FileType,
  value: unknown,
): value is string {
  if (typeof value !== 'string' || !KnownStaticParseMethods.has(value)) {
    return false;
  }
  const allowed = AllowedStaticParseMethodsByFileType[fileType];
  return allowed ? !allowed.includes(value) : true;
}
