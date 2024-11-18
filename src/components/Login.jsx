import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import api from '../api';

function Login() {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ warning, setWarning ] = useState(null);
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const navigate = useNavigate();

    async function loginAccount(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setWarning(null);
    
        try {
            await api.post('/api/login', { email, password });            
            navigate('/dashboard');            
        } catch (e) {
            setWarning(e?.response?.data?.message || 'Something went wrong. Please try again later.');
            console.error(e.message);
        }
        setIsSubmitting(false);
    }
    
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
                    <div className='input-btn items-center'>
                        <input  type='submit' 
                                value={isSubmitting ? 'Logging In...' : 'Log In'}
                                disabled={isSubmitting}/>                        
                        <label>New to PnCode? <a href='/signup'>Sign up</a></label>
                    </div>
                    <div className='input-btn items-center'>
                        <a href='/forgot-password'>Forgot Password?</a>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default Login