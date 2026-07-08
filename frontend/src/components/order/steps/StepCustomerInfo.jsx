import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { useOrderFlow } from '../../../hooks/useOrderFlow';

const FIELDS_BEFORE_FACULTY = [
  { name: 'fullName', label: 'Full Name' },
  { name: 'indexOrNic', label: 'Index Number or NIC Number' },
  { name: 'telephone', label: 'Telephone Number' },
  { name: 'batch', label: 'Batch' },
];
const FIELDS_AFTER_FACULTY = [{ name: 'department', label: 'Department' }];

const FACULTY_VALUES = [
  'Faculty of Engineering',
  'Faculty of IT',
  'Faculty of Medicine',
  'Faculty of Architecture',
  'Faculty of Business',
  'NDT',
];
const FACULTY_OPTIONS = FACULTY_VALUES.map((f) => ({ value: f, label: f }));

export function StepCustomerInfo() {
  const {
    state: { customer },
    dispatch,
  } = useOrderFlow();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues: customer });

  function onSubmit(values) {
    dispatch({ type: 'SET_CUSTOMER_INFO', payload: values });
    dispatch({ type: 'SET_STEP', step: 3 });
  }

  function renderField(field) {
    return (
      <div key={field.name}>
        <label htmlFor={field.name} className="mb-1 block text-sm text-mora-white/70">
          {field.label}
        </label>
        <input
          id={field.name}
          {...register(field.name, { required: `${field.label} is required` })}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-mora-white placeholder-white/30 focus:border-mora-gold focus:outline-none"
        />
        {errors[field.name] && (
          <p className="mt-1 text-xs text-red-400">{errors[field.name].message}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-semibold text-mora-white">Your Information</h3>
      {FIELDS_BEFORE_FACULTY.map(renderField)}
      <div>
        <label className="mb-1 block text-sm text-mora-white/70">Faculty</label>
        <Controller
          name="faculty"
          control={control}
          rules={{ required: 'Faculty is required' }}
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange} options={FACULTY_OPTIONS} />
          )}
        />
        {errors.faculty && <p className="mt-1 text-xs text-red-400">{errors.faculty.message}</p>}
      </div>
      {FIELDS_AFTER_FACULTY.map(renderField)}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          className="flex-1"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
        >
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
}
