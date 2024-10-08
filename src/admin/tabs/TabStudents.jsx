import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';

function TabStudents({ admin, showId, setShowId }) {
  const [students, setStudents] = useState(null);
  const [results, setResults] = useState(students);
  const selectedRef = useRef(null);
  
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { query } = useParams();
  const { state } = useLocation();

  const [showForm, setShowForm] = useState(null);
  const [email, setEmail] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllStudents();
    init();
  }, []);

  async function getAllStudents() {
    setLoading(true);
    const data = await admin.getAllStudents();
    setStudents(data);
    setResults(data);

    doSearch(data);
  }

  function doSearch(list) {
    const q = new URLSearchParams(query).get('q');
    const f = new URLSearchParams(query).get('f');

    if (q === null || !list) {
      return;
    }

    if (!(f === 'uid' || f === 'last_name' || f === 'first_name' || f === 'email' || f === '') === true) {
      navigate('/admin/dashboard/students/q=&f=');
      return;
    }

    const filtered = list.filter((s) => {
      const uid = String(s.uid).toLowerCase().includes(q.toLowerCase());
      const email = String(s.email).toLowerCase().includes(q.toLowerCase());


      if (f === 'uid') {
        return uid;

      } else if (f === 'last_name') {
        return `${s.last_name}`.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'first_name') {
        return `${s.first_name}`.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'email') {
        return email;

      } else {
        const lastToFirst = `${s.last_name} ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const firstToLast = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || lastToFirst || firstToLast || email || combined);
      }
    })

    setSearch(q);
    setFilter(f);
    setResults(filtered);
    setLoading(false);
  }

  useEffect(() => {
    doSearch(students);
  }, [query]);

  function searchStudents(e) {
    e.preventDefault();
    setShowForm(null);
    selectedRef.current = null;
    navigate(`/admin/dashboard/students/q=${search}&f=${filter}`);
  }
  
  function selectStudent(student) {
    if (selectedRef.current?.uid === student.uid) {
      selectedRef.current = null;
      navigate(-1);
      return;
    }
    selectedRef.current = student;
    navigate(`/admin/dashboard/students/q=${student.uid}&f=uid`);
  }

  function showCreateForm() {
    setLoading(true)
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    setShowForm('create');
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);
    setTimeout(() => document.getElementById('first_name')?.focus(), 100);
  }

  function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.uid) {
      setShowForm(null);
      
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }

    setShowForm('edit');
    setEmail(selectedRef.current.email); 
    setFirstName(selectedRef.current.first_name);
    setLastName(selectedRef.current.last_name);
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => document.getElementById('first_name')?.focus(), 100);
  }

  async function reloadData() {
    await getAllStudents();
    setShowForm(null);
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate('/admin/dashboard/students/q=&f=');
  }
  
  async function submitStudent(e) {
    e.preventDefault();
    setLoading(true)

    if (showForm === 'create') {
      const res = await admin.createStudent(email, first_name, last_name, password, confirmPassword);
      if (res) {
        toast.success('Student created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/students/q=${res}&f=uid`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateStudent(selectedRef.current.uid, email, first_name, last_name, password, confirmPassword);
      if (res) {
        toast.success('Student updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div id='admin-loading-container'>
        {loading &&
          <div className='loading-line'>
              <div></div>
          </div>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Students</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create <FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchStudents(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='uid'>UID</option>
              <option value='first_name'>First Name</option>
              <option value='last_name'>Last Name</option>
              <option value='email'>Email</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a student...' />
            <button type='submit'>
              <BsSearch size={17}/>
            </button>
          </div>
        </form>
      </div>
      {showForm !== 'create' &&
      <div id='admin-table-container'>
        {state &&
          <div className='origin-div items-center'> 
              <label><b>Origin:</b>{state.origin_name} <span>({state.origin_path})</span></label>
              <div className='items-center'>
                <button className='back' onClick={() => navigate(-1)}>Back</button>
              </div>
          </div>
        }
        <table id='admin-table'>
          <thead>
            <tr>
              {showId && <th>UID</th>}
              <th>Last Name</th>
              <th>First Name</th>
              <th>Email</th>
              </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.uid} 
                onClick={() => selectStudent(res)} 
                className={`${selectedRef.current?.uid === res.uid && 'selected'}`}>
                {showId && <td>{res.uid}</td>}
                <td>{res.last_name}</td>
                <td>{res.first_name}</td>
                <td>{res.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <div className='no-results'>
            <label>No results found for {new URLSearchParams(query).get('q')}.</label>
          </div>
        }
      </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/teams/q=${selectedRef.current.uid} ${selectedRef.current.first_name} ${selectedRef.current.last_name}&f=member`,
            { state: { origin_id: selectedRef.current.uid, origin_name: selectedRef.current.first_name + ' ' + selectedRef.current.last_name, origin_path: 'student' } }
          )}>
            View Student's Teams
          </button>
        }
        {selectedRef.current &&
          <button 
            className='admin-view' 
            onClick={() => navigate(`/admin/dashboard/classes/q=${selectedRef.current.uid} ${selectedRef.current.first_name} ${selectedRef.current.last_name}&f=student`, 
              { state: { origin_id: selectedRef.current.uid, origin_name: selectedRef.current.first_name + ' ' + selectedRef.current.last_name, origin_path: 'student' } }
            )}>
            View Student's Classes
          </button>
        }
        {selectedRef.current &&
          <button className='admin-edit' onClick={showEditForm}>
            Edit Student
          </button>
        }
        {selectedRef.current &&
          <button className='admin-delete'>
            Delete Student
          </button>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitStudent}>
        {showForm === 'create' && <h4>Create a student account:</h4>}
        {showForm === 'edit' && <h4>Edit student account:</h4>}
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
        <div></div>
        <div className='flex-column'>
          <label className='single-line'>{showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data' 
            type='password' 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            {...(showForm === 'create' ? { required: true } : {})}/>
        </div>
        <div className='flex-column'>
          <label className='single-line'>Repeat {showForm === 'edit' && 'New '}Password
            {showForm === 'edit' &&
              <span className='extra-info'>(Leave blank to remain unchanged.)</span>
            }
          </label>
          <input
            className='input-data' 
            type='password' 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            {...(showForm === 'create' ? { required: true } : {})}/>
        </div>
        <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
            {showForm === 'edit' && 'Update'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </>
  )
}

export default TabStudents


