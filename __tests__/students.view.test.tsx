import AsyncStorage from '@react-native-async-storage/async-storage';
import { waitFor } from '@testing-library/react-native';
import React from 'react';
import ViewStudentScreen from '../app/(app)/students/list-student/[id]';
import { renderWithProviders } from '../tests/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../lib/api');
const { api } = require('../lib/api');
api.get.mockResolvedValue({
  full_name: 'João da Silva',
  enrollment_code: 'MAT-0001',
  email: 'joao@example.com',
  phone_number: '11988887777',
  date_of_birth: '2010-05-20T00:00:00Z',
  cpf: '12345678901',
  rg: '1234567',
  address: 'Rua Um, 123',
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01234000',
  country: 'Brasil',
  school_id: 10,
  school_name: 'Escola Modelo',
  school_code: 'ESC-123',
  grade: '5º ano',
  class_room: 'A',
  shift: 'morning',
  enrollment_date: '2020-02-01T00:00:00Z',
  guardian_name: 'Maria Silva',
  guardian_phone: '11977776666',
  guardian_email: 'maria@example.com',
  guardian_cpf: '98765432100',
  is_active: true,
  observations: 'Aluno participante',
});

describe('ViewStudentScreen', () => {
  it('renderiza cabeçalho e mostra código da escola', async () => {
    (AsyncStorage as any).getItem.mockResolvedValue('true');
    const { getByText, getByDisplayValue } = renderWithProviders(
      <ViewStudentScreen />
    );

    await waitFor(() =>
      expect(getByText('Verificando sessão...')).toBeTruthy()
    );
    await waitFor(() => expect(getByText('Aluno')).toBeTruthy());
    expect(getByText('Código da Escola')).toBeTruthy();
    await waitFor(() => expect(getByDisplayValue('ESC-123')).toBeTruthy());
  });
});
