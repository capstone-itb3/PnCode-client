import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Login() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');

    const navigate = useNavigate();

    async function loginAccount(event) {
        event.preventDefault();

        const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'   
            },
            body: JSON.stringify({
                username,
                password,
            })
        })

        const data = await response.json(); 
        if (data.user) {
            Cookies.set('token', data.user, { expires : 90 });
            alert ('Login successful');
            navigate('/dashboard');
            
        } else {
            alert('Incorrect username or password');
        } 
    };

    return (
        <main className='centering' style={{ marginTop: '50px' }} onSubmit={ loginAccount }>
            <form className='form-account'>
                <section className='head'>
                    <label>Log-in to <span style={{ color: '#0000ff' }} >CodLin</span></label>
                </section>
                <section className='body'>
                    <div className='input-form'>
                        <label>Username</label>
                        <input 
                            type='text'
                            value={username} 
                            placeholder='Enter your username'
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        /> 
                        <label>Password</label>
                        <input 
                            type='password' 
                            value={password} 
                            placeholder='Enter your password'
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /> 
                    </div>
                    <div className='input-btn'>
                        <input 
                            type='submit' 
                            value='Login'
                        />
                        <a href='/signup'>Create an account? </a>
                    </div>                
                </section>
            </form>
        </main>
    )
}

export default Login