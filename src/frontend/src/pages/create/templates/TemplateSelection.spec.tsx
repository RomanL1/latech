import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider } from 'react-hook-form';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import * as templateApi from '../../../features/templates/api';
import type { DocumentTemplate } from '../../../features/templates/template';
import { useDocumentCreationForm } from '../form';
import { TemplateSelection } from './TemplateSelection';

describe('Template Selection', () => {
  beforeAll(() => mockTemplateApi());

  it('should display loading skeletons when loading templates', () => {
    render(<ComponentUnderTest />);

    const skeletons = screen.getAllByTestId('templateCardSkeleton');

    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should hide loading skeletons when templates have loaded', async () => {
    vi.useFakeTimers();

    render(<ComponentUnderTest />);
    await vi.advanceTimersByTimeAsync(3_000);

    const skeletons = screen.queryAllByTestId('templateCardSkeleton');
    expect(skeletons.length).toBe(0);

    vi.useRealTimers();
  });

  it('should display loaded templates', async () => {
    vi.useFakeTimers();

    render(<ComponentUnderTest />);
    await vi.advanceTimersByTimeAsync(3_000);

    const templateCards = screen.getAllByTestId('templateCard');
    const templateNames = screen.getAllByTestId('templateName');
    const templateDescriptions = screen.getAllByTestId('templateDescription');

    expect(templateCards.length).toBe(3);
    expect(templateNames[0]).toHaveTextContent('One');
    expect(templateNames[1]).toHaveTextContent('Two');
    expect(templateNames[2]).toHaveTextContent('Three');
    expect(templateDescriptions[0]).toHaveTextContent('Template one');
    expect(templateDescriptions[1]).toHaveTextContent('Template two');
    expect(templateDescriptions[2]).toHaveTextContent('Template three');

    vi.useRealTimers();
  });

  it('should select the first template by default', async () => {
    vi.useFakeTimers();

    render(<ComponentUnderTest />);
    await vi.advanceTimersByTimeAsync(3_000);

    const templateCards = screen.getAllByTestId('templateCard');
    expect(templateCards[0]).toBeChecked();
    expect(templateCards[1]).not.toBeChecked();
    expect(templateCards[2]).not.toBeChecked();

    vi.useRealTimers();
  });

  it('should switch selection when other template is clicked', async () => {
    vi.useFakeTimers();

    render(<ComponentUnderTest />);
    await vi.advanceTimersByTimeAsync(3_000);

    vi.useRealTimers();

    const templateCards = screen.getAllByTestId('templateCard');
    await userEvent.click(templateCards[1]);

    await waitFor(() => {
      expect(templateCards[0]).not.toBeChecked();
      expect(templateCards[1]).toBeChecked();
      expect(templateCards[2]).not.toBeChecked();
    });
  });

  it('should call onTemplateSelected with default template', async () => {
    vi.useFakeTimers();

    const callback: (template: DocumentTemplate) => unknown = vi.fn();
    render(<ComponentUnderTest onTemplateSelected={callback} />);
    await vi.advanceTimersByTimeAsync(3_000);

    vi.useRealTimers();

    expect(callback).toHaveBeenCalledExactlyOnceWith({
      templateId: '123',
      name: 'One',
      description: 'Template one',
    } as DocumentTemplate);
  });

  it('should call onTemplateSelected when template is clicked', async () => {
    vi.useFakeTimers();

    const callback: (template: DocumentTemplate) => unknown = vi.fn();
    render(<ComponentUnderTest onTemplateSelected={callback} />);
    await vi.advanceTimersByTimeAsync(3_000);

    vi.useRealTimers();

    const templateCards = screen.getAllByTestId('templateCard');
    await userEvent.click(templateCards[1]);

    expect(callback).toHaveBeenLastCalledWith({
      templateId: '456',
      name: 'Two',
      description: 'Template two',
    } as DocumentTemplate);
  });
});

interface TestProps {
  onTemplateSelected?: (template: DocumentTemplate) => unknown;
}

function ComponentUnderTest({ onTemplateSelected = () => {} }: TestProps) {
  const form = useDocumentCreationForm();
  return (
    <QueryClientProvider client={new QueryClient()}>
      <FormProvider {...form}>
        <TemplateSelection onTemplateSelected={onTemplateSelected} />
      </FormProvider>
    </QueryClientProvider>
  );
}

const fakeTemplates: DocumentTemplate[] = [
  { templateId: '123', name: 'One', description: 'Template one' },
  { templateId: '456', name: 'Two', description: 'Template two' },
  { templateId: '789', name: 'Three', description: 'Template three' },
];

function mockTemplateApi() {
  const delayInMilliseconds = 2_000;

  vi.spyOn(templateApi, 'useTemplatesQuery').mockImplementation(() => {
    return useQuery({
      queryKey: ['templates'],
      queryFn: () => {
        return new Promise<DocumentTemplate[]>((resolve) => {
          setTimeout(() => {
            resolve(fakeTemplates);
          }, delayInMilliseconds);
        });
      },
    });
  });
}
