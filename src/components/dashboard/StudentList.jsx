import React, { useEffect, useState } from 'react'
import { BsXLg } from 'react-icons/bs';
import { MdLoop } from 'react-icons/md';

function StudentList({user, class_info, showStudents}) {
    const [students, setStudents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [switchView, setSwitchView] = useState(false);

    useEffect(() => {
        getStudents();
    }, [class_info?.class_id]);

    async function getStudents() {
        const info = await user.getCourseStudents(class_info.class_id, 'all');
        if (info) {
            setStudents(info.students);
            setRequests(info.requests);
        }
    }

    async function removeStudent(uid) {
        const result = confirm('Are you sure you want to remove this student from this class?');

        if (result) {
            const info = await user.removeStudent(class_info.class_id, uid);
            if (info) {
                getStudents();
            }
        }
    }
    async function acceptRequest(uid) {
        const info = await user.acceptRequest(class_info.class_id, uid);
        if (info) {
            getStudents();
        }
    }
    async function rejectRequest(uid) {
        const info = await user.rejectRequest(class_info.class_id, uid);
        if (info) {
            getStudents();
        }
    }

    return (
        <div id='course-table' className={`flex-column items-center ${!showStudents && 'none'}`}>   
            <div className='student-list-button items-center'>
                <button className={`stud-btn ${switchView === false && 'active'}`} onClick={() => setSwitchView(false)}>
                    Students ({students.length})
                </button>
                <button className={`req-btn ${switchView === true && 'active'}`} onClick={() => setSwitchView(true)}>
                    Requests ({requests.length})
                </button>
                <button className='reload-btn items-center' onClick={getStudents}>
                    <MdLoop size={20}/>
                </button>
            </div>                 
            {students && !switchView &&
                <table className='student-list'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{student.last_name}, {student.first_name}</td>
                                    <td className='tbl-btn'>
                                        <button className='remove-btn' onClick={() => removeStudent(student.uid)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>                    
                </table>
            }
            {requests && switchView &&
                <table className='student-list'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((student, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{student.last_name}, {student.first_name}</td>
                                    <td className='tbl-btn'>
                                        <button className='accept-btn' onClick={() => acceptRequest(student.uid)}>
                                            Accept
                                        </button>
                                    </td>
                                    <td className='tbl-btn'>
                                        <button className='remove-btn' onClick={() => rejectRequest(student.uid)}>
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default StudentList