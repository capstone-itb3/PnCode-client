import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import { FiPlus, FiFilter } from 'react-icons/fi';
import { FaChevronRight } from 'react-icons/fa';
import { MdLoop } from 'react-icons/md';
import toast from 'react-hot-toast';
import ShowId from './ShowId';
import { initSocket } from '../../socket';

function TabAssignedRooms({ admin, showId, setShowId, rowDate }) {
  const [assigned_rooms, setAssignedRooms] = useState(null);
  const [parent_class, setParentClass] = useState(null);
  const [parent_activity, setParentActivity] = useState(null);
  const [parent_team, setParentTeam] = useState(null);

  const [results, setResults] = useState(null);
  const selectedRef = useRef(null);
  
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  
  const navigate = useNavigate();
  const { foreign_name, foreign_key, query } = useParams();

  const [showForm, setShowForm] = useState(null);
  const [showComponents, setShowComponents] = useState(false);

  const [team_id, setTeamId] = useState('');

  const [team_list, setTeamList] = useState(null);

  const [loading, setLoading] = useState(true);
    
  useEffect(() => {
    const init = async () => await getAllAssignedRooms();
    init();
  }, []);
  
  async function getAllAssignedRooms() {
    setLoading(true);

    if (foreign_name && foreign_key) {
      if (foreign_name === 'teams' || foreign_name === 'activities') {
        const data = await admin.getAllAssignedRooms(foreign_name, foreign_key);
        setAssignedRooms(data.rooms);
        doSearch(data.rooms);
        setParentClass(data.class);
        setParentActivity(data.activity);
        setParentTeam(data.team);

      } else {
        navigate('/admin/dashboard/classes/q=&f=');
      }
    } else {
      navigate('/admin/dashboard/classes/q=&f=');
    }
  }

  function doSearch (list) {
    const q = new URLSearchParams(query).get('q');
    const f = new URLSearchParams(query).get('f');
    
    if (q === null || !list) {
      return;
    }

    if (!(f === 'room_id' || f === 'activity' || f === 'team' || f === '') === true) {
      navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
      return;
    }

    const filtered = list.filter((asr) => {
      const act_combined = `${asr?.activity_id} ${asr?.activity_name}`.toLowerCase().includes(q.toLowerCase());
      const team_combined = `${asr.owner_id} ${asr.room_name}`.toLowerCase().includes(q.toLowerCase());

      if (f === 'room_id') {
        return asr.room_id.toLowerCase().includes(q.toLowerCase());
        
      } else if (f === 'activity') {
        return act_combined;

      } else if (f === 'team') {
        return team_combined;
        
      } else {
        const room_combined = `${asr.room_id} ${asr.room_name}`.toLowerCase().includes(q.toLowerCase());
        return (room_combined || team_combined || act_combined);
      }
    })
 
    setSearch(q);
    setFilter(`${f ? f : ''}`);
    setResults(filtered);
    setLoading(false);
  } 

  useEffect(() => {
    doSearch(assigned_rooms);
  }, [query]);

  function searchAssignedRooms(e) {
    e.preventDefault();
    setShowForm(null);
    selectedRef.current = null;
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${search}&f=${filter}`);
  }
  
  function selectRoom(room) {
    if (selectedRef.current?.room_id === room.room_id) {
      selectedRef.current = null;
      navigate(-1);
      return;
    }

    selectedRef.current = room;
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${room.room_id}&f=room_id`);
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

    setTeamList(await admin.getAllTeams());
    setShowForm('create');
    setLoading(false);
    setTimeout(() => document.getElementById('activity_name')?.focus(), 100);
  }

  async function reloadData() {
    await getAllAssignedRooms();
    setShowForm(null);
  }

  async function resetUI() {
    await reloadData();
    selectedRef.current = null; 
    navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=&f=`);
  }

  async function submitAssignedRoom(e) {
    e.preventDefault();
    setLoading(true);

    if (showForm === 'create') {
      const res = await admin.createAssignedRoom(foreign_key, team_id);
      if (res) {
        toast.success('New room created successfully!');
        await reloadData();
        navigate(`/admin/dashboard/${foreign_name}/${foreign_key}/assigned-rooms/q=${res}&f=room_id`);
      } else {
        setLoading(false);
      }
    }
  }

  async function deleteAssignedRoom() {
    if (confirm('Are you sure you want to delete this activity?')) {
      setLoading(true);
      const res = await admin.deleteAssignedRoom(selectedRef.current.room_id);

      if (res) {
        toast.success('Room deleted successfully!');
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
          <label className='items-center'><FaChevronRight size={17}/></label>
        </>
        }
        {foreign_name === 'activities' && parent_activity &&
          <>
            Activity:
            <b><Link to={`/admin/dashboard/classes/${parent_activity.class_id}/activities/q=${parent_activity.activity_id}&f=`}>{parent_activity.activity_name}</Link></b>
            <label className='items-center'><FaChevronRight size={17}/></label>
            Assigned Rooms
          </>
        }
        {foreign_name === 'teams' && parent_team &&
          <>
            Team: 
            <b><Link to={`/admin/dashboard/classes/${parent_team.class_id}/teams/q=${parent_team.team_id}&f=`}>{parent_team.team_name}</Link></b>
            <label className='items-center'><FaChevronRight size={17}/></label>
            Assigned Rooms
          </>
        }
      </div>
      <div className='manage-header flex-row items-center'>
        <div className='flex-row items-center'>
          <h4 className='normal'>Assigned Rooms</h4>
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
        <form className='flex-row items-center width-100' onSubmit={(e) => searchAssignedRooms(e)}>
          <div className='flex-row items-center'>
            <FiFilter size={25}/>
            <select id='filter-drop' value={filter} onChange={e => setFilter(e.target.value)}>
              <option value=''>All</option>
              <option value='room_id'>Room ID</option>
              {foreign_name === 'activities' && <option value='team'>Team</option>}
              {foreign_name === 'teams' && <option value='activity'>Activity</option>}
            </select>
          </div>
          <div className='flex-row width-100 items-center'>
            <input 
              type='text' 
              id='search-bar'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search for a room...' />
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
              {showId && <th>Room ID</th>}
              <th>Room Name</th>
              {foreign_name === 'teams' && <th>Activity</th>}
              {foreign_name === 'activities' && <th>Team</th>}
            </tr>
          </thead>
          <tbody>
            {results && results.map(res => {
              return (
              <tr 
                key={res.room_id} 
                onClick={() => selectRoom(res)} 
                className={`${selectedRef.current?.room_id === res.room_id && 'selected'}`}>
                {showId && <td>{res.room_id}</td>}
                <td>{res.room_name}</td>
                {foreign_name === 'teams' && <td>{res.activity_name}</td>}
                {foreign_name === 'activities' && <td>{res.room_name.slice(0, -7)}</td>}
              </tr>
            )})}
          </tbody>
        </table>
        {results && results.length < 1 &&
          <>
            {new URLSearchParams(query).get('q') !== '' &&
              <div className='no-results'>
                <label>No results found for "{new URLSearchParams(query).get('q')}".</label>
              </div>
            }
            {new URLSearchParams(query).get('q') === '' &&
              <div className='no-results'>
                <label>This class doesn't have any rooms yet.</label>
              </div>
            }
          </>
        }
      </div>
      }
      <div id='admin-table-buttons'>
        {selectedRef.current &&
        <>
          {foreign_name === 'teams' &&
            <button className='admin-view'>
              View Activity
            </button>
          }
          {foreign_name === 'activities' &&
            <button className='admin-view'>
              View Team
            </button>
          }
          <button className='admin-view'>
            View Files
          </button>
          <button className='admin-manage' onClick={() => setShowComponents(!showComponents)}>
            Manage Components
          </button>
          <button className='admin-delete' onClick={deleteAssignedRoom}>
            Delete Assigned Room
          </button>
        </>
        }
      </div>
      <form id='admin-form' className={`flex-column ${!showForm && 'none' }`} onSubmit={submitAssignedRoom}>
        {showForm === 'create' && <h4>Create a room for:</h4>}
          <div className='flex-column'>
            <label>Team</label>
            <select 
              value={team_id} 
              className='input-data'  
              onChange={e => setTeamId(e.target.value)} 
              required>
              <option value=''>Select Team</option>
              {team_list && team_list.map(tm => (
                <option 
                  key={tm.team_id} 
                  value={tm.team_id} 
                  className='single-line'>
                    {tm.team_name}
                </option>
              ))}
            </select>
          </div>
          <div id='admin-form-buttons'>
          <button className='file-add-btn' type='submit'>
            {showForm === 'create' && 'Create'}
          </button>
          <button className='file-cancel-btn' type='button' onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      </form>
      {showComponents && selectedRef.current &&
        <div className='room-components-container flex-row'>
          <RoomComponents room={selectedRef.current} admin={admin}/>
        </div>
      }
    </div>
  )
}

function RoomComponents({room, admin}) {
  const socketRef = useRef(null);
  const notepadRef = useRef(null);
  const providerRef = useRef(null);
  const [roomUsers, setRoomUsers] = useState(null);
  const [cursorColor, setCursorColor] = useState(null);
  const [feedback_list, setFeedbackList] = useState(null);
  const [new_feedback, setNewFeedback] = useState('');

  useEffect(() => {
    async function init() {
      socketRef.current = await initSocket();
      socketRef.current.emit('join_room', { 
        room_id: room.room_id, 
        user_id: 101,
        position: 'Admin'
      })

      socketRef.current.on('room_users_updated', ({ users }) => {
        setRoomUsers(users);
        setCursorColor(users.find((u) => u.user_id === 101)?.cursor);
      });
    }
    init();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off('room_users_updated');
      }
    }
  }, [room?.room_id]);

  useEffect (() => {
      notepadRef.current ? notepadRef.current?.destroy() : null;
      providerRef.current ? providerRef.current?.destroy() : null;

      if (socketRef.current && cursorColor && roomUsers) {
        async function init() {
          return new Promise((resolve) => {
            socket.emit('load_notepad', {
              room_id: room.room_id,
            });
        
            socket.on('notepad_loaded', ({ notes }) => {
              resolve(notes);
            });
          });

          socket.emit('join_editor', {
            file_id: file.file_id,
            user_id: user.uid,
          });
      
          socket.on('editor_users_updated', ({ users }) => {
            setEditorUsers(users);
            resolve(users);
          });  
        }
        init().then((notes) => {
          const ydoc = new Y.Doc();
    
          providerRef.current = new WebsocketProvider(import.meta.env.VITE_APP_WEBSOCKET, 
            `${room.room_id}-notepad`, 
            ydoc
          );
          
          providerRef.current.awareness.setLocalStateField('user', {
            userId: 101,
            name: 'PnCode Admin',
            color: cursorColor.color,
          });
    
          providerRef.current.on('synced', () => {
              const ytext = ydoc.getText('codemirror');
              let initialContent = ytext.toString();
              if (((initialContent === '' || initialContent === null) && editorUsers.length === 1)) {
                  ydoc.transact(() => {
                      ytext.insert(0, notes);
                  });
                  initialContent = notes;
              }

              const state = EditorState.create({
                  doc: initialContent,
                  extensions: [
                      keymap.of([...yUndoManagerKeymap, { key: 'Enter', run: (view) => {
                          view.dispatch(view.state.replaceSelection('\n'))
                          return true
                          }}
                      ]),
                      setup(),
                      yCollab(ytext, providerRef.current.awareness),
                      EditorView.lineWrapping,
                      EditorView.updateListener.of(e => {
                          if (e.docChanged) {
                              socket.emit('save_notepad', {
                                  room_id: room.room_id,
                                  content: e.state.doc.toString(),
                              });
                          }
                      }),
                  ]
              });

              const notepad = document.getElementById('notepad');
              notepad.innerHTML = '';

              notepadRef.current = new EditorView({ state, parent: (notepad) });
              notepadRef.current.focus();
          });
        })
      }
      return () => {
        providerRef.current ? providerRef.current?.destroy() : null;
        notepadRef.current ? notepadRef.current?.destroy() : null;
        socket.off('notepad_loaded');
    };
  }, [room?.room_id, socketRef.current]);
}

export default TabAssignedRooms