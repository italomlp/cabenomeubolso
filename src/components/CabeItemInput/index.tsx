import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { Input } from 'react-native-elements';

import colors from 'styles/colors';

const emptyValue = {
  name: '',
  quantity: (undefined as unknown) as number,
};

type Props = {
  onClickSave: (data: typeof emptyValue) => void;
  customValue: typeof emptyValue | null;
};

const CabeItemInput: React.FC<Props> = ({
  onClickSave,
  customValue,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState<{
    name: string;
    quantity: number;
  }>(emptyValue);
  const inputRef = useRef<Input>(null);

  useEffect(() => {
    if (customValue) {
      setInputValue(customValue);
      setCurrentStep(0);
      if (inputRef.current) {
        if (!inputRef.current.isFocused()) {
          inputRef.current.focus();
        }
      }
    }
  }, [customValue, inputRef.current]);

  const handleChangeText = useCallback(
    value => {
      let newInputValue;
      if (currentStep === 0) newInputValue = { ...inputValue, name: value };
      else {
        const quantity = Number.parseInt(value, 10);
        if (value && !quantity) {
          return;
        }
        newInputValue = {
          ...inputValue,
          quantity,
        };
      }
      setInputValue(newInputValue);
    },
    [currentStep, inputValue],
  );

  const addButtonDisabled = useMemo(() => {
    if (currentStep === 0) {
      return !inputValue.name;
    }

    return !inputValue.quantity;
  }, [currentStep, inputValue]);

  const inputCurrentValue = useMemo(() => {
    if (currentStep === 0) {
      return inputValue.name;
    }

    if (inputValue.quantity && inputValue.quantity.toString()) {
      return inputValue.quantity.toString();
    }

    return '';
  }, [inputValue, currentStep]);

  const handleSave = useCallback(() => {
    const value = { ...inputValue };
    onClickSave(value);
    setInputValue(emptyValue);
    setCurrentStep(0);
  }, [onClickSave, inputValue]);

  return (
    <Input
      ref={inputRef}
      autoCorrect={false}
      autoCapitalize="sentences"
      keyboardType={currentStep === 0 ? 'default' : 'number-pad'}
      autoFocus
      value={inputCurrentValue}
      onChangeText={handleChangeText}
      placeholder={currentStep === 0 ? 'Nome do item' : 'Quantidade'}
      leftIcon={{
        name: 'arrow-back',
        onPress: () => {
          setCurrentStep(0);
        },
        containerStyle: {
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: colors.c400,
          justifyContent: 'center',
          alignItems: 'center',
        },
        iconStyle: {
          color: colors.n100,
        },
      }}
      leftIconContainerStyle={{
        display: currentStep === 0 ? 'none' : 'flex',
        marginLeft: 0,
        paddingLeft: 0,
        marginRight: 10,
      }}
      rightIcon={{
        name: currentStep === 0 ? 'add' : 'check',
        onPress: () => {
          if (currentStep === 0) {
            setCurrentStep(1);
          } else {
            handleSave();
          }
        },
        containerStyle: {
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: addButtonDisabled ? 'transparent' : colors.c200,
          justifyContent: 'center',
          alignItems: 'center',
        },
        disabled: addButtonDisabled,
        disabledStyle: {
          backgroundColor: 'transparent',
          opacity: 0.2,
        },
        iconStyle: {
          color: addButtonDisabled ? undefined : colors.n100,
        },
      }}
    />
  );
};

export default CabeItemInput;
