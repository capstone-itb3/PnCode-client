import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [ username, setUsername ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ conf_password, setConfPassword ] = useState('');

    const navigate = useNavigate();

    async function signupAccount(event) {
        event.preventDefault()

        if (password !== conf_password) {
            alert('Password and Re-typed Password doesn\'t match.');
        } else if (password.length < 8) {
            alert('Password must have more than 8 characters');
        } else {
            const response = await fetch(process.env.REACT_APP_BACKEND_URL + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'   
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                })
            });
            const data = await response.json();

            if(data.status === 'ok') {
                alert ('Sign up successful. now you can log in.');
                navigate('/login');
            } else if (data.status === 'invalid' || data.status === 'error') {
                alert (data.error);
            }
        }
    };

    return (
        <main className='centering' style={{ marginTop: '25px' }}>
            <form className='form-account' onSubmit={ signupAccount }>
                <section className='head'>
                    <label>Sign-up to <span style={{ color: '#0000ff' }} >CodLin</span></label>
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
                        <label>Email</label>
                        <input 
                            type='text'
                            value={email}
                            placeholder='Enter your email address'
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /> 
                        <label>Password</label>
                        <input 
                            type='password'
                            value={password}
                            placeholder='Enter your password'
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        /> 
                        <label>Confirm Password</label>
                        <input 
                            type='password'
                            value={conf_password}
                            placeholder='Re-type your password'
                            onChange={(e) => setConfPassword(e.target.value)}
                            required
                        /> 
                    </div>
                    <div className='input-btn'>
                        <input 
                            type='submit' 
                            value='Create Account' 
                        />
                        <a href='/login'>Log in? </a>
                    </div>                
                </section>
            </form>
        </main>
    )
}

export default Signup