export const router = {
  back: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
};

export const useLocalSearchParams = () => ({ id: '1' });
