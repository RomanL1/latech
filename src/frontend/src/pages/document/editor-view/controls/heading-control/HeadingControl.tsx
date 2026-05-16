import { Text } from '@radix-ui/themes';
import { NonFocusStealingDropdown } from '../../../../../shared/components/non-focus-stealing-dropdown/NonFocusStealingDropdown';

interface FontSizeMapping {
  latexMacro: string;
  friendlyName: string;
  fontSize: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
}

const fontSizes: FontSizeMapping[] = [
  { latexMacro: '\\Huge', friendlyName: 'Giant', fontSize: '9' },
  { latexMacro: '\\huge', friendlyName: 'Huge', fontSize: '8' },
  { latexMacro: '\\LARGE', friendlyName: 'Larger', fontSize: '7' },
  { latexMacro: '\\Large', friendlyName: 'Bold', fontSize: '6' },
  { latexMacro: '\\large', friendlyName: 'Emphasis', fontSize: '5' },
  { latexMacro: '\\small', friendlyName: 'Compact', fontSize: '4' },
  { latexMacro: '\\footnotesize', friendlyName: 'Caption', fontSize: '3' },
  { latexMacro: '\\scriptsize', friendlyName: 'Tiny', fontSize: '2' },
  { latexMacro: '\\tiny', friendlyName: 'Micro', fontSize: '1' },
];

const HeadingControl = () => {
  function handleSelected(value: string) {
    console.log('handle option selected', value);
  }

  return (
    <NonFocusStealingDropdown name="Headings" onOptionSelected={handleSelected}>
      {fontSizes.map(({ latexMacro, friendlyName, fontSize }) => (
        <NonFocusStealingDropdown.Option value={latexMacro} key={latexMacro}>
          <Text size={fontSize}>{friendlyName}</Text>
        </NonFocusStealingDropdown.Option>
      ))}
    </NonFocusStealingDropdown>
  );
};

export default HeadingControl;
