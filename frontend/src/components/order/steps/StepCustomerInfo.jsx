import { Controller, useForm } from 'react-hook-form';
import { Button } from '../../ui/Button';
import { BatchSelectField } from '../BatchSelectField';
import { FacultySelectField } from '../FacultySelectField';
import { useOrderFlow } from '../../../hooks/useOrderFlow';

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/; // letters, spaces, . ' -
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/; // optional leading +, 7-15 digits

const nameRules = (label) => ({
  required: `${label} is required`,
  pattern: { value: NAME_PATTERN, message: `${label} can only contain letters` },
});

const FIELDS_BEFORE_FACULTY = [
  { name: 'fullName', label: 'Full Name', rules: nameRules('Full Name') },
  { name: 'indexOrNic', label: 'Index Number or NIC Number' },
  {
    name: 'telephone',
    label: 'Telephone Number',
    inputMode: 'tel',
    sanitize: 'phone',
    rules: {
      required: 'Telephone Number is required',
      pattern: {
        value: PHONE_PATTERN,
        message: 'Enter a valid phone number (digits and + only)',
      },
    },
  },
];
const FIELDS_AFTER_FACULTY = [
  { name: 'department', label: 'Department', rules: nameRules('Department') },
];

// Strip anything that is not a digit or +, and keep + only as a leading character.
function sanitizePhone(value) {
  const digits = value.replace(/[^\d+]/g, '').replace(/\+/g, '');
  return value.trimStart().startsWith('+') ? `+${digits}` : digits;
}

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
    const registration = register(
      field.name,
      field.rules ?? { required: `${field.label} is required` }
    );
    return (
      <div key={field.name}>
        <label htmlFor={field.name} className="mb-1 block text-sm text-mora-white/70">
          {field.label}
        </label>
        <input
          id={field.name}
          inputMode={field.inputMode}
          {...registration}
          onChange={(e) => {
            if (field.sanitize === 'phone') {
              e.target.value = sanitizePhone(e.target.value);
            }
            registration.onChange(e);
          }}
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
        <label className="mb-1 block text-sm text-mora-white/70">Batch</label>
        <Controller
          name="batch"
          control={control}
          rules={{ required: 'Batch is required' }}
          render={({ field }) => (
            <BatchSelectField value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.batch && <p className="mt-1 text-xs text-red-400">{errors.batch.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm text-mora-white/70">Faculty</label>
        <Controller
          name="faculty"
          control={control}
          rules={{ required: 'Faculty is required' }}
          render={({ field }) => (
            <FacultySelectField value={field.value} onChange={field.onChange} />
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
