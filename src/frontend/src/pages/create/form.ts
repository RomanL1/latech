import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormContext } from 'react-hook-form';
import z from 'zod';

const validationSchema = z
  .object({
    documentName: z.string().min(1),
    password: z.string().min(1).nullable(),
    templateId: z.string().nullable(),
  })
  .refine(({ templateId }) => Boolean(templateId));

type FormValues = z.infer<typeof validationSchema>;

export function useDocumentCreationForm() {
  return useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      documentName: '',
      password: null,
      templateId: null,
    },
  });
}

export function useDocumentCreationFormContext() {
  return useFormContext<FormValues>();
}
