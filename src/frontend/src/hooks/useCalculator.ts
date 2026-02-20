import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useCalculator() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const inputNumber = useMutation({
    mutationFn: async (number: number) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.inputNumber(number);
    },
  });

  const calculate = useMutation({
    mutationFn: async (operation: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.calculate(operation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result'] });
    },
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.clear();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['result'] });
    },
  });

  return {
    inputNumber,
    calculate,
    clear,
    isCalculating: calculate.isPending,
    isClearing: clear.isPending,
  };
}
