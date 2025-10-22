import { z } from 'zod';

export const familyMemberSchema = z.object({
  name: z.string().min(1, 'required'),
  birthdate: z.string().min(1, 'required'),
  document: z.string().optional(),
  postalCode: z.string().optional(),
  addressNumber: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  avatar: z.string().optional(),
  medicalHistory: z.string().optional(),
  limitations: z.string().optional(),
  allergies: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
  imc: z.string().optional(),
  needs: z.string().optional(),
});

export const caregiverSchema = z.object({
  name: z.string().min(1, 'required'),
  relation: z.string().optional(),
  phone: z.string().optional(),
});

export const familyFormSchema = z.object({
  postalCode: z.string().optional(),
  address: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  primaryCaregiver: z.string().optional(),
  primaryCaregiverRelationship: z.string().optional(),
  primaryCaregiverRelationshipDetail: z.string().optional(),
  caregiverPhone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Formato: (00) 00000-0000')
    .optional(),
  careFocus: z.string().optional(),
  notes: z.string().optional(),
  members: z.array(familyMemberSchema).min(1, 'required'),
  caregivers: z.array(caregiverSchema).min(1, 'required'),
});

export type FamilyFormValues = z.infer<typeof familyFormSchema>;

export const createEmptyMember = (): FamilyFormValues['members'][number] => ({
  name: '',
  birthdate: '',
  document: '',
  postalCode: '',
  addressNumber: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  avatar: '',
  medicalHistory: '',
  limitations: '',
  allergies: '',
  weight: '',
  height: '',
  imc: '',
  needs: '',
});

export const initialFamilyFormValues: FamilyFormValues = {
  postalCode: '',
  address: '',
  neighborhood: '',
  city: '',
  state: '',
  primaryCaregiver: '',
  primaryCaregiverRelationship: '',
  primaryCaregiverRelationshipDetail: '',
  caregiverPhone: '',
  careFocus: '',
  notes: '',
  members: [createEmptyMember()],
  caregivers: [{ name: '', relation: '', phone: '' }],
};

export type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};
