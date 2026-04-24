import { Button, DropdownMenu, Text } from '@radix-ui/themes';

const HeadingControl = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft" size="1">
          Headings
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="2" variant="soft">
        <DropdownMenu.Item>
          <Text size="2">Normal Text</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="5">Part</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="5">Chapter</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="4">Section</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="3">SubSection</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="2">SubSubSection</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="2">Paragraph</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="1">Sub-Paragraph</Text>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default HeadingControl;
