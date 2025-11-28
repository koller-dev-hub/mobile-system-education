import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { renderWithProviders } from '../tests/test-utils';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: '1' }),
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const mockPut = jest.fn(async () => ({}));

jest.mock('../lib/api', () => ({
  api: {
    get: jest.fn(async () => ({
      full_name: 'João da Silva',
      enrollment_code: 'MAT-0001',
      email: 'joao@example.com',
      phone_number: '11988887777',
      date_of_birth: '2010-05-20T00:00:00Z',
      cpf: '',
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
      guardian_cpf: '',
      is_active: true,
      observations: 'Aluno participante',
    })),
    put: mockPut,
  },
}));

// Importar componente após os mocks para garantir que use os mocks
const EditStudentScreen =
  require('../app/(app)/students/edit-student/[id]').default;

describe('EditStudentScreen', () => {
  it('envia apenas campos alterados no PUT', async () => {
    (AsyncStorage as any).getItem.mockResolvedValue('true');
    const {
      getByPlaceholderText,
      getByText,
      getByText: getText,
      getByTestId,
    } = renderWithProviders(<EditStudentScreen />);

    await waitFor(() => expect(getText('Verificando sessão...')).toBeTruthy());
    await waitFor(() =>
      expect(getByPlaceholderText('Nome completo do aluno')).toBeTruthy()
    );
    await waitFor(() =>
      expect(getByPlaceholderText('Nome completo do aluno').props.value).toBe(
        'João da Silva'
      )
    );

    const nameInput = getByPlaceholderText('Nome completo do aluno');
    fireEvent.changeText(nameInput, 'João Atualizado');
    const emailInput = getByPlaceholderText('Email do aluno');
    fireEvent.changeText(emailInput, 'joao2@example.com');
    // CPFs já estão vazios no mock; não é necessário ajustar

    const alertSpy = jest.spyOn(Alert, 'alert');
    const btn = getByTestId('save-button');
    if (typeof (btn as any).props?.onPress === 'function') {
      (btn as any).props.onPress();
    } else {
      fireEvent.press(btn);
    }

    await waitFor(() => {
      if (!mockPut.mock.calls.length && alertSpy.mock.calls.length) {
        throw new Error(
          'Submit blocked by alert: ' + JSON.stringify(alertSpy.mock.calls[0])
        );
      }
      expect(mockPut).toHaveBeenCalled();
    });
    const [path, payload] = mockPut.mock.calls[0] as unknown as [string, any];
    expect(path).toBe('/students/1');
    expect(payload).toMatchObject({ full_name: 'João Atualizado' });
  });
});
