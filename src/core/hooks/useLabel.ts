export function useLabel() {
  const getLabelByComponent = async (data: Record<string, any>) => {
    const { value, component, formData, row } = data;

    console.log(value, component, formData, row);

    if (component.config.dataType === 'options' && component.config.options) {
      return component.config.options.find((option) => option.value === value)?.label || value;
    }

    return value;
  };

  return {
    getLabelByComponent,
  };
}
