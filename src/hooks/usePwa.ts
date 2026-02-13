import { useRegisterSW } from 'virtual:pwa-register/react';

export const usePwa = () => {
  useRegisterSW({
    onRegisteredSW() {
      // Intentionally silent for MVP.
    }
  });
};
