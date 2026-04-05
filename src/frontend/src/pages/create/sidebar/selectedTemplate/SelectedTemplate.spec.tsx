import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DocumentTemplate } from '../../../../features/templates/template';
import { SelectedTemplate } from './SelectedTemplate';

describe('SelectedTemplate', () => {
  it('should display loading skeleton when template is null', () => {
    render(<SelectedTemplate template={null} />);

    const skeleton = screen.getByTestId('selectedTemplateSkeleton');

    expect(skeleton).toBeInTheDocument();
  });

  it('should not display a loading skeleton when template is provided', () => {
    const template: DocumentTemplate = {
      templateId: '123',
      name: 'my cool template',
      description: 'this is my cool template',
    };

    render(<SelectedTemplate template={template} />);

    const skeleton = screen.queryByTestId('selectedTemplateSkeleton');
    expect(skeleton).toBeNull();
  });

  it('should display template information', () => {
    const template: DocumentTemplate = {
      templateId: '123',
      name: 'my cool template',
      description: 'this is my cool template',
    };

    render(<SelectedTemplate template={template} />);

    const name = screen.getByTestId('selectedTemplateName');
    const description = screen.getByTestId('selectedTemplateDescription');

    expect(name).toHaveTextContent('my cool template');
    expect(description).toHaveTextContent('this is my cool template');
  });
});
