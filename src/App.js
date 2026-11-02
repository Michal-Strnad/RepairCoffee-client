import logo from './logo.svg';
import './App.css';
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
//import jwt_decode from 'jwt-decode';
import { useState } from 'react';

function App() {

  const [user, setUser] = useState(null); // Udaje o uzivateli ulozeny v localStorage
  const [token, setToken] = useState(null); // JWT token ulozeny v localStorage - zatim nevyuzit, jen pro testovani
  const [error, setError] = useState(""); // Chybova zprava zobrazena na strance (mimo konzoli)


  // LOGIN WITH GOOGLE
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(""); // Vymaze predchozi chyby
    try {
      const response = await fetch('http://localhost:5000/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Google login failed');
      }
      console.log('Google login successful:', data);

      // data z jwt tokenu posílající z backendu (zatim nefunkcni, nahrazeno data.payload)
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);

    } catch (error) {
      console.error('Error during Google login:', error);
      setError("Google login failed");
    }

  }

  // LOAD PROFILE -- pro testovaci ucely, zatim se nic neloaduje
  /*async function loadProfile() {
    const savedToken = token || localStorage.getItem('token');

    const response = await fetch('http://localhost:5000/auth/profile', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${savedToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load profile');
    }

    const data = await response.json();
    setUser(data);
  }*/

  // LOGOUT
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }


  // LOGIN WITH EMAIL
  const handleLogin = async (userData) => {
    setError(""); // Vymaze predchozi chyby
    try {
      const response = await fetch('http://localhost:5000/auth/email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      console.log('Login successful:', data);

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);

    } catch (error) {
      console.error('Error during login:', error);
      setError(error.message || "Login failed");
    }
  };

  //REGISTER WITH EMAIL
  const handleRegister = async (userData) => {
    setError(""); // Vymaze predchozi chyby
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      console.log('Registration successful:', data);

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);

    } catch (error) {
      console.error('Error during register:', error);
      setError(error.message || "Registration failed");
    }
  };

  // stranka, pokud je uzivatel prihlasen
  if (user) {
    console.log('User is logged in:', user);
    return (
      <main style={{ padding: 24 }}>
        <h1>Welcome, {user.name}</h1>
        <p>{user.email}</p>

        {user.picture && (
          <img
            src={user.picture}
            alt="Profile"
            width={80}
            style={{ borderRadius: "50%" }}
          />
        )}

        <div>
          {/*<button onClick={loadProfile}>Load profile from API</button>*/}
          <button onClick={logout}>Log out</button>
        </div>
      </main>
    );
  }

  //prihlasovaci stranka - defaultni zobrazeni
  return (
    <main style={{ padding: 24 }}>
    <h1>Sign in</h1>

    <h1>Email login</h1>
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const userData = {
        email: formData.get('email'),
        password: formData.get('password')
      };
      handleLogin(userData);
    }}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Log in</button>
    </form>

    <h1>Email register</h1>
    <form onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        passwordRetype: formData.get('passwordRetype')
      };
      handleRegister(userData);
    }}>
      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <input type="password" name="passwordRetype" placeholder="Retype password" required />
      <button type="submit">Register</button>
    </form>

    <h1>Google login</h1>
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => setError("Google login failed")}
    />

    {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}

export default App;
