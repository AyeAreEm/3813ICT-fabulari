import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value || '';
  const hasUpper = /[A-Z]/.test(value);
  const longEnough = value.length >= 8;
  return hasUpper && longEnough ? null : { weakPassword: true };
}

export function passwordsMatch(passwordKey: string, confirmKey: string) {
  console.log("matching", passwordKey, confirmKey);
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value;
    const confirm = group.get(confirmKey)?.value;
    return password === confirm ? null : { mismatch: true };
  };
}
