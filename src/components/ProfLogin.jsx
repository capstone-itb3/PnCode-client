import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

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
            navigate(`/dashboard/${data.starting_course}/${data.starting_section}/all`);

        } else {
            console.log(data.message);
        } 
    };

    return (
        <main className='centering' style={{ marginTop: '50px' }} >
            <form className='form-account' style={{ padding: '30px 50px'  }} onSubmit={ loginAccount }>
                <section className='head flex-column'>
                    <label><span style={{ color: '#0000ff' }} >PnCode</span></label>
                    <label>Professor Log-in</label>
                </section>
                <section className='body'>
                    <div className='input-form'   style={{ gridTemplateColumns: 'auto' }}>
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
                        <input style={{ padding : '8px 60px' }} type='submit' value='Login'/>                        
                    </div>                
                </section>
            </form>
        </main>
    )
}

export default ProfLogin