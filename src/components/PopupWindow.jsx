import React, { useEffect, useRef } from 'react'
import { VscError } from 'react-icons/vsc';
import { BsCheckCircle } from 'react-icons/bs';

export function ConfirmPopup({title, message, onConfirm, confirm_text, onCancel, cancel_text}) {
    const confirmPopupRef = useRef(null);
    const submitRef = useRef(null);

    useEffect(() => {
        submitRef.current.focus();

        setTimeout(() => {
            confirmPopupRef.current.style.transform = 'scale(1)';
        }, 50);        
    }, [])

    function handleConfirm() {
        confirmPopupRef.current.style.transform = 'scale(0.3)';

        setTimeout(() => {
            submitRef.current.blur();
            onConfirm();
        }, 50)
    }

    function handleCancel() {
        confirmPopupRef.current.style.transform = 'scale(0.3)';

        setTimeout(() => {
            onCancel();
        }, 50)
    }

    return (
        <div id='popup-gray-background' className='items-start'>
            <div id='create-popup' ref={confirmPopupRef} className='window flex-column'>
                <div className='scroll'>
                    <h4 className='head'>{title}</h4>
                    <div className='content'>
                        {message}
                    </div>
                    <div className='flex-row footer'>
                        <button id='popup-submit' ref={submitRef} onClick={handleConfirm}>{confirm_text}</button>
                        <button id='popup-cancel' onClick={handleCancel}>{cancel_text}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export function AlertPopup({title, message, type, onOkay, okay_text}) {
    const alertPopupRef = useRef(null);
    const submitRef = useRef(null);

    useEffect(() => {
        submitRef.current.focus();

        setTimeout(() => {
            alertPopupRef.current.style.transform = 'scale(1)';
        }, 50);        
    }, [])

    function handleOkay() {        
        alertPopupRef.current.style.transform = 'scale(0.3)';

        setTimeout(() => {
            submitRef.current.blur();
            onOkay();
        }, 50)
    }

    return (
        <div id='popup-gray-background' className='items-start'>
            <div id='create-popup' ref={alertPopupRef} className='window flex-column'>
                <div className='scroll'>
                    <h4 className='head'>{title}</h4>
                    <div className='content items-center'>
                        {type === 'error' &&
                            <VscError size={30} color='red' className='alert-icon'/>
                        }
                        {type === 'success' &&
                            <BsCheckCircle size={30} color='green' className='alert-icon'/>
                        }
                        {message}
                    </div>
                    <div className='flex-row footer'>
                        <button id='popup-submit' ref={submitRef} onClick={handleOkay}>{okay_text}</button>
                    </div>
                </div>
            </div>
        </div>
    )
}