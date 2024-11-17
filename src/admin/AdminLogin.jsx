import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import pnc from '../../assets/pamantasan.jpg'
import full_logo from '../../assets/full_logo.jpg'
import ccs_logo from '../../assets/ccs_logo.jfif'
import { restrictStudent } from '../components/validator';


function AdminLogin() {    
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ hasAccess, setHasAccess ] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        !restrictStudent() ? setHasAccess(true) : navigate('/error/404');
    }, []);

    async function loginAccount(event) {
        event.preventDefault();

        const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/login/admin', {
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
            Cookies.set('token', data.token, { 
                expires: 1,
                domain: import.meta.env.VITE_APP_DOMAIN,
            });
            navigate(`/admin/dashboard/students/`);

        } else {
            console.log(data.message);
        } 
    };

    return (
        <>
        {hasAccess &&
        <div id='login-signup'>
            <main className='form-container items-center login'>
                <form className='form-account login' onSubmit={ loginAccount }>
                    <div className='items-center ccs-logo'>
                        <img src={ccs_logo} alt='ccs_logo'/>
                    </div>
                    <section className='head items-center admin'>
                        <img src={full_logo} alt='full-logo'/><label>Admin</label>
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
                    <div className='input-btn items-center'>
                        <input type='submit' value='Log In'/>
                    </div>
                </form>
            </main>
            <main className='photo-container'>
                <img src={pnc} alt='pnc' />
                <div id='orange-hue'/>
            </main>
        </div>
        }
        </>
    )    
}

export default AdminLogin