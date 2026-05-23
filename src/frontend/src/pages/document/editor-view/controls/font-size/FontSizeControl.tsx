import { Text } from '@radix-ui/themes';
import { LatexMacro, useEditor } from '../../../../../shared/components/latex-editor/EditorContext';
import { NonFocusStealingDropdown } from '../../../../../shared/components/non-focus-stealing-dropdown/NonFocusStealingDropdown';

interface FontSizeMapping {
  latexMacroName: string;
  friendlyName: string;
  fontSize: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
}

const fontSizes: FontSizeMapping[] = [
  { latexMacroName: 'Huge', friendlyName: 'Giant', fontSize: '9' },
  { latexMacroName: 'huge', friendlyName: 'Huge', fontSize: '8' },
  { latexMacroName: 'LARGE', friendlyName: 'Larger', fontSize: '7' },
  { latexMacroName: 'Large', friendlyName: 'Bold', fontSize: '6' },
  { latexMacroName: 'large', friendlyName: 'Emphasis', fontSize: '5' },
  { latexMacroName: 'small', friendlyName: 'Compact', fontSize: '4' },
  { latexMacroName: 'footnotesize', friendlyName: 'Caption', fontSize: '3' },
  { latexMacroName: 'scriptsize', friendlyName: 'Tiny', fontSize: '2' },
  { latexMacroName: 'tiny', friendlyName: 'Micro', fontSize: '1' },
];

const FontSizeControl = () => {
  const { toggleSurroundingMacro } = useEditor();

  function handleSelected(macroName: string) {
    toggleSurroundingMacro(new LatexMacro(macroName, true));
  }

  return (
    <NonFocusStealingDropdown name="Font Size" onOptionSelected={handleSelected}>
      {fontSizes.map(({ latexMacroName, friendlyName, fontSize }) => (
        <NonFocusStealingDropdown.Option value={latexMacroName} key={latexMacroName}>
          <Text size={fontSize}>{friendlyName}</Text>
        </NonFocusStealingDropdown.Option>
      ))}
    </NonFocusStealingDropdown>
  );
};

export default FontSizeControl;
