import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import pnc from '../../pamantasan.jpg'

function ProfLogin() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const navigate = useNavigate();

    async function loginAccount(event) {
        event.preventDefault();

        const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/login/professor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'   
            },
            body: JSON.stringify({
                email,
                password,
            })
        })

        const data = await response.json(); 
        alert (data.message);

        if (data.status === 'ok' && data.token) {
            Cookies.set('token', data.token, { expires : 90 });
            navigate(`/dashboard/`);

        } else {
            console.log(data.message);
        } 
    };

    return (
        <div id='login-signup'>
            <main className='form-container items-center login'>
                <form className='form-account login' onSubmit={ loginAccount }>
                    <section className='head login'>
                        <label>Professor Log-in</label>
                    </section>
                    <div className='input-form login'>
                        <div className='input-div'>
                            <label>Email</label>
                            <input 
                                className='input-data'
                                type='text'
                                value={email} 
                                placeholder='Enter your email address'
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            /> 
                        </div>
                        <div className='input-div'>
                            <label>Password</label>
                            <input 
                                className='input-data'
                                type='password' 
                                value={password} 
                                placeholder='Enter your password'
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            /> 
                        </div>
                    </div>
                    <div className='input-btn'>
                        <input type='submit' value='Log In'/>
                    </div>
                </form>
            </main>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
        </div>

    )    
}

export default ProfLogin