import { Button, DropdownMenu, Text } from '@radix-ui/themes';

const FontsizeControl = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="soft" size="1">
          Font Size
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size="2" variant="soft">
        <DropdownMenu.Item>
          <Text size="3">normal size</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="1">tiny</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="2">scriptsize</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="2">footnotesize</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="3">small</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="4">large</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="4">Large</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="4">LARGE</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="6">huge</Text>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <Text size="6">Huge</Text>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};

export default FontsizeControl;
