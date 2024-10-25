import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import './Navbar.css';

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true)
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    const showButton = () => {
        if (window.innerWidth <= 960) {
          setButton(false);
        } else {
          setButton(true);
        }
      };

      useEffect(() => {
        showButton();
      }, []);
    
      window.addEventListener('resize', showButton);
    return (
        <>
            <nav className='navbar'>
                <div className='navbar-container'>
                    <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>

                    <i class="fas fa-book"></i> LifeLine 
                    </Link>
                    <div className='menu-icon' onClick={handleClick}>
                        <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                    </div>
                    <ul className={click ? 'nav-menu active' : 'nav-menu'}>

                        <li className='nav-item'>
                            <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                                Home
                            </Link>
                        </li>

                        <li className='nav-item'>
                            <Link to='/calendars' className='nav-links' onClick={closeMobileMenu}>
                                Your Calendars
                            </Link>
                        </li>


                        <li className='nav-item'>
                            <Link to='/notes' className='nav-links' onClick={closeMobileMenu}>
                                Your meetings 
                            </Link>
                        </li>


                        <li className='nav-item'>
                            <Link to='/journals' className='nav-links' onClick={closeMobileMenu}>
                                Journal
                            </Link>
                        </li>
                        <li className='nav-item'>
                          <Link to='/moodsurvey' className='nav-links' onClick={closeMobileMenu}>
                               Mood Survey
                            </Link>
                        </li>

                    </ul>
                    {button && <Button buttonStyle='btn--outline'>Sign up</Button>}

                </div>
            </nav>
        </>
    )
}

export default Navbar
