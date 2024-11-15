import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'

function Login() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ warning, setWarning ] = useState(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const navigate = useNavigate();

    async function loginAccount(event) {
        event.preventDefault();
        setIsSubmitting(true);
        try {
            setWarning(null);

            const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/login', {
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
            
            if (data.status === 'ok' && data.token) {
                Cookies.set('token', data.token, { expires : 90 });
                navigate(`/dashboard/`);
                
            } else if (data.message) {
                setWarning(data.message);
            }
        } catch (e) {
            setWarning('An error occured while logging in. Please try again.');
            console.error(e);
        }
        setIsSubmitting(false);
    };

    return (
        <div id='login-signup'>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
            <main className='form-container items-center login'>
                <form className='form-account login' onSubmit={ loginAccount }>
                    <div className='items-center ccs-logo'>
                        <img src={ccs_logo} alt='ccs_logo' />
                    </div>
                    <section className='head items-center login'>
                        <label>Log-in to </label><img src={full_logo} alt='full-logo'/>
                    </section>
                    <div className='account-warning'>
                    {warning && 
                        <label className='label-warning'>{warning}</label>
                    }
                    </div>
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
                    <div className='input-btn login'>
                        <input  type='submit' 
                                value={isSubmitting ? 'Logging In...' : 'Log In'}
                                disabled={isSubmitting}/>                        
                        <label>New to PnCode? <a href='/signup'>Sign up</a></label>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default Login