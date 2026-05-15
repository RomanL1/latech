import { Text } from '@radix-ui/themes';
import { NonFocusStealingDropdown } from '../../../../../shared/components/non-focus-stealing-dropdown/NonFocusStealingDropdown';

const HeadingControl = () => {
  function handleSelected(value: string | number) {
    console.log('handle option selected', value);
  }

  return (
    <NonFocusStealingDropdown name="Headings" onOptionSelected={handleSelected}>
      <NonFocusStealingDropdown.Option value={1}>
        <Text size="8">Heading 1</Text>
      </NonFocusStealingDropdown.Option>
      <NonFocusStealingDropdown.Option value={2}>
        <Text size="6">Heading 2</Text>
      </NonFocusStealingDropdown.Option>
      <NonFocusStealingDropdown.Option value={3}>
        <Text size="4">Heading 3</Text>
      </NonFocusStealingDropdown.Option>
      <NonFocusStealingDropdown.Option value={4}>
        <Text size="2">Heading 4</Text>
      </NonFocusStealingDropdown.Option>
    </NonFocusStealingDropdown>
  );
};

export default HeadingControl;
