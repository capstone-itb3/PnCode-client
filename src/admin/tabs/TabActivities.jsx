import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';
import convertTime from '../../components/dashboard/utils/convertTime';

function TabActivities({ admin, showId, setShowId }) {
  const [activites, setActivities] = useState(null);
  const [parent_class, setParentClass] = useState(null);

  const [results, setResults] = useState(activites);
  const selectedRef = useRef(null);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);
  
  const [activity_name, setActivityName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [open_time, setOpenTime] = useState('07:00');
  const [close_time, setCloseTime] = useState('20:59');

  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const init = async () => await getAllActivities();
    init();
  }, []);
  
  async function getAllActivities() {
    setLoading(true);
    if (foreign_name === 'class' && foreign_key) {
      const data = await admin.getAllActivities(foreign_key);
      setActivities(data.activities);
      setParentClass(data.class);
      doSearch(data.activities);
    } else {
      navigate('/admin/dashboard/classes/q=&f=');
    }
  }

  function doSearch (list) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!list) {
      return;
    }

    if (!(f === 'activity_id' || f === 'activity_name' || f === 'instructions' || f === '') === true) {
      navigate(`/admin/dashboard/class/${foreign_key}/activities/q=&f=`);
      return;
    }

    const filtered = list.filter((act) => {
      if (f === 'activity_id') {
        return act.activity_id.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'activity_name') {
        return act.activity_name.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'instructions') {
        return act.instructions.toLowerCase().includes(q.toLowerCase());

      } else {
        const combined = `${act.activity_id} ${act.activity_name} ${act.instructions}`.toLowerCase().includes(q.toLowerCase());
        return combined;
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    doSearch(activites);
  }, [query]);

  function searchActivities(e) {
    e.preventDefault();
    showForm ? setShowForm(null) : null;
    selectedRef.current = null;
    if (search === '' && filter === 'activity_id') {
      navigate(`/admin/dashboard/class/${foreign_key}/activities/q=&f=`);
      return;
    } 
    navigate(`/admin/dashboard/class/${foreign_key}/activities/q=${search}&f=${filter}`);
  }
  
  function selectActivity(activity) {
    if (selectedRef.current?.activity_id === activity.activity_id) {
      selectedRef.current = null;
      showForm ? setShowForm(null) : null;
      navigate(-1);
      return;
    }

    selectedRef.current = activity;
    navigate(`/admin/dashboard/class/${foreign_key}/activities/q=${activity.activity_id}&f=activity_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    selectedRef.current = null;

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }
    setShowForm('create');
    setActivityName('');
    setInstructions('');
    setOpenTime('07:00');
    setCloseTime('20:59');
    setLoading(false);
    setTimeout(() => document.getElementById('activity_name')?.focus(), 100);
  }

  async function showEditForm() {
    if (showForm === 'edit' || !selectedRef.current?.activity_id) {
      setShowForm(null);
      
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }
    
    setShowForm('edit');
    setActivityName(selectedRef.current.activity_name);
    setInstructions(selectedRef.current.instructions);
    setOpenTime(selectedRef.current.open_time);
    setCloseTime(selectedRef.current.close_time);

    setTimeout(() => document.getElementById('activity_name')?.focus(), 100);
  }

  async function reloadData() {
    await getAllActivities();
    showForm ? setShowForm(null) : null;
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null;
    navigate(`/admin/dashboard/class/${foreign_key}/activities/q=&f=`);
  }

  async function submitActivity(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createActivity(foreign_key, activity_name, instructions, open_time, close_time);
      if (res) {
        toast.success('Activity created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/class/${foreign_key}/activities/q=${res}&f=activity_id`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateActivity(selectedRef.current.activity_id, activity_name, instructions, open_time, close_time);
      if (res) {
        toast.success('Activity updated successfully!');
        await reloadData();
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteActivity() {
    if (confirm('Are you sure you want to delete this activity?')) {
      setLoading(true);
      const res = await admin.deleteActivity(selectedRef.current.activity_id);

      if (res) {
        toast.success('Activity deleted successfully!');
        await reloadData();
        navigate(-1);
        selectedRef.current = null;
      } else {
        setLoading(false);
      }
    }
  }

  return (
    <div id='manage-content' className='sub'>
      <div id='admin-loading-container'>
        {loading &&
          <div className='loading-line'>
              <div></div>
          </div>
        }
      </div>
      <div className='origin-div flex-row items-center'>
        {parent_class &&
          <>
            Class:
            <b><Link to={`/admin/dashboard/classes/q=${parent_class.class_id}&f=class_id`}>{parent_class.course_code} {parent_class.section}</Link></b>
            <label className='items-center'>&gt;</label>
            Activities
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Activities</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          <button className='admin-create items-center' onClick={showCreateForm}>
            Create Activity<FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchActivities(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='activity_id'>Activity ID</option>
              <option value='activity_name'>Activity Name</option>
              <option value='instructions'>Instructions</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for an activity...' />
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
              {showId && <th>Activity ID</th>}
              <th>Activity Name</th>
              <th>Instructions</th>
              <th>Open Time</th>
              <th>Close Time</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => {
              return (
              <tr 
                key={res.activity_id} 
                onClick={() => selectActivity(res)} 
                className={`${selectedRef.current?.activity_id === res.activity_id && 'selected'}`}>
                {showId && <td>{res.activity_id}</td>}
                <td>{res.activity_name}</td>
                <td><label className='single-line'>{res.instructions}</label></td>
                <td>{convertTime(res.open_time)}</td>
                <td>{convertTime(res.close_time)}</td>
              </tr>
            )})}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <>
            {new URLSearchParams(query).get('q') !== '' &&
              <div className='no-results'>
                <label>No results found for "{new URLSearchParams(query).get('q')}" in this class.</label>
              </div>
            }
            {new URLSearchParams(query).get('q') === '' &&
              <div className='no-results'>
                <label>This class doesn't have any activity.</label>
              </div>
            }
          </>
        }
      </div>
      }
      {selectedRef.current &&
        <div id='admin-info-display' className='flex-column'>
          <label><b>Activity ID:</b> {selectedRef.current.activity_id}</label>
          <label><b>Activity Name:</b> {selectedRef.current.activity_name}</label>
          <label><b>Class:</b> {parent_class.course_code} - {parent_class.section}</label>
          <label className='single-line'><b>Instructions:</b> {selectedRef.current.instructions}</label>
          <label><b>Open Time:</b> {convertTime(selectedRef.current.open_time)}</label>
          <label><b>Close Time:</b> {convertTime(selectedRef.current.close_time)}</label>
        </div>
      }            
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/classes/q=${selectedRef.current.class_id} ${parent_class.course_code} ${parent_class.section}&f=`)}>
            View Class
          </button>
          <button className='admin-view' onClick={() => navigate (`/admin/dashboard/activity/${selectedRef.current.activity_id}/assigned-rooms/q=&f=`)}>
            View Assigned Rooms
          </button>
          <button className='admin-edit' onClick={showEditForm}>
            Edit Activity
          </button>
          <button className='admin-delete' onClick={deleteActivity}>
            Delete Activity
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitActivity}>
        {showForm === 'create' && <h4>Create an activity for: <span>{parent_class?.course_code} {parent_class?.section}</span></h4>}
        {showForm === 'edit' && <h4>Edit activity:</h4>}
        <div className='form-space'/>
        <div className='flex-column'>
          <label>Activity Name</label>
          <input
            className='input-data'  
            id='activity_name'
            type='text' 
            value={activity_name} 
            onChange={e => setActivityName(e.target.value)} 
            required />
        </div>
        <div className='flex-column'>
          <label>Instructions</label>
          <textarea
            className='input-data'
            id='instructions'
            value={instructions}
            onChange={e => setInstructions(e.target.value)} 
            required />
          </div>
          <div className='two-column-grid'>
            <div className='flex-column'>
              <label>Open Time</label>
              <input
                type='time'
                className='input-data'
                value={open_time}
                onChange={e => setOpenTime(e.target.value)}
                required />
            </div>
            <div className='flex-column'>
              <label>Close Time</label>
              <input
                type='time'
                className='input-data'
                value={close_time}
                onChange={e => setCloseTime(e.target.value)}
                required />
            </div>
          </div>
          <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
            {showForm === 'edit' && 'Update'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default TabActivities