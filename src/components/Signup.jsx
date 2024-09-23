import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pnc from '../../pamantasan.jpg'

function Signup() {
    const [ email, setEmail ] = useState('');
    const [ first_name, setFirstName ] = useState('');
    const [ last_name, setLastName ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ conf_password, setConfPassword ] = useState('');
    const navigate = useNavigate();

    async function signupAccount(event) {
        event.preventDefault();
        try {
            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'   
                },
                body: JSON.stringify({
                    email,
                    first_name,
                    last_name,
                    password,
                    conf_password
                })
            });
            const data = await response.json();
            alert(data.message);
    
            if(data.status === 'ok') {
                navigate('/login');
            } else {
                console.error(data.message);
            }    
        } catch (e) {
            alert('Error signing up. Please try again.');
            console.error(e);
        }
    };
    
    return (
        <div id='login-signup'>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
            <main className='form-container signup'>
                <form className='form-account signup' onSubmit={ signupAccount }>
                    <section className='head signup'>
                        <label>Create an account</label>
                    </section>
                    <div className='input-form'>
                        <div className='input-div'>                        
                            <label>First Name</label>
                            <input 
                                className='input-data'
                                type='text'
                                value={first_name}
                                placeholder='Enter your first name'
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            /> 
                        </div>
                        <div className='input-div'>                        
                            <label>Last Name</label>
                            <input 
                                className='input-data'
                                type='text'
                                value={last_name}
                                placeholder='Enter your last name'
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div> 
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
                        <div/>
                        <div className='input-div'>                        
                            <label>Password</label>
                            <input 
                                className='input-data'
                                type='password'
                                value={password}
                                placeholder='Enter your password'
                                required
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className='input-div'>
                            <label>Confirm Password</label>
                            <input 
                                className='input-data'
                                type='password'
                                value={conf_password}
                                placeholder='Re-type your password'
                                onChange={(e) => setConfPassword(e.target.value)}
                                required
                            /> 
                        </div>
                    </div>
                    <div className='input-btn'>
                        <input type='submit' value='Create Account'/>
                        <label>Already have an account? <a href='/login'>Log in</a></label>
                    </div>                
                </form>
            </main>
        </div>
    )
}

export default Signup