import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [ email, setEmail ] = useState('');
    const [ first_name, setFirstName ] = useState('');
    const [ last_name, setLastName ] = useState('');
    const [ year_list, setYearList ] = useState(null);
    const [ section_list, setSectionList ] = useState(null);
    const [ current_year, setCurrentYear ] = useState('1');
    const [ current_section, setCurrentSection ] = useState('IT-A');
    const [ password, setPassword ] = useState('');
    const [ conf_password, setConfPassword ] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function init() {
            try {
                const getUrl = `${import.meta.env.VITE_APP_BACKEND_URL}/api/available-sections`;
                const response = await fetch(getUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                const data = await response.json();
    
                if (data.status === 'ok') {
                    setYearList(data.data);
                    setSectionList(data.data[0].sections);
                    setCurrentYear(data.data[0].year);
                    setCurrentSection(data.data[0].sections[0]);
                
                } else {
                    alert('Error loading the page. Please reload the page.');
                    console.error(data.message);
                }    
            } catch (e) {
                alert('Error loading the page. Please reload the page.');
                console.error(e);
            }
        }
        init();
    }, []);

    function changeSectionList(selected) {
        setCurrentYear(selected);
        const section_options = year_list.find(item => item.year === selected);

        setSectionList(section_options.sections);
        setCurrentSection(section_options.sections[0]);
    }

    async function signupAccount(event) {
        event.preventDefault()
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
                    year: current_year,
                    section: current_section,
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
        <main className='centering' style={{ marginTop: '25px' }}>
            {!year_list && !section_list &&
                <div className='loading'>
                    <div className='loading-spinner'/>
                </div>
            }
            {year_list && section_list &&
                <form className='form-account' style={{ padding: '30px'  }} onSubmit={ signupAccount }>
                <section className='head'>
                    <label>Sign-up to <span style={{ color: '#0000ff' }} >PnCode</span></label>
                </section>
                <section className='body'>
                    <div className='input-form'>
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
                        <div></div>
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
                            <div className='option-select'>
                                <label>Year: </label>
                                <select value={current_year} onChange={(e) => changeSectionList(e.target.value)}>
                                    {year_list && year_list.map((item) => (
                                        <option key={item.year} value={item.year}>{item.year}</option>
                                    ))}
                                </select>
                                <label>Section: </label>
                                <select value={current_section} onChange={(e) => setCurrentSection(e.target.value)}>
                                    {section_list && section_list.map((section) => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='input-div' id='section-label'>
                            <label>*If you're an irregular student, you can ask a request to your professor to add/change your enrolled courses after signing up.</label>
                        </div>
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
                        <input style={{ padding : '8px 30px' }} type='submit' value='Create Account'/>
                        <label>Already have an account? <a href='/login'>Log in</a></label>
                    </div>                
                </section>
            </form>
        } 
        </main>
    )
}

export default Signup