import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import { SearchUserList, searchDropdown } from './SearchList';
import ShowId from './ShowId';

function TabClasses({ admin, showId, setShowId }) {
  const [classes, setClasses] = useState(null);
  const [results, setResults] = useState(classes);
  const selectedRef = useRef(null);
  const [class_students, setClassStudents] = useState([]);
  const [class_requests, setClassRequests] = useState([]);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showRequestList, setShowRequestList] = useState(false);
  
  const [course_code, setCourseCode] = useState('');
  const [section, setSection] = useState('');
  const [professor_uid, setProfessorUid] = useState('');
  
  const [professor_list, setProfessorList] = useState(null);
  const [course_list, setCourseList] = useState(null);

  const [student_list, setStudentList] = useState(null);  
  const [student_input, setStudentInput] = useState('');
  const [showStudents, setShowStudents] = useState(false);

  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const init = async () => await getAllClasses();
    init();
  }, []);
  
  async function getAllClasses() {
    setLoading(true);
    const data = await admin.getAllClasses();
    setClasses(data);
    setResults(data);
    
    doSearch(data);
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!(f === 'class_id' || f === 'course_code' || f === 'section' || f === 'professor' || f === 'student' || f === 'request' || f === '') === true || !list) {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }

    const filtered = list.filter((cl) => {
      const prof_combined = `${cl.professor_uid} ${cl.professor}`.toLowerCase().includes(q.toLowerCase());
      const stud_combined = cl.students.some((s) => {
        const uid = s.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      });
      const req_combined = cl.requests.some((r) => {
        const uid = r.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${r.first_name} ${r.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${r.last_name}, ${r.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${r.uid} ${r.first_name} ${r.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      })

      if (f === 'class_id') {
        return cl.class_id.toLowerCase().includes(q.toLowerCase());
      } else if (f === 'course_code') {
        return cl.course_code.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'section') {
        return cl.section.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'professor') {
        return prof_combined;
      
      } else if (f === 'student') {
        return stud_combined;

      } else if (f === 'request') {
        return req_combined;

      } else {
        const combined = `${cl.class_id} ${cl.course_code} ${cl.section}`.toLowerCase().includes(q.toLowerCase());
        return (combined || prof_combined || stud_combined || req_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    if (classes) {
      doSearch(classes);
    }
  }, [classes, query]);

  function searchClasses(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;
    setClassStudents([]);
    setClassRequests([]);

    if (search === '' && filter === 'class_id') {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }
    navigate(`/admin/dashboard/classes/q=${search}&f=${filter}`);
  }
  
  function selectClass(class_data) {
    if (selectedRef.current?.class_id === class_data.class_id) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      setClassStudents([]);
      setClassRequests([]);
      setShowStudentList(false);
      setShowRequestList(false);
      navigate(-1);
      return;
    }

    selectedRef.current = class_data;
    setClassStudents(class_data.students);
    setClassRequests(class_data.requests);
    navigate(`/admin/dashboard/classes/q=${class_data.class_id}&f=class_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    setShowStudentList(false);
    setShowRequestList(false);
    selectedRef.current = null;
    setClassStudents([]);
    setClassRequests([]);

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    setProfessorList(await admin.getAllProfessors());
    setCourseList(await admin.getAllCourses());
    setShowForm('create');
    setCourseCode('');
    setSection('');
    setProfessorUid('');
    setLoading(false);
    setTimeout(() => document.getElementById('course_code')?.focus(), 100);
  }

  async function showEditForm() {
    setShowStudentList(false);
    setShowRequestList(false);

    if (showForm === 'edit' || !selectedRef.current?.course_code) {
      setShowForm(null);
      return;
    }
    
    setProfessorList(await admin.getAllProfessors());
    setCourseList(await admin.getAllCourses());
    setShowForm('edit');
    setCourseCode(selectedRef.current.course_code);
    setSection(selectedRef.current.section);
    setProfessorUid(selectedRef.current.professor_uid);

    setTimeout(() => {
      const buttons = document.querySelector('#admin-table-buttons');
      window.scrollTo({ top: buttons?.scrollHeight + 500 , behavior: 'smooth' });
    }, 200)
  }

  function manageList(manage) {
    showForm ? setShowForm(null) : null;
    if (manage === 'students') {
      setShowStudentList(!showStudentList);
      setShowRequestList(false);
    } else if (manage === 'requests') {
      setShowRequestList(!showRequestList);
      setShowStudentList(false);
    }
    
    setTimeout(() => {
      const buttons = document.querySelector('#admin-table-buttons');
      window.scrollTo({ top: buttons?.scrollHeight + 500 , behavior: 'smooth' });
    }, 200)
  }

  async function addStudent(student) {
    setLoading(true);
    const res = await admin.addStudent(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Student added successfully.');
      await reloadData();
      setClassStudents([...class_students, student]);
    } else {
      setLoading(false);
    }
  }
   
  async function removeStudent(uid) {
    if (confirm('Are you sure you want to remove this student from this class?')) {
      setLoading(true);
      const res = await admin.removeStudent(selectedRef.current.class_id, uid);

      if (res) {
        toast.success('Student is rejected from the class.');
        await reloadData();
        setClassStudents(class_students.filter(s => s.uid !== uid));
      } else {
        setLoading(false);
      }
    }
  }

  async function acceptRequest(student) {
    setLoading(true);
    const res = await admin.acceptRequest(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Accepted request successfully.');
      await reloadData();
      setClassStudents([...class_students, student]);
      setClassRequests(class_requests.filter(r => r.uid !== student.uid));
    } else {
      setLoading(false);
    }
  }

  async function rejectRequest(student) {
    setLoading(true);
    const res = await admin.rejectRequest(selectedRef.current.class_id, student.uid);

    if (res) {
      toast.success('Rejected request successfully.');
      await reloadData();
      setClassRequests(class_requests.filter(r => r.uid !== student.uid));
    } else {
      setLoading(false);
    }
  }

  async function showDropdown(bool) {
    await searchDropdown(bool, setShowStudents, async () => setStudentList(await admin.getAllStudents()))
  }


  async function reloadData() {
    await getAllClasses();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    setClassStudents([]);
    setClassRequests([]);
    navigate('/admin/dashboard/classes/q=&f=');
  }
  
  async function submitClass(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createClass(course_code, section, professor_uid);
      if (res) {
        toast.success('Class created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/classes/q=${res}&f=class_id`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateClass(selectedRef.current.class_id, course_code, section, professor_uid);
      if (res) {
        toast.success('Class updated successfully!');
        await reloadData();
        selectedRef.current = null;
        setClassStudents([]);
        setClassRequests([]);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteClass() {
    if (confirm('Are you sure you want to delete this class?')) {

      if (confirm('Deleting this class will result in deletion of all teams, activities, rooms, and files related to this class. Do you want to continue?')) {
        setLoading(true);
        const res = await admin.deleteClass(selectedRef.current.class_id);
  
        if (res) {
          toast.success('Class deleted successfully!');
          await reloadData();
          navigate(-1);
          selectedRef.current = null;
          setClassStudents([]);
          setClassRequests([]);
        } else {
          setLoading(false);
        }
      }
    }
  }

  return (
    <div id='manage-content'>
      <div id='admin-loading-container'>
        {loading &&
          <div className='loading-line'>
              <div></div>
          </div>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Classes</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Class<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchClasses(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='class_id'>Class ID</option>
              <option value='course_code'>Course Code</option>
              <option value='section'>Section</option>
              <option value='professor'>Professor</option>
              <option value='student'>Student</option>
              <option value='request'>Request</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a course...' />
            <button type='submit'>
              <BsSearch size={17}/>
            </button>
          </div>
        </form>
      </div>
      {showForm !== 'create' &&
      <div id='admin-table-container'>
        <table id='admin-table'>
          <thead>
            <tr>
              {showId && <th>Class ID</th>}
              <th>Course Code</th>
              <th>Section</th>
              <th>Professor</th>
              <th>Students</th>
              <th>Requests</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.class_id} 
                onClick={() => selectClass(res)} 
                className={`${selectedRef.current?.class_id === res.class_id && 'selected'}`}>
                {showId && <td>{res.class_id}</td>}
                <td>{res.course_code}</td>
                <td>{res.section}</td>
                <td>{res.professor}</td>
                <td>{res.students.length}</td>
                <td>{res.requests.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <div className='no-results'>
            <label>No results found for "{new URLSearchParams(query).get('q')}".</label>
          </div>
        }
      </div>
      }
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Class ID:</b> {selectedRef.current.class_id}</label>
          <label><b>Course Code:</b> {selectedRef.current.course_code}</label>
          <label><b>Section:</b> {selectedRef.current.section}</label>
          <label><b>Professor:</b> {selectedRef.current.professor} {selectedRef.current.professor_uid !== '' && <Link to={`/admin/dashboard/professors/q=${selectedRef.current.professor_uid}&f=uid`}>(View Info)</Link>}</label>
          <label><b>No. of Students:</b> {selectedRef.current.students?.length}</label>
          <label><b>No. of Requests:</b> {selectedRef.current.requests?.length}</label>
        </div>
      }      
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/class/${selectedRef.current.class_id}/teams/q=&f=`)}>
            View Teams
          </button>
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/class/${selectedRef.current.class_id}/activities/q=&f=`)}>
            View Activities
          </button>
          <button className='admin-manage' onClick={() => manageList('students')}>
            Manage Students
          </button>
          <button className='admin-manage' onClick={() => manageList('requests')}>
            Manage Requests 
          </button>
          <button className='admin-edit' onClick={showEditForm}>
            Edit Class
          </button>
          <button className='admin-delete' onClick={deleteClass}>
            Delete Class
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitClass}>
        {showForm === 'create' && <h4>Create a class:</h4>}
        {showForm === 'edit' && <h4>Edit class:</h4>}
        <div/>
        <div className='flex-column'>
          <label>Select Course Code</label>
          <select value={course_code} onChange={e => setCourseCode(e.target.value)} required>
            <option value=''>Select Course Code</option>
            {course_list && course_list.map(cou => (
              <option 
                key={cou.course_code} 
                value={cou.course_code} 
                className='single-line'>
                {cou.course_code} - {cou.course_title}
              </option>
            ))}
          </select>
        </div>
        <div className='flex-column'>
          <label>Section</label>
          <input
            className='input-data'  
            id='section'
            type='text' 
            value={section} 
            onChange={e => setSection(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Select Professor</label>
          <select value={professor_uid} onChange={e => setProfessorUid(e.target.value)} required>
            <option value=''>Select Professor</option>
            {professor_list && professor_list.map(prof => (
              <option 
                key={prof.uid} 
                value={prof.uid}
                className='single-line'>
                {prof.first_name} {prof.last_name}
              </option>
            ))}
          </select>
        </div>
        <div></div>
        <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
            {showForm === 'edit' && 'Update'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
      {showStudentList && selectedRef.current &&
      <>
        <div className='admin-member-list-container flex-column'>
          <h4>Students</h4>
          <div className='admin-member-list flex-column'>
            {class_students.map((stud) => 
              <div className='item flex-row items-center' key={stud.uid}>
                <label className='single-line'>{stud.last_name} {stud.first_name}</label>
                <div className='items-center flex-row'>
                  <button className='remove-btn' onClick={() => removeStudent(stud.uid)}>Remove</button>
                  <button className='info-btn' onClick={() => navigate(`/admin/dashboard/students/q=${stud.uid} ${stud.first_name} ${stud.last_name}&f=`, 
                    { state: { origin_id: selectedRef.current.class_id, origin_name: `${selectedRef.current.course_code} ${selectedRef.current.section}`, origin_path: 'Class' } }
                  )}>
                    Student Info
                  </button>
                </div>
              </div>
            )}
            {class_students.length === 0 &&
              <div className='item items-center'>
                <label className='single-line'>No students.</label>
              </div>
            }
          </div>
        </div>
          <div className='sub-admin-form flex-row items-center'>
            <label>Add Student: </label>
            <div className='search-dropdown-input flex-row'>
              <input  
                type='text'
                className='input-data'
                value={student_input}
                onChange={e => setStudentInput(e.target.value)}
                onFocus={() => showDropdown(true)}
                onBlur={() => showDropdown(false)}
                placeholder='Add a student for this class...'
              />
              {showStudents && student_list &&
                <SearchUserList 
                  list={student_list.filter(sl => !class_students.some(st => st.uid === sl.uid))} 
                  filter={student_input} 
                  selectUser={addStudent}/>
              }
            </div>
          </div>
      </>
      }
      {showRequestList && selectedRef.current &&
        <div className='admin-member-list-container flex-column'>
          <h4>Requests</h4>
          <div className='admin-member-list flex-column'>
            {class_requests.map((req) =>
              <div className='item flex-row items-center' key={req.uid}>
                <label className='single-line'>{req.last_name} {req.first_name}</label>
                <div className='items-center flex-row'>
                  <button className='accept-btn' onClick={() => acceptRequest(req)}>Accept</button>
                  <button className='remove-btn' onClick={() => rejectRequest(req)}>Reject</button>
                  <button className='info-btn' onClick={() => navigate(`/admin/dashboard/students/q=${req.uid} ${req.first_name} ${req.last_name}&f=`, 
                    { state: { origin_id: selectedRef.current.class_id, origin_name: `${selectedRef.current.course_code} ${selectedRef.current.section}`, origin_path: 'Class' } }
                  )}>
                    Student Info
                  </button>
                </div>
              </div>
            )}
            {class_requests.length === 0 &&
              <div className='item items-center'>
                <label className='single-line'>No requests.</label>
              </div>
            }
          </div>
        </div>
      }
    </div>
  )
}

export default TabClasses
