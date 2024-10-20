import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import { SearchUserList, searchDropdown } from './SearchList';
import ShowId from './ShowId';

function TabTeams({ admin, showId, setShowId }) {
  const [teams, setTeams] = useState(null);
  const [parent_class, setParentClass] = useState(null);

  const [results, setResults] = useState(teams);
  const selectedRef = useRef(null);
  const [team_members, setTeamMembers] = useState([]);

  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [showMemberList, setShowMemberList] = useState(false);
  
  const [team_name, setTeamName] = useState('');
  
  const [student_list, setStudentList] = useState(null);  
  const [member_input, setMemberInput] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => await getAllTeams();
    init();
  }, []);
  
  async function getAllTeams() {
    setLoading(true);

    if (foreign_name === 'class' && foreign_key) {
      const data = await admin.getAllTeams(foreign_key);
      setTeams(data.teams);      
      doSearch(data.teams);
      setParentClass(data.class);

    } else {
        navigate('/admin/dashboard/classes/q=&f=');
    }
  }

  function doSearch (list = []) {
    const q = new URLSearchParams(query).get('q') || '';
    const f = new URLSearchParams(query).get('f') || '';

    if (!list) {
      return;
    }

    if (!(f === 'team_id' || f === 'team_name' || f === 'member' || f === '') === true) {
      navigate('/admin/dashboard/classes/q=&f=');
      return;
    }

    const filtered = list.filter((t) => {
      const mem_combined = t.members.some((s) => {
        const uid = s.uid.toLowerCase().includes(q.toLowerCase());
        const name = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        const rev_name = `${s.last_name}, ${s.first_name}`.toLowerCase().includes(q.toLowerCase());
        const combined = `${s.uid} ${s.first_name} ${s.last_name}`.toLowerCase().includes(q.toLowerCase());
        return (uid || name || rev_name || combined);
      });

      if (f === 'team_id') {
        return t.team_id.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'team_name') {
        return t.team_name.toLowerCase().includes(q.toLowerCase());

      } else if (f === 'member') {
        return mem_combined;

      } else {
        const combined = `${t.team_id} ${t.team_name}`.toLowerCase().includes(q.toLowerCase());
        return (combined || mem_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    if (teams) {
      doSearch(teams);
    }
  }, [teams, query]);

  function searchTeams(e) {
    e.preventDefault();
    setShowForm(null);
    selectedRef.current = null;
    setTeamMembers([]);

    if (search === '' && filter === 'team_id') {
      navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
      return;
    }
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=${search}&f=${filter}`);
  }
  
  function selectTeam(team) {
    if (selectedRef.current?.team_id === team.team_id) {
      selectedRef.current = null;
      setTeamMembers([]);
      setShowMemberList(false);
      navigate(-1);
      return;
    }
    
    selectedRef.current = team;
    setTeamMembers(team.members);      
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=${team.team_id}&f=team_id`);
  }

  async function showCreateForm() {
    setLoading(true);
    setShowMemberList(false);
    selectedRef.current = null;
    setTeamMembers([]);

    if (showForm === 'create') {
      setShowForm(null);
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      setLoading(false);
      return;
    }

    setShowForm('create');
    setTeamName('');
    setLoading(false);
    setTimeout(() => document.getElementById('team_name')?.focus(), 100);
  }

  async function showEditForm() {
    setShowMemberList(false);

    if (showForm === 'edit' || !selectedRef.current?.team_name) {
      setShowForm(null);
      
      setTimeout(() => document.getElementById('search-bar')?.focus(), 100);
      return;
    }
    
    setShowForm('edit');
    setTeamName(selectedRef.current.team_name);

    setTimeout(() => document.getElementById('team_name')?.focus(), 100);
  }

  async function manageList() {
    setShowForm(null);
    setShowMemberList(!showMemberList);
    setMemberInput('');
    setShowStudents(false);
  }

  async function addMember(student) {
    setLoading(true);
    const res = await admin.addMember(selectedRef.current.team_id, student.uid);

    if (res) {
      toast.success('Student added to the team successfully.');
      await reloadData();
      setTeamMembers([...team_members, student]);
    } else {
      setLoading(false);
    }
  }
   
  async function removeMember(uid) {
    if (confirm('Are you sure you want to remove this member from the team?')) {
      setLoading(true);
      const res = await admin.removeMember(selectedRef.current.team_id, uid);

      if (res) {
        toast.success('Student is removed from the team.');
        await reloadData();
        setTeamMembers(team_members.filter(m => m.uid !== uid));
      } else {
        setLoading(false);
      }
    }
  }

  async function showDropdown(bool) {
    await searchDropdown(bool, setShowStudents, async () => setStudentList(await admin.getClassStudents(foreign_key)));
  }

  async function reloadData() {
    await getAllTeams();
    setShowForm(null);
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    setTeamMembers([]);
    navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
  }

  
  async function submitTeam(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createTeam(foreign_key, team_name);
      if (res) {
        toast.success('Team created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/class/${foreign_key}/teams/q=&f=`);
      } else {
        setLoading(false);
      }

    } else if (showForm === 'edit') {
      const res = await admin.updateTeam(selectedRef.current.team_id, team_name);
      if (res) {
        toast.success('Team updated successfully!');
        await reloadData();
        selectedRef.current = null;
        setTeamMembers([]);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteTeam() {
    if (confirm('Are you sure you want to delete this team?')) {
      setLoading(true);
      const res = await admin.deleteTeam(selectedRef.current.team_id, selectedRef.current.team_name);

      if (res) {
        toast.success('Team deleted successfully!');
        await reloadData();
        navigate(-1);
        selectedRef.current = null;
        setTeamMembers([]);
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
            Teams
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4>Teams</h4>
          <button className='items-center reload-btn' onClick={resetUI}>
            <MdLoop size={22}/>
          </button>
          <ShowId showId={showId} setShowId={setShowId}/>
        </div>
        <div className='flex-row items-center'>
          <button className='admin-create items-center' onClick={() => showCreateForm('new')}>
            Create <FiPlus size={17}/>
          </button>
        </div>
      </div>
      <div className='search-div flex-row items-center'>
        <form className='flex-row items-center width-100' onSubmit={(e) => searchTeams(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='team_id'>Team ID</option>
              <option value='team_name'>Team Name</option>
              <option value='member'>Member</option>
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a team...' />
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
              {showId && <th>Team ID</th>}
              <th>Team Name</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => (
              <tr 
                key={res.team_id} 
                onClick={() => selectTeam(res)} 
                className={`${selectedRef.current?.team_id === res.team_id && 'selected'}`}>
                {showId && <td>{res.team_id}</td>}
                <td>{res.team_name}</td>
                <td>{res.members.length}</td>
              </tr>
            ))}
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
                <label>This class doesn't have any team.</label>
              </div>
            }
          </>
        }
      </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/classes/q=${foreign_key}&f=class_id`)}>
            View Class
          </button>
          <button className='admin-view' onClick={() => navigate(`/admin/dashboard/team/${selectedRef.current.team_id}/assigned-rooms/q=&f=`)}>
            View Assigned Rooms
          </button>
          <button className='admin-manage' onClick={manageList}>
            Manage Members
          </button>
          <button className='admin-edit' onClick={showEditForm}>
            Edit Team Name
          </button>
          <button className='admin-delete' onClick={deleteTeam}>
            Delete Team
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitTeam}>
        {showForm === 'create' && <h4>Create a team for: <span>{parent_class?.course_code} {parent_class?.section}</span></h4>}
        {showForm === 'edit' && <h4>Edit team:</h4>}
        <div className='form-space'/>
        <div className='flex-column'>
          <label>Team Name</label>
          <input
            className='input-data'  
            id='section'
            type='text' 
            value={team_name} 
            onChange={e => setTeamName(e.target.value)} 
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
      {showMemberList && selectedRef.current &&
      <>
        <div className='admin-member-list-container flex-column'>
          <h4>Team Members</h4>
          <div className='admin-member-list flex-column'>
            {team_members.map((mem) => 
              <div className='item flex-row items-center' key={mem.uid}>
                <label className='single-line'>{mem.last_name} {mem.first_name}</label>
                <div className='items-center flex-row'>
                  <button className='remove-btn' onClick={() => removeMember(mem.uid)}>Remove</button>
                  <button className='info-btn' onClick={() => navigate(`/admin/dashboard/students/q=${mem.uid} ${mem.first_name} ${mem.last_name}&f=`)}>
                    Student Info
                  </button>
                </div>
              </div>
            )}
            {team_members.length === 0 &&
              <div className='item items-center'>
                <label className='single-line'>No team members.</label>
              </div>
            }
          </div>
        </div>
          <div className='sub-admin-form flex-row items-center'>
            <label>Add Member: </label>
            <div className='search-dropdown-input flex-row'>
              <input  
                type='text'
                className='input-data'
                value={member_input}
                onChange={e => setMemberInput(e.target.value)}
                onFocus={() => showDropdown(true)}
                onBlur={() => showDropdown(false)}
                placeholder='Add a student for this class...'
              />
              {showStudents && student_list &&
                <SearchUserList 
                  list={student_list.filter(sl => !team_members.some(st => st.uid === sl.uid))} 
                  filter={member_input} 
                  selectUser={addMember}/>
              }
            </div>
          </div>
      </>
      }
    </div>
  )
}

export default TabTeams