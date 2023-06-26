import { AbstractControl, ValidatorFn } from '@angular/forms';
import { validate } from 'bitcoin-address-validation';

export function bitcoinAddressValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

        if (validate(control.value)) {
            return null;
        }
        return { ['bitcoin-address']: true };

    };
}
