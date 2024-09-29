import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { LuPencilLine } from 'react-icons/lu';
import { BsSearch } from 'react-icons/bs';
import { FiPlus } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';


function TabStudents({ admin, students, getAllStudents }) {
  const [results, setResults] = useState(students);
  const [search, setSearch] = useState('');
  const queryRef = useRef(new URLSearchParams(window.location.search));
  const navigate = useNavigate();
  const { query } = useParams();
  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const q = new URLSearchParams(query).get('q');

    if (q === null) {
      setResults(students);
      return;
    }

    const filter = students.filter((s) => {
      const uid = String(s.uid).toLowerCase().includes(q.toLowerCase());
      const lastToFirst = `${s.last_name} ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
      const firstToLast = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
      const email = String(s.email).toLowerCase().includes(q.toLowerCase());
      return (uid || lastToFirst || firstToLast || email);
    })

    setSearch(q);
    setResults(filter);
  }, [query]);

  function searchStudents(e) {
    e.preventDefault();
    navigate(`/admin/dashboard/students/q=${search}`);
  }
  
  function showCreateForm() {
    setShowForm('create');
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');

    document.body.scrollTo(0, document.body.scrollHeight);
    document.getElementById('first_name').focus();
  }

  async function reloadTable() {
    await getAllStudents();
    navigate(`/admin/dashboard/students`);
  }
  async function createStudent(e) {
    e.preventDefault();
  }

  return (
    <>
      <div className='manage-header flex-row items-center'>
        <h4>Students</h4>
        <button className='items-center reload-btn' onClick={showCreateForm}>
          <FiPlus size={20}/>
        </button>
        <button className='items-center reload-btn' onClick={reloadTable}>
          <MdLoop size={20}/>
        </button>
      </div>
      <div className='search-div flex-row items-center'>
          <form className='flex-row items-center width-100' onSubmit={(e) => searchStudents(e)}>
            <input 
              type='text' 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a student...' />
            <button type='submit'>
              <BsSearch size={17}/>
            </button>
          </form>
      </div>
      <table className='admin-table'>
        <thead>
          <tr>
            <th>UID</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Email</th>
            </tr>
        </thead>
        <tbody>
          {results.map(res => (
            <tr key={res.uid}>
              <td>{res.uid}</td>
              <td>{res.last_name}</td>
              <td>{res.first_name}</td>
              <td>{res.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <form id='admin-form' className={`${!showForm && 'none' }`} onSubmit={createStudent}>
        {showForm === 'create' && <h4>Create a student account:</h4>}
        <div/>
        <div className='flex-column'>
          <label>First Name</label>
          <input
            className='input-data'  
            id='first_name'
            type='text' 
            value={first_name} 
            onChange={e => setFirstName(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Last Name</label>
          <input
            className='input-data' 
            type='text' 
            value={last_name} 
            onChange={e => setLastName(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Email</label>
          <input
            className='input-data' 
            type='text' 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required />
        </div>
        {showForm === 'create' && <div></div>}
        <div className='flex-column'>
          <label>Password</label>
          <input
            className='input-data' 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required />
        </div>
        {showForm === 'create' && 
          <div className='flex-column'>
            <label>Repeat Password</label>
            <input
              className='input-data' 
              type='password' 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required />
          </div>
        }
        <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>Create</button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </>
  )
}

export default TabStudents