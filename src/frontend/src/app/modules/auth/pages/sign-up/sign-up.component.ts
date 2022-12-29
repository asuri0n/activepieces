import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../common/service/authentication.service';

import {
	containsLowercaseCharacter,
	containsNumber,
	containsSpecialCharacter,
	containsUppercaseCharacter,
} from 'src/app/modules/common/validators';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { fadeIn400ms } from 'src/app/modules/common/animation/fade-in.animations';
export interface UserInfo {
	first_name: FormControl<string>;
	last_name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
	track_events: FormControl<boolean>;
	news_letter: FormControl<boolean>;
}
@Component({
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
	animations: [fadeIn400ms],
})
export class SignUpComponent {
	registrationForm: FormGroup<UserInfo>;
	loading = false;
	tokenError = false;
	emailExists = false;
	emailChanged = false;
	signUp$: Observable<void>;
	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		public authenticationService: AuthenticationService
	) {
		this.registrationForm = this.formBuilder.group({
			first_name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
			last_name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
			email: new FormControl<string>('', {
				nonNullable: true,
				validators: [Validators.email, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'), Validators.required],
			}),
			password: new FormControl<string>('', {
				nonNullable: true,
				validators: [
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(64),
					containsSpecialCharacter(),
					containsUppercaseCharacter(),
					containsLowercaseCharacter(),
					containsNumber(),
				],
			}),
			track_events: new FormControl<boolean>(false, { nonNullable: true }),
			news_letter: new FormControl<boolean>(false, { nonNullable: true }),
		});
	}

	signUp() {
		if (this.registrationForm.valid && !this.loading) {
			this.loading = true;
			const request = this.registrationForm.getRawValue();
			this.signUp$ = this.authenticationService.signUp(request).pipe(
				tap(response => {
					this.authenticationService.saveToken(response);
					this.authenticationService.saveUser(response);
				}),
				switchMap(() => {
					return this.authenticationService.saveNewsLetterSubscriber(request.email);
				}),
				catchError(err => {
					console.error(err);
					return of(void 0);
				}),
				tap(() => {
					this.router.navigate(['/flows']);
				}),
				map(() => void 0)
			);
		}
	}

	getPasswordError(errorName: string) {
		return this.registrationForm.get('password')?.hasError(errorName);
	}

	isPasswordInputIsFocused(passwordInputElement: HTMLInputElement) {
		return passwordInputElement == document.activeElement;
	}
}