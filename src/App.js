import logo from './logo.svg';
import './App.css';
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
//import jwt_decode from 'jwt-decode';
import { useState } from 'react';

import fetchHelper from './fetchHelper';

const url =  'http://localhost:5000';

function App() {

  const [user, setUser] = useState(null); // Udaje o uzivateli ulozeny v localStorage
  const [token, setToken] = useState(null); // JWT token ulozeny v localStorage - zatim nevyuzit, jen pro testovani
  const [error, setError] = useState(""); // Chybova zprava zobrazena na strance (mimo konzoli)
  const [loadedData, setLoadedData] = useState(null); // Data nactena z uzivatelskeho profilu


  // LOGIN WITH GOOGLE
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(""); // Vymaze predchozi chyby
    try {
      const response = await fetch(`${url}/auth/google`, {
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

  // LOAD PROFILE -- pro testovaci ucely, zatim se nic neloaduje-----------------
  async function loadProfile() {
    const savedToken = token || localStorage.getItem('token');

    const response = await fetch(`${url}/profile`, {
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
    setLoadedData(data);
  }

  //-----------------------------------------------------------------------------


  // LOGOUT
  function logout() {
    setUser(null);
    setToken(null);
    setLoadedData(null);
    localStorage.removeItem('token');
  }


  // LOGIN WITH EMAIL
  const handleLogin = async (userData) => {
    setError(""); // Vymaze predchozi chyby
    try {
      const response = await fetch(`${url}/auth/email`, {
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
      const response = await fetch(`${url}/auth/register`, {
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

  async function updatePicture(updateData) {
    const formData = new FormData();
    formData.append('profilePicture', updateData.profilePicture);
    const newData = await fetchHelper.userSettings.updatePicture(formData)
    setUser(newData.newUserData.user);
  }
  async function updateName(updateData) {
    const newData = await fetchHelper.userSettings.updateName(updateData)
    setUser(newData.newUserData.user);
  }
  async function updatePassword(updateData) {
    setUser(await fetchHelper.userSettings.updatePassword(updateData));
  }
  async function deleteAccount() {
    setUser(await fetchHelper.userSettings.deleteAccount());
  }
  async function updateRole() {
    setUser(await fetchHelper.userSettings.updateRole());
  }

















  // stranka, pokud je uzivatel prihlasen
  if (user) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Welcome, {user.name}</h1>
        <p>{user.email}</p>

        {user.picture && (
          <img
            src={`${user.picture}?t=${new Date().getTime()}`}
            alt="Profile"
            width={80}
            style={{ borderRadius: "50%" }}
          />
        )}

        <div>
          <button onClick={loadProfile}>Load profile data</button>
          <button onClick={logout}>Log out</button>
          <button onClick={deleteAccount}>deleteAccount</button>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updateData = {
              newName: formData.get('newName'),
            };
            updateName(updateData);
            }}>
            <input type="text" name="newName" placeholder="new name" required />
            <button type="submit">Change name</button>
          </form>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updateData = {
              newPassword: formData.get('newPassword'),
              newPasswordRetype: formData.get('newPasswordRetype')
            };
            updatePassword(updateData);
            }}>
            <input type="password" name="newPassword" placeholder="Password" required />
            <input type="password" name="newPasswordRetype" placeholder="Retype password" required />
            <button type="submit">Change password</button>
          </form>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updateData = {
              profilePicture: formData.get('profilePicture')
            };
            updatePicture(updateData);
            }}>
            <input type="file" name="profilePicture" required />
            <button type="submit">Change profile picture</button>
          </form>

        </div>
        {loadedData && (
        <div style={{ marginTop: 20 }}>
          <h2>Profile Data:</h2>
          <pre>{JSON.stringify(loadedData, null, 2)}</pre>
        </div>
      )}
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
