import { Component } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  saving = false;
  constructor(private appservice: AppService,
    private router: Router,
    private fb: FormBuilder,
    private sb: MatSnackBar) {
    this.form = this.fb.group({
      userid: ['', [Validators.required]], // User ID is required
      password: ['', [Validators.required]] // Password must be at least 6 characters
    });
  }

  login() {
    this.saving = true;
    let form_val = this.form.value;
    this.appservice.login({ username: form_val.userid, password: form_val.password })
      .subscribe({
        next: (response) => {
          this.sb.open("Login Successful", "", {
            duration: 2000,
            horizontalPosition: 'center', // You can customize this
            verticalPosition: 'bottom'   // You can customize this
          });
          this.saving = false;
          this.appservice.setToken(response.token); // Store the token
          this.router.navigate(['home']); // Redirect after login
          delete response.user._rev;
          delete response.user.password;
          sessionStorage.setItem('user', JSON.stringify(response.user));
        },
        error: (error) => {
          this.sb.open("Login Failed", "", {
            duration: 2000,
            horizontalPosition: 'center', // You can customize this
            verticalPosition: 'bottom'   // You can customize this
          });
          this.saving = false;
        }
      });
  }
}
