import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCalculator } from '../hooks/useCalculator';
import { Loader2, Delete } from 'lucide-react';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [lastAction, setLastAction] = useState<'number' | 'operator' | 'equals' | null>(null);

  const { inputNumber, calculate, clear, isCalculating, isClearing } = useCalculator();

  const handleNumberClick = (num: string) => {
    setLastAction('number');
    
    if (waitingForOperand || lastAction === 'equals') {
      setDisplay(num);
      setCurrentInput(num);
      setWaitingForOperand(false);
      if (lastAction === 'equals') {
        setExpression('');
      }
    } else {
      const newDisplay = display === '0' ? num : display + num;
      setDisplay(newDisplay);
      setCurrentInput(newDisplay);
    }
  };

  const handleOperationClick = async (op: string) => {
    const value = parseFloat(currentInput || display);
    
    if (!isNaN(value)) {
      await inputNumber.mutateAsync(value);
    }

    // If continuing after equals, start new expression
    if (lastAction === 'equals') {
      setExpression(`${display} ${getOperationSymbol(op)}`);
    } else if (operation && !waitingForOperand) {
      // Chain operations
      const result = await calculate.mutateAsync(operation);
      setDisplay(result.toString());
      setExpression(`${result} ${getOperationSymbol(op)}`);
    } else {
      // Start new expression
      setExpression(`${display} ${getOperationSymbol(op)}`);
    }

    setOperation(op);
    setWaitingForOperand(true);
    setLastAction('operator');
  };

  const handleEquals = async () => {
    if (operation && currentInput) {
      const value = parseFloat(currentInput);
      if (!isNaN(value)) {
        await inputNumber.mutateAsync(value);
        const result = await calculate.mutateAsync(operation);
        setExpression(`${expression} ${display}`);
        setDisplay(result.toString());
        setCurrentInput(result.toString());
        setOperation(null);
        setWaitingForOperand(true);
        setLastAction('equals');
      }
    }
  };

  const handleClear = async () => {
    await clear.mutateAsync();
    setDisplay('0');
    setCurrentInput('');
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
    setLastAction(null);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setCurrentInput(newDisplay);
    } else {
      setDisplay('0');
      setCurrentInput('0');
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand || lastAction === 'equals') {
      setDisplay('0.');
      setCurrentInput('0.');
      setWaitingForOperand(false);
      setLastAction('number');
      if (lastAction === 'equals') {
        setExpression('');
      }
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
      setCurrentInput(display + '.');
    }
  };

  const handleToggleSign = () => {
    const value = parseFloat(display);
    if (!isNaN(value) && value !== 0) {
      const newValue = (value * -1).toString();
      setDisplay(newValue);
      setCurrentInput(newValue);
    }
  };

  const handlePercentage = () => {
    const value = parseFloat(display);
    if (!isNaN(value)) {
      const newValue = (value / 100).toString();
      setDisplay(newValue);
      setCurrentInput(newValue);
    }
  };

  const isLoading = isCalculating || isClearing;

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardContent className="p-6">
        {/* Two-line display */}
        <div className="mb-6">
          <div className="bg-card-display rounded-2xl p-6 text-right border border-border min-h-[140px] flex flex-col justify-end">
            {/* Expression line */}
            <div className="text-lg text-muted-foreground mb-2 h-7 overflow-hidden text-ellipsis">
              {expression || '\u00A0'}
            </div>
            {/* Current value line */}
            <div className="text-5xl font-semibold text-foreground break-all leading-tight">
              {display}
            </div>
          </div>
        </div>

        {/* Button grid - Android style layout */}
        <div className="grid grid-cols-4 gap-2">
          {/* Top row: AC, Backspace, %, ÷ */}
          <Button
            variant="secondary"
            size="lg"
            className="h-16 text-xl font-semibold transition-all active:scale-95 active:shadow-inner"
            onClick={handleClear}
            disabled={isLoading}
          >
            {isClearing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'AC'}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-16 text-xl font-semibold transition-all active:scale-95 active:shadow-inner"
            onClick={handleBackspace}
            disabled={isLoading || display === '0'}
          >
            <Delete className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="h-16 text-xl font-semibold transition-all active:scale-95 active:shadow-inner"
            onClick={handlePercentage}
            disabled={isLoading}
          >
            %
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className={`h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner ${
              operation === 'divide' && lastAction === 'operator' ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => handleOperationClick('divide')}
            disabled={isLoading}
          >
            ÷
          </Button>

          {/* Row 2: 7, 8, 9, × */}
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('7')}
            disabled={isLoading}
          >
            7
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('8')}
            disabled={isLoading}
          >
            8
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('9')}
            disabled={isLoading}
          >
            9
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className={`h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner ${
              operation === 'multiply' && lastAction === 'operator' ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => handleOperationClick('multiply')}
            disabled={isLoading}
          >
            ×
          </Button>

          {/* Row 3: 4, 5, 6, − */}
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('4')}
            disabled={isLoading}
          >
            4
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('5')}
            disabled={isLoading}
          >
            5
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('6')}
            disabled={isLoading}
          >
            6
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className={`h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner ${
              operation === 'subtract' && lastAction === 'operator' ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => handleOperationClick('subtract')}
            disabled={isLoading}
          >
            −
          </Button>

          {/* Row 4: 1, 2, 3, + */}
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('1')}
            disabled={isLoading}
          >
            1
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('2')}
            disabled={isLoading}
          >
            2
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('3')}
            disabled={isLoading}
          >
            3
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className={`h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner ${
              operation === 'add' && lastAction === 'operator' ? 'bg-accent text-accent-foreground' : ''
            }`}
            onClick={() => handleOperationClick('add')}
            disabled={isLoading}
          >
            +
          </Button>

          {/* Bottom row: ±, 0 (spans 2), ., = */}
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={handleToggleSign}
            disabled={isLoading}
          >
            ±
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="col-span-2 h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={() => handleNumberClick('0')}
            disabled={isLoading}
          >
            0
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-2xl font-semibold transition-all active:scale-95 active:shadow-inner hover:bg-muted"
            onClick={handleDecimal}
            disabled={isLoading}
          >
            .
          </Button>

          {/* Equals button - full width bottom */}
          <Button
            variant="default"
            size="lg"
            className="col-span-4 h-16 text-2xl font-semibold bg-accent hover:bg-accent/90 text-accent-foreground transition-all active:scale-[0.98] active:shadow-inner"
            onClick={handleEquals}
            disabled={isLoading || !operation}
          >
            {isCalculating ? <Loader2 className="h-6 w-6 animate-spin" /> : '='}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getOperationSymbol(operation: string): string {
  switch (operation) {
    case 'add':
      return '+';
    case 'subtract':
      return '−';
    case 'multiply':
      return '×';
    case 'divide':
      return '÷';
    default:
      return '';
  }
}
