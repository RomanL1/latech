import { RadioCards } from '@radix-ui/themes';

export function TemplateSelection() {
  return (
    <RadioCards.Root>
      <RadioCards.Item value="1">Template 1</RadioCards.Item>
      <RadioCards.Item value="2">Template 2</RadioCards.Item>
      <RadioCards.Item value="3">Template 3</RadioCards.Item>
      <RadioCards.Item value="4">Template 4</RadioCards.Item>
      <RadioCards.Item value="5">Template 5</RadioCards.Item>
    </RadioCards.Root>
  );
}
