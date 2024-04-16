import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');

    const navigate = useNavigate();
    return (
        <div className='centering'>
            <main className='account'>
                <section className='head'>
                    <label>Sign-up to <span style={{ color: '#0000ff' }} >Codlin</span></label>
                </section>
                <section className='body'>
                    <div className='input-form'>
                        <label>Username</label>
                        <input type='text' placeholder='Enter your username'></input> 
                        <label>Password</label>
                        <input type='password' placeholder='Enter your password'></input> 
                        <label>Confirm Password</label>
                        <input type='password' placeholder='Re-type your password'></input> 
                    </div>
                    <div className='input-btn'>
                        <input type='button' value='Create Account'></input>
                        <a href='login'>Log in? </a>
                    </div>                
                </section>
            </main>
        </div>
    )
}

export default Signup