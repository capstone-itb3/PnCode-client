import React, { useState } from 'react';

function Login() {
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');


    return (
        <div className='centering'>
            <main className='account'>
                <section className='head'>
                    <label>Log-in to <span style={{ color: '#0000ff' }} >Codlin</span></label>
                </section>
                <section className='body'>
                    <div className='input-form'>
                        <label>Username</label>
                        <input type='text' placeholder='Enter your username'></input> 
                        <label>Password</label>
                        <input type='password' placeholder='Enter your password'></input> 
                    </div>
                    <div className='input-btn'>
                        <input type='button' value='Create Account'></input>
                    </div>                
                </section>
            </main>
        </div>
    )
}

export default Login