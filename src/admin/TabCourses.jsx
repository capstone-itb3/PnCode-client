import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';


function TabCourses({ admin }) {
  const [courses, setCourses] = useState(null);
  const [results, setResults] = useState(courses);
  const selectedRef = useRef(null);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const navigate = useNavigate();
  const { query } = useParams();
  const [showForm, setShowForm] = useState(null);
  const [course_code, setCourseCode] = useState('');
  const [course_title, setCourseTitle] = useState('');

  useEffect(() => {
    const init = async () => await getAllCourses();
    init();
  }, []);

  async function getAllCourses() {
    const data = await admin.getAllCourses();
    setCourses(data);
    setResults(data);

    doSearch(data);
  }

  function doSearch(list) {
    const q = new URLSearchParams(query).get('q');
    const f = new URLSearchParams(query).get('f');

    if (q === null || !list) {
      return;
    }

    if (!(f === 'course_code' || f === 'course_title' || f === '') === true) {
      navigate('/admin/dashboard/courses/q=&f=');
      return;
    }

    const filtered = list.filter((s) => {
      const course_code = String(s.course_code).toLowerCase().includes(q.toLowerCase());
      const course_title = String(s.course_title).toLowerCase().includes(q.toLowerCase());
      
      if (f === 'course_code') {
        return course_code;

      } else if (f === 'course_title') {
        return course_title;

      } else {
        return (course_code || course_title);
      }
    })

    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
  }



  useEffect(() => {
    doSearch(courses);
  }, [query]);

  function searchCourses(e) {
    e.preventDefault();

    setShowForm(null);
    selectedRef.current = null;
    navigate(`/admin/dashboard/courses/q=${search}&f=${filter}`);
  }
  
  function selectCourse(course) {
    if (selectedRef.current === course) {
      selectedRef.current = null;
      navigate(`/admin/dashboard/courses/q=&f=`);
      return;
    }
    selectedRef.current = course;
    setShowForm(null);
    navigate(`/admin/dashboard/courses/q=${course.course_code}&f=course_code`);
  }

  function showCreateForm() {
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);

      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }

    setShowForm('create');
    setCourseCode('');
    setCourseTitle('');

    setTimeout(() => document.getElementById('course_code')?.focus(), 100);
  }

  function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.course_code) {
      setShowForm(null);
      
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }

    setShowForm('edit');
    setCourseCode(selectedRef.current.course_code);
    setCourseTitle(selectedRef.current.course_title);

    setTimeout(() => document.getElementById('course_code')?.focus(), 100);
  }

  async function reloadTable() {
    await getAllCourses();
    setShowForm(null);
    selectedRef.current = null;
    
    navigate(`/admin/dashboard/courses/q=`);
  }
  
  async function submitCourse(e) {
    e.preventDefault();

    if (showForm === 'create') {
      const result = await admin.createCourse(course_code, course_title);
      if (result) {
        toast.success('Course created successfully!');
        setShowForm(null);
        reloadTable();
      }


    } else if (showForm === 'edit') {
      const result = await admin.updateCourse(selectedRef.current.course_code, course_code, course_title);
      if (result) {
        toast.success('Course updated successfully!');
        setShowForm(null);
        reloadTable();
      }
    
    }
  }

  async function deleteCourse() {
    if (confirm('Are you sure you want to delete this course?')) {    
      const result = await admin.deleteCourse(selectedRef.current.course_code);

      if (result) {
        toast.success('Course deleted successfully!');
        setShowForm(null);
        reloadTable();
      }
    }
  }

  return (
    <>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Courses</h4>
          <button className='items-center reload-btn' onClick={reloadTable}>
            <MdLoop size={22}/>
          </button>
        </div>
        <div className='flex-row items-center'>
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create <FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchCourses(e)}>
        <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='course_code'>Course Code</option>
              <option value='course_title'>Course Title</option>
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
              <th>Course Code</th>
              <th>Course Title</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.course_code} 
                onClick={() => selectCourse(res)} 
                className={`${selectedRef.current?.course_code === res.course_code && 'selected'}`}>
                <td>{res.course_code}</td>
                <td>{res.course_title}</td>
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
      <div id='admin-table-buttons' className='long'>
        {selectedRef.current &&
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/classes/q=${selectedRef.current.course_code}&f=course_code`)}>
            View Classes Within this Course
          </button>
        }
        {selectedRef.current &&
          <button className='admin-edit' onClick={showEditForm}>
            Edit Course
          </button>
        }
        {selectedRef.current &&
          <button className='admin-delete' onClick={deleteCourse}>
            Delete Course
          </button>
        }
      </div>
      <form id='admin-form' className={`two-column-grid ${!showForm && 'none' }`} onSubmit={submitCourse}>
        {showForm === 'create' && <h4>Create a course:</h4>}
        {showForm === 'edit' && <h4>Edit course:</h4>}
        <div/>
        <div className='flex-column'>
          <label>Course Code</label>
          <input
            className='input-data'  
            id='course_code'
            type='text' 
            value={course_code} 
            onChange={e => setCourseCode(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Course Title</label>
          <input
            className='input-data'  
            id='course_title'
            type='text' 
            value={course_title} 
            onChange={e => setCourseTitle(e.target.value)} 
            required />
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

export default TabCourses