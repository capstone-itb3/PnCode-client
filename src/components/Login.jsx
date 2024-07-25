import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function Login() {
    const [ student_id, setStudentId ] = useState('');
    const [ password, setPassword ] = useState('');

    const navigate = useNavigate();

    async function loginAccount(event) {
        event.preventDefault();

        const response = await fetch(import.meta.env.VITE_APP_BACKEND_URL + '/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'   
            },
            body: JSON.stringify({
                student_id,
                password,
            })
        })

        const data = await response.json(); 
        if (data.user) {
            Cookies.set('token', data.user, { expires : 90 });
            alert ('Login successful');
            navigate('/dashboard');
            
        } else {
            alert(data.message);
        } 
    };

    return (
        <main className='centering' style={{ marginTop: '50px' }} >
            <form className='form-account' style={{ padding: '30px 50px'  }} onSubmit={ loginAccount }>
                <section className='head'>
                    <label>Log-in to <span style={{ color: '#0000ff' }} >PnCode</span></label>
                </section>
                <section className='body'>
                    <div className='input-form'   style={{ gridTemplateColumns: 'auto' }}>
                        <div className='input-data'>
                            <label>Student ID</label>
                            <input 
                                type='text'
                                value={student_id} 
                                placeholder='Enter your Student ID'
                                onChange={(e) => setStudentId(e.target.value)}
                                required
                            /> 
                        </div>
                        <div className='input-data'>
                            <label>Password</label>
                            <input 
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
                        
                        <br></br><br></br>
                        <label>New to PnCode? <a href='/signup'>Sign up</a></label>
                    </div>                
                </section>
            </form>
        </main>
    )
}

export default Login